import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { FileUp, ChevronDown, ChevronRight, Search, X, ExternalLink } from 'lucide-react';

const SimpleURLAnalyzer = () => {
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

  const processURLs = (urls) => {
    const folderStructure = {};
    const globalParams = {};

    urls.forEach(url => {
      try {
        const parsedUrl = new URL(url);
        const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment);

        let level1 = pathSegments[0] || 'root';
        let level2 = pathSegments[1] || 'root';

        if (!folderStructure[level1]) {
          folderStructure[level1] = { count: 0, subfolders: {}, params: {}, paramSamples: {}, sampleUrl: '' };
        }
        folderStructure[level1].count++;
        folderStructure[level1].sampleUrl = url;

        if (!folderStructure[level1].subfolders[level2]) {
          folderStructure[level1].subfolders[level2] = { count: 0, params: {}, paramSamples: {}, sampleUrl: '' };
        }
        folderStructure[level1].subfolders[level2].count++;
        folderStructure[level1].subfolders[level2].sampleUrl = url;

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

    return { folderStructure, globalParams };
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
              .slice(1) // Skip the first row
              .flatMap(row => row) // Flatten the array in case of multi-column data
              .filter(url => url && typeof url === 'string' && url.trim() !== '');
            console.log('Filtered URLs:', urls.slice(0, 5)); // Log first 5 URLs for debugging
            console.log('Total URLs found:', urls.length);
            if (urls.length === 0) {
              throw new Error('No valid URLs found in the file');
            }
            const processedData = processURLs(urls);
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
    const [showParamSamples, setShowParamSamples] = useState({});

    const sortedSubfolders = Object.entries(folder.subfolders)
      .sort((a, b) => b[1].count - a[1].count);

    const toggleParamSamples = (param) => {
      setShowParamSamples(prev => ({ ...prev, [param]: !prev[param] }));
    };

    return (
      <div className="mb-4 border rounded p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-semibold ml-2" title={name}>{truncate(name, 25)}</span>
          <span className="ml-2 text-gray-600">({formatNumber(folder.count)} URLs)</span>
        </div>
        {isOpen && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Sample URL: {folder.sampleUrl}</p>
            {Object.keys(folder.params).length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Parameters:</p>
                <ul className="list-disc ml-4">
                  {Object.entries(folder.params)
                    .sort((a, b) => b[1] - a[1])
                    .map(([param, count]) => (
                      <li key={param} className="text-sm">
                        <div className="flex items-center">
                          <span>{param}: {formatNumber(count)}</span>
                          <button 
                            onClick={() => toggleParamSamples(param)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            {showParamSamples[param] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </div>
                        {showParamSamples[param] && (
                          <div className="mt-1 ml-4 text-xs text-gray-500 flex items-center">
                            <span className="mr-1">Sample:</span>
                            <span className="truncate flex-grow">
                              {folder.paramSamples[param] || 'N/A'}
                            </span>
                            <a 
                              href={folder.paramSamples[param]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {sortedSubfolders.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold">Subfolders:</p>
                <table className="w-full mt-2 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Name</th>
                      <th className="text-right p-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubfolders.map(([subName, subFolder]) => (
                      <tr key={subName} className="border-t">
                        <td className="p-2" title={subName}>{truncate(subName, 25)}</td>
                        <td className="text-right p-2">{formatNumber(subFolder.count)}</td>
                      </tr>
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
    const topFolders = Object.entries(data)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    return (
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <p>Total URLs analyzed: {formatNumber(totalUrls)}</p>
        <p>Number of top-level folders: {formatNumber(Object.keys(data).length)}</p>
        <div className="mt-4">
          <h3 className="font-semibold">Top 5 folders:</h3>
          <ul className="list-disc ml-6">
            {topFolders.map(([name, folder]) => (
              <li key={name}>
                <span title={name}>{truncate(name, 25)}</span>: {formatNumber(folder.count)} URLs ({((folder.count / totalUrls) * 100).toFixed(2)}%)
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
          <div className="mb-4 flex items-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(urlData.folderStructure)
              .sort((a, b) => {
                if (a[0] === 'root') return -1;
                if (b[0] === 'root') return 1;
                return b[1].count - a[1].count;
              })
              .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
              .filter(([_, folder]) => showAllFolders || folder.count >= 100 || _ === 'root')
              .map(([name, folder]) => (
                <FolderDetails key={name} folder={folder} name={name} />
              ))}
          </div>
          {!showAllFolders && Object.values(urlData.folderStructure).some(folder => folder.count < 100) && (
            <button
              onClick={() => setShowAllFolders(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Show More Folders
            </button>
          )}
          <ParameterReport globalParams={urlData.globalParams} />
        </div>
      )}
    </div>
  );
};

export default SimpleURLAnalyzer;