import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { FileUp, ChevronDown, ChevronRight, Search, X, ExternalLink, Plus, Minus } from 'lucide-react';

const URLAnalysisDashboard = () => {
  const [urlData, setUrlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [pageTitle, setPageTitle] = useState('URL Analysis Dashboard');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    // Load the saved title from localStorage when the component mounts
    const savedTitle = localStorage.getItem('urlAnalysisDashboardTitle');
    if (savedTitle) {
      setPageTitle(savedTitle);
    }
  }, []);

  const handleTitleChange = (e) => {
    setPageTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    // Save the new title to localStorage
    localStorage.setItem('urlAnalysisDashboardTitle', pageTitle);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const processURLs = (urls, indexabilityData) => {
    const folderStructure = {};
    const globalParams = {};
    const secondLevelFolders = {};

    urls.forEach((url, index) => {
      try {
        const parsedUrl = new URL(url);
        const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment);

        let level1 = pathSegments[0] || 'root';
        let level2 = pathSegments[1] || 'root';
        let level3 = pathSegments[2] || 'root';

        const isIndexable = indexabilityData ? indexabilityData[index] : true;

        // First level folder processing
        if (!folderStructure[level1]) {
          folderStructure[level1] = { count: 0, nonIndexableCount: 0, subfolders: {}, params: {}, paramSamples: {}, sampleUrl: '' };
        }
        folderStructure[level1].count++;
        if (!isIndexable) folderStructure[level1].nonIndexableCount++;
        folderStructure[level1].sampleUrl = url;

        // Second level folder processing
        if (!secondLevelFolders[level2]) {
          secondLevelFolders[level2] = { count: 0, nonIndexableCount: 0, subfolders: {}, params: {}, paramSamples: {}, sampleUrl: '' };
        }
        secondLevelFolders[level2].count++;
        if (!isIndexable) secondLevelFolders[level2].nonIndexableCount++;
        secondLevelFolders[level2].sampleUrl = url;

        // Third level folder processing
        if (!secondLevelFolders[level2].subfolders[level3]) {
          secondLevelFolders[level2].subfolders[level3] = { count: 0, nonIndexableCount: 0, params: {}, paramSamples: {}, sampleUrl: '' };
        }
        secondLevelFolders[level2].subfolders[level3].count++;
        if (!isIndexable) secondLevelFolders[level2].subfolders[level3].nonIndexableCount++;
        secondLevelFolders[level2].subfolders[level3].sampleUrl = url;

        parsedUrl.searchParams.forEach((value, key) => {
          // Global params
          if (!globalParams[key]) {
            globalParams[key] = { count: 0, folders: {} };
          }
          globalParams[key].count++;
          if (!globalParams[key].folders[level1]) {
            globalParams[key].folders[level1] = { count: 0, sampleUrl: url };
          }
          globalParams[key].folders[level1].count++;

          // Folder-specific params
          if (!folderStructure[level1].params[key]) {
            folderStructure[level1].params[key] = 0;
            folderStructure[level1].paramSamples[key] = url;
          }
          folderStructure[level1].params[key]++;

          if (!folderStructure[level1].subfolders[level2].params[key]) {
            folderStructure[level1].subfolders[level2].params[key] = 0;
            folderStructure[level1].subfolders[level2].paramSamples[key] = url;
          }
          folderStructure[level1].subfolders[level2].params[key]++;
        });
      } catch (error) {
        console.error('Invalid URL:', url);
      }
    });

    return { folderStructure, globalParams, secondLevelFolders };
  };

  const onDrop = useCallback((acceptedFiles) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    const file = acceptedFiles[0];
    console.log('File details:', file.name, file.size, file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      console.log('First 100 characters of file:', csvData.slice(0, 100));

      Papa.parse(csvData, {
        complete: (results) => {
          console.log('Parsing complete', results);
          try {
            if (!results || !results.data) {
              throw new Error('Parsing result is undefined or has no data');
            }
            const urls = results.data
              .flatMap(row => row) // Flatten the array in case of multi-column data
              .filter(url => url && typeof url === 'string' && url.trim() !== '');
            console.log('Filtered URLs:', urls.slice(0, 5)); // Log first 5 URLs for debugging
            console.log('Total URLs found:', urls.length);
            if (urls.length === 0) {
              throw new Error('No valid URLs found in the file');
            }
            const indexabilityData = results.data[0].length > 1 
              ? results.data.map(row => row[1]?.toLowerCase() === 'true')
              : null;
            const processedData = processURLs(urls, indexabilityData);
            setUrlData(processedData);
            setLoading(false);
          } catch (error) {
            console.error('Error processing file:', error);
            setError('Error processing file: ' + error.message);
            setLoading(false);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setError('Error parsing CSV: ' + error.message);
          setLoading(false);
        },
        worker: true,
        skipEmptyLines: true,
      });
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setError('Error reading file: ' + error.message);
      setLoading(false);
    };

    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Helper function to format numbers with thousands separators
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to truncate text
  const truncate = (str, n) => {
    return str.length > n ? str.substr(0, n-1) + '...' : str;
  };

  const FolderDetails = ({ folder, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedParams, setExpandedParams] = useState({});
    const [expandedSubfolders, setExpandedSubfolders] = useState({});

    const sortedSubfolders = Object.entries(folder.subfolders)
      .sort((a, b) => b[1].count - a[1].count);

    const toggleParam = (param) => {
      setExpandedParams(prev => ({ ...prev, [param]: !prev[param] }));
    };

    const toggleSubfolder = (subName) => {
      setExpandedSubfolders(prev => ({ ...prev, [subName]: !prev[subName] }));
    };

    const highlightParameter = (url, param) => {
      const regex = new RegExp(`(${param}=([^&]+))`, 'g');
      return url.replace(regex, '<span class="bg-yellow-200">$1</span>');
    };

    const nonIndexablePercentage = folder.nonIndexableCount !== undefined && folder.count > 0
      ? ((folder.nonIndexableCount / folder.count) * 100).toFixed(2)
      : null;

    return (
      <div className="mb-4 border rounded p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-semibold ml-2" title={name}>{truncate(name, 25)}</span>
          <span className="ml-2 text-gray-600">({formatNumber(folder.count)} URLs)</span>
          {nonIndexablePercentage !== null && (
            <span className="ml-2 text-xs text-red-500">({nonIndexablePercentage}% non-indexable)</span>
          )}
        </div>
        {isOpen && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Sample URL: {folder.sampleUrl}</p>
            
            {/* Parameters section */}
            {Object.keys(folder.params).length > 0 && (
              <div className="mt-4">
                <p className="font-semibold">Parameters:</p>
                <ul className="list-disc ml-4">
                  {Object.entries(folder.params)
                    .sort((a, b) => b[1] - a[1])
                    .map(([param, count]) => (
                      <li key={param} className="text-sm mb-2">
                        <div className="flex items-center justify-between">
                          <span>{param}: {formatNumber(count)}</span>
                          <button 
                            onClick={() => toggleParam(param)}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            {expandedParams[param] ? 'Hide' : 'Show'} Sample
                          </button>
                        </div>
                        {expandedParams[param] && (
                          <div className="text-xs text-gray-500 mt-1">
                            Sample: 
                            <span 
                              dangerouslySetInnerHTML={{
                                __html: highlightParameter(folder.paramSamples[param], param)
                              }}
                            />
                            <a 
                              href={folder.paramSamples[param]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 text-blue-500 hover:text-blue-700 inline-block"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            
            {/* Subfolders table */}
            {sortedSubfolders.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Subfolders:</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Name</th>
                      <th className="text-right p-2">Count</th>
                      <th className="text-right p-2">Share</th>
                      {nonIndexablePercentage !== null && (
                        <th className="text-right p-2">Non-Indexable</th>
                      )}
                      <th className="text-right p-2">Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubfolders.map(([subName, subFolder]) => (
                      <React.Fragment key={subName}>
                        <tr className="border-t">
                          <td className="p-2" title={subName}>{truncate(subName, 25)}</td>
                          <td className="text-right p-2">{formatNumber(subFolder.count)}</td>
                          <td className="text-right p-2">
                            {((subFolder.count / folder.count) * 100).toFixed(2)}%
                          </td>
                          {nonIndexablePercentage !== null && (
                            <td className="text-right p-2 text-xs">
                              {subFolder.nonIndexableCount !== undefined && subFolder.count > 0
                                ? `${((subFolder.nonIndexableCount / subFolder.count) * 100).toFixed(2)}%`
                                : 'N/A'}
                            </td>
                          )}
                          <td className="text-right p-2">
                            <button 
                              onClick={() => toggleSubfolder(subName)}
                              className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                              {expandedSubfolders[subName] ? 'Hide' : 'Show'}
                            </button>
                          </td>
                        </tr>
                        {expandedSubfolders[subName] && (
                          <tr>
                            <td colSpan={nonIndexablePercentage !== null ? 5 : 4} className="p-2 bg-gray-50">
                              <div className="text-xs text-gray-600">
                                Sample URL: 
                                <span className="ml-1">{subFolder.sampleUrl}</span>
                                <a 
                                  href={subFolder.sampleUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-1 text-blue-500 hover:text-blue-700 inline-block"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const Summary = ({ data }) => {
    const totalUrls = Object.values(data).reduce((sum, folder) => sum + folder.count, 0);
    const totalNonIndexable = Object.values(data).reduce((sum, folder) => sum + (folder.nonIndexableCount || 0), 0);
    const hasIndexabilityData = totalNonIndexable > 0;

    const topFolders = Object.entries(data)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    return (
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <p>Total URLs analyzed: {formatNumber(totalUrls)}</p>
        {hasIndexabilityData && (
          <p className="text-sm text-gray-600">
            Non-indexable: {formatNumber(totalNonIndexable)} ({((totalNonIndexable / totalUrls) * 100).toFixed(2)}%)
          </p>
        )}
        <p>Number of top-level folders: {formatNumber(Object.keys(data).length)}</p>
        <div className="mt-4">
          <h3 className="font-semibold">Top 5 folders:</h3>
          <ul className="list-disc ml-6">
            {topFolders.map(([name, folder]) => (
              <li key={name} className="mb-1">
                <span title={name}>{truncate(name, 25)}</span>: {formatNumber(folder.count)} URLs ({((folder.count / totalUrls) * 100).toFixed(2)}%)
                {hasIndexabilityData && folder.nonIndexableCount !== undefined && (
                  <span className="text-sm text-gray-600 ml-2">
                    (Non-indexable: {((folder.nonIndexableCount / folder.count) * 100).toFixed(2)}%)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const ParameterReport = ({ globalParams }) => {
    const [isOpen, setIsOpen] = useState(false);

    const sortedParams = Object.entries(globalParams)
      .sort((a, b) => b[1].count - a[1].count);

    const highlightParameter = (url, param) => {
      const regex = new RegExp(`(${param}=([^&]+))`, 'g');
      return url.replace(regex, '<span class="bg-yellow-200">$1</span>');
    };

    return (
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
          <h2 className="text-xl font-semibold ml-2">Parameter Report</h2>
        </div>
        {isOpen && (
          <div className="mt-4">
            <table className="w-full mt-2 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Parameter</th>
                  <th className="text-right p-2">Count</th>
                  <th className="text-left p-2">Top Folders</th>
                </tr>
              </thead>
              <tbody>
                {sortedParams.map(([param, data]) => (
                  <tr key={param} className="border-t">
                    <td className="p-2">{param}</td>
                    <td className="text-right p-2">{formatNumber(data.count)}</td>
                    <td className="p-2">
                      {Object.entries(data.folders)
                        .sort((a, b) => b[1].count - a[1].count)
                        .slice(0, 3)
                        .map(([folder, folderData], index) => (
                          <div key={folder} className={index > 0 ? 'mt-1' : ''}>
                            {truncate(folder, 20)}: {formatNumber(folderData.count)}
                            <br />
                            <div className="text-xs text-gray-500 flex items-center">
                              <span className="mr-1">Sample:</span>
                              <span 
                                className="truncate flex-grow"
                                dangerouslySetInnerHTML={{
                                  __html: highlightParameter(folderData.sampleUrl, param)
                                }}
                              />
                              <a 
                                href={folderData.sampleUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="ml-1 text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const SecondLevelFolderAnalysis = ({ secondLevelFolders }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllFolders, setShowAllFolders] = useState(false);

    const toggleFolder = (folderName) => {
      setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
    };

    const sortedFolders = Object.entries(secondLevelFolders)
      .sort((a, b) => b[1].count - a[1].count)
      .filter(([name, data]) => 
        name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (showAllFolders || data.count > 500)
      );

    const hiddenFoldersCount = Object.values(secondLevelFolders).filter(data => data.count <= 500).length;

    const highlightFolderInUrl = (url, folderName) => {
      const regex = new RegExp(`(/${folderName}/)`, 'i');
      return url.replace(regex, '<span class="bg-yellow-200">$1</span>');
    };

    return (
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
          <h2 className="text-xl font-semibold ml-2">Second-Level Folder Analysis</h2>
        </div>
        {isOpen && (
          <div className="mt-4">
            <div className="mb-4 flex justify-between items-center">
              <input
                type="text"
                placeholder="Search second-level folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-2/3 px-4 py-2 border rounded-md"
              />
              <button
                onClick={() => setShowAllFolders(!showAllFolders)}
                className="text-blue-500 hover:text-blue-700"
              >
                {showAllFolders ? 'Show Less' : `Show ${hiddenFoldersCount} More`}
              </button>
            </div>
            <table className="w-full mt-2 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Folder Name</th>
                  <th className="text-right p-2">Count</th>
                  {Object.values(secondLevelFolders)[0].nonIndexableCount !== undefined && (
                    <th className="text-right p-2">Non-Indexable</th>
                  )}
                  <th className="text-right p-2">Third-Level Subfolders</th>
                  <th className="text-right p-2">Sample</th>
                </tr>
              </thead>
              <tbody>
                {sortedFolders.map(([folderName, folderData]) => (
                  <React.Fragment key={folderName}>
                    <tr className="border-t">
                      <td className="p-2" title={folderName}>{truncate(folderName, 45)}</td>
                      <td className="text-right p-2">{formatNumber(folderData.count)}</td>
                      {folderData.nonIndexableCount !== undefined && (
                        <td className="text-right p-2 text-xs">
                          {((folderData.nonIndexableCount / folderData.count) * 100).toFixed(2)}%
                        </td>
                      )}
                      <td className="text-right p-2">{Object.keys(folderData.subfolders).length}</td>
                      <td className="text-right p-2">
                        <button 
                          onClick={() => toggleFolder(folderName)}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                        >
                          {expandedFolders[folderName] ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    </tr>
                    {expandedFolders[folderName] && (
                      <tr>
                        <td colSpan={folderData.nonIndexableCount !== undefined ? 5 : 4} className="p-2 bg-gray-50">
                          <div className="text-xs text-gray-600">
                            <p>Sample URL: 
                              <span 
                                dangerouslySetInnerHTML={{
                                  __html: highlightFolderInUrl(folderData.sampleUrl, folderName)
                                }}
                              />
                            </p>
                            <p className="mt-2 font-semibold">Third-Level Subfolders:</p>
                            <ul className="list-disc ml-4 mt-1">
                              {Object.entries(folderData.subfolders)
                                .sort((a, b) => b[1].count - a[1].count)
                                .slice(0, 5)
                                .map(([subName, subData]) => (
                                  <li key={subName} className="mb-1">
                                    <div className="flex items-center justify-between">
                                      <span>
                                        {subName}: {formatNumber(subData.count)} URLs
                                        {subData.nonIndexableCount !== undefined && (
                                          <span className="ml-2 text-xs text-red-500">
                                            ({((subData.nonIndexableCount / subData.count) * 100).toFixed(2)}% non-indexable)
                                          </span>
                                        )}
                                      </span>
                                      <a 
                                        href={subData.sampleUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700 ml-2"
                                      >
                                        <ExternalLink size={12} />
                                      </a>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                            {Object.keys(folderData.subfolders).length > 5 && (
                              <p className="mt-1 text-gray-500">
                                (and {Object.keys(folderData.subfolders).length - 5} more...)
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      {isEditingTitle ? (
        <input
          type="text"
          value={pageTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="text-2xl font-bold mb-4 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      ) : (
        <h1 
          className="text-2xl font-bold mb-4 cursor-pointer hover:text-blue-600"
          onClick={() => setIsEditingTitle(true)}
        >
          {pageTitle}
        </h1>
      )}
      {!urlData && (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed p-8 mb-4 text-center cursor-pointer rounded-lg transition-colors duration-200 ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <input {...getInputProps()} accept=".csv,text/csv" />
          <FileUp size={48} className="mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg">Drop the CSV file here ...</p>
          ) : (
            <p className="text-lg">Drag 'n' drop a CSV file here, or click to select a file</p>
          )}
        </div>
      )}
      {loading && (
        <div className="mb-4">
          <p>Processing file... {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
          </div>
        </div>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {urlData && (
        <div>
          <Summary data={urlData.folderStructure} />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold mr-4">Folder Analysis</h2>
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {searchTerm && (
                  <X
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    size={20}
                    onClick={() => setSearchTerm('')}
                  />
                )}
              </div>
            </div>
            <button
              onClick={() => setShowAllFolders(!showAllFolders)}
              className="flex items-center text-blue-500 hover:text-blue-700"
            >
              {showAllFolders ? (
                <>
                  <Minus size={16} className="mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-1" />
                  Show All
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(urlData.folderStructure)
              .sort((a, b) => {
                if (a[0] === 'root') return -1;
                if (b[0] === 'root') return 1;
                return b[1].count - a[1].count;
              })
              .filter(([name, folder]) => 
                (showAllFolders || folder.count > 100) && 
                name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(([name, folder]) => (
                <FolderDetails key={name} folder={folder} name={name} />
              ))}
          </div>
          <SecondLevelFolderAnalysis secondLevelFolders={urlData.secondLevelFolders} />
          <ParameterReport globalParams={urlData.globalParams} />
        </div>
      )}
    </div>
  );
};

export default URLAnalysisDashboard;