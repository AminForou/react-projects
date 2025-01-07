


import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Select from 'react-select';
import { crawlData } from './CrawlData';
import { FaFileCode, FaGoogle, FaChartLine, FaClipboardList, FaSort, FaSortUp, FaSortDown, FaChevronDown, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

// Helper function to format numbers with thousand separators
const formatNumber = (num) => {
  if (num === undefined || num === null) return 'N/A';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const crawlerTypes = [
  { value: 'totalCrawls', label: 'Total Crawls', color: '#3b82f6' },
  { value: 'googleOther', label: 'Google Other', color: '#10b981' },
  { value: 'googleSmartphone', label: 'Google Smartphone', color: '#f59e0b' },
  { value: 'googleDesktop', label: 'Google Desktop', color: '#ef4444' },
];

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#e2e8f0',
    '&:hover': {
      borderColor: '#cbd5e1',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e2e8f0',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#4b5563',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#4b5563',
    '&:hover': {
      backgroundColor: '#cbd5e1',
      color: '#1f2937',
    },
  }),
};

const UnknownCrawlAnalysis = () => {
  const [subdomainData, setSubdomainData] = useState({});
  const [overallData, setOverallData] = useState([]);
  const [donutData, setDonutData] = useState([]);
  const [donutMetric, setDonutMetric] = useState('urlCount');
  const [expandedSubdomains, setExpandedSubdomains] = useState({});
  const [selectedSubdomains, setSelectedSubdomains] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedCrawlers, setSelectedCrawlers] = useState(crawlerTypes.map(c => c.value));
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [urlCountFilter, setUrlCountFilter] = useState(50);

  useEffect(() => {
    const processData = () => {
      const tempData = {};
      crawlData.forEach(item => {
        const url = new URL(item.url);
        const subdomain = url.hostname;

        if (!tempData[subdomain]) {
          tempData[subdomain] = {
            totalCrawls: 0,
            urlCount: 0,
            crawlers: { googleOther: 0, googleSmartphone: 0, googleDesktop: 0 },
            subfolders: {},
            sampleUrl: item.url
          };
        }

        tempData[subdomain].totalCrawls += item.total;
        tempData[subdomain].urlCount += 1;
        tempData[subdomain].crawlers.googleOther += item.googleOther;
        tempData[subdomain].crawlers.googleSmartphone += item.googleSmartphone;
        tempData[subdomain].crawlers.googleDesktop += item.googleDesktop;

        const pathParts = url.pathname.split('/').filter(part => part);
        if (pathParts.length > 0) {
          const firstSubfolder = pathParts[0];
          const secondSubfolder = pathParts.length > 1 ? pathParts[1] : '';
          const key = secondSubfolder ? `${firstSubfolder}/${secondSubfolder}` : firstSubfolder;

          if (!tempData[subdomain].subfolders[key]) {
            tempData[subdomain].subfolders[key] = { urls: new Set(), sampleUrl: item.url };
          }
          tempData[subdomain].subfolders[key].urls.add(item.url);
        }
      });

      // Filter subdomains for donut and bar chart (always 50)
      const fixedFilteredData = {};
      for (const [subdomain, data] of Object.entries(tempData)) {
        if (data.urlCount >= 50) {
          fixedFilteredData[subdomain] = data;
        }
      }

      setSubdomainData(tempData); // Store all data
      setOverallData(Object.entries(fixedFilteredData).map(([subdomain, info]) => ({
        name: subdomain,
        totalCrawls: info.totalCrawls,
        urlCount: info.urlCount,
        crawlIntensity: info.crawlIntensity,
        googleOther: info.crawlers.googleOther,
        googleSmartphone: info.crawlers.googleSmartphone,
        googleDesktop: info.crawlers.googleDesktop
      })));
      setDonutData(Object.entries(fixedFilteredData).map(([subdomain, info]) => ({
        name: subdomain,
        urlCount: info.urlCount,
        totalCrawls: info.totalCrawls,
        crawlIntensity: info.crawlIntensity
      })));
      
      // Initialize selectedDomains with all domains
      setSelectedDomains(Object.keys(fixedFilteredData));
    };

    processData();
  }, []);

  const filteredSubdomainData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(subdomainData).filter(([_, data]) => data.urlCount >= urlCountFilter)
    );
  }, [subdomainData, urlCountFilter]);

  const filteredDonutData = useMemo(() => {
    return Object.entries(filteredSubdomainData).map(([subdomain, info]) => ({
      name: subdomain,
      urlCount: info.urlCount,
      totalCrawls: info.totalCrawls,
      crawlIntensity: info.crawlIntensity
    }));
  }, [filteredSubdomainData]);

  const generateResourceReportUrl = (subfolder) => {
    const baseUrl = "https://app.botify.com/hyatt-org/hyatt.com/crawl/explorer?context=";
    const context = `{"filter":{"and":[{"and":[{"predicate":"contains","value":"${subfolder}","field":"js.resources.url"}]}]}}`;
    const comparisonAnalysisSlug = "20240907";
    const analysisSlug = "20240914";
    const explorerFilter = `{"columns":["url_card"]}`;
    return `${baseUrl}${encodeURIComponent(context)}&comparisonAnalysisSlug=${comparisonAnalysisSlug}&analysisSlug=${analysisSlug}&explorerFilter=${encodeURIComponent(explorerFilter)}`;
  };

  const generateGoogleSearchConsoleUrl = (subfolder) => {
    return `https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain:hyatt.com&page=*${encodeURIComponent(subfolder)}`;
  };

  const generateBotifyUrlExplorerUrl = (subfolder) => {
    const baseUrl = "https://app.botify.com/hyatt-org/hyatt.com/crawl/explorer?context=";
    const context = `{"filter":{"and":[{"and":[{"predicate":"contains","value":"${subfolder}","field":"url"}]}]}}`;
    const comparisonAnalysisSlug = "20240907";
    const analysisSlug = "20240914";
    const explorerFilter = `{"columns":["url_card"]}`;
    return `${baseUrl}${encodeURIComponent(context)}&comparisonAnalysisSlug=${comparisonAnalysisSlug}&analysisSlug=${analysisSlug}&explorerFilter=${encodeURIComponent(explorerFilter)}`;
  };

  const generateLogAnalyzerUrl = (subfolder) => {
    const baseUrl = "https://app.botify.com/hyatt-org/hyatt.com/logs/explorer?source=google&context=";
    const context = `{"period":{"start":"2024-08-21T00:00:00.000Z","end":"2024-09-20T00:00:00.000Z","rangeType":"custom"},"aggregation":"day","filter":{"and":[{"and":[{"field":"crawls.google.count","predicate":"gt","value":0},{"predicate":"contains","value":"${subfolder}","field":"url"}]}]}}`;
    const explorerSampling = "100";
    const explorerColumns = `["url","crawls.google.count","crawls.google.bots.search.count","crawls.google.bots.smartphone.count","crawls.google.bots.adsbot.count","crawls.google.bots.adsbot_mobile.count","crawls.google.bots.google_other.count","crawls.bing.count","crawls.bing.bots.search.count"]`;
    const explorerSorts = `[{"field":"crawls.google.count","order":"desc"}]`;
    return `${baseUrl}${encodeURIComponent(context)}&explorerSampling=${explorerSampling}&explorerColumns=${encodeURIComponent(explorerColumns)}&explorerSorts=${encodeURIComponent(explorerSorts)}`;
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'ascending' ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
    }
    return <FaSort className="inline ml-1 text-gray-400" />;
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredDonutData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredDonutData, sortConfig]);

  const domainOptions = useMemo(() => 
    overallData.map(item => ({ value: item.name, label: item.name })),
    [overallData]
  );

  const filteredOverallData = useMemo(() => 
    overallData.filter(item => selectedDomains.includes(item.name)),
    [overallData, selectedDomains]
  );

  const handleDomainSelection = (selectedOptions) => {
    setSelectedDomains(selectedOptions.map(option => option.value));
  };

  const handleCrawlerSelection = (selectedOptions) => {
    setSelectedCrawlers(selectedOptions.map(option => option.value));
  };

  const CustomLegend = ({ payload }) => {
    const displayedItems = payload.slice(0, 20);
    const remainingCount = payload.length - 20;

    return (
      <ul className="flex flex-wrap justify-center">
        {displayedItems.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center mr-4 mb-2">
            <span
              className="w-3 h-3 mr-1 inline-block"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-sm">{entry.value}</span>
          </li>
        ))}
        {remainingCount > 0 && (
          <li className="flex items-center mr-4 mb-2">
            <span className="text-sm text-gray-500">
              and {remainingCount} more...
            </span>
          </li>
        )}
      </ul>
    );
  };

  const renderDonutChart = () => {
    const total = filteredDonutData.reduce((sum, item) => sum + item[donutMetric], 0);

    const getMetricHeader = () => {
      switch(donutMetric) {
        case 'urlCount':
          return 'URL Count';
        case 'totalCrawls':
          return 'Total Crawls';
        case 'crawlIntensity':
          return 'Crawl Intensity';
        default:
          return 'Count';
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Subdomain Share</h2>
        <div className="flex justify-end mb-4">
          <select 
            className="border rounded p-2"
            value={donutMetric}
            onChange={(e) => setDonutMetric(e.target.value)}
          >
            <option value="urlCount">URL Count</option>
            <option value="totalCrawls">Total Crawls</option>
            <option value="crawlIntensity">Crawl Intensity</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={filteredDonutData}
              dataKey={donutMetric}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              innerRadius={70}
              fill="#8884d8"
              label={({ name, value, percent }) => {
                if (percent < 0.01) return null; // Hide label if less than 1%
                const displayValue = donutMetric === 'crawlIntensity' 
                  ? value.toFixed(2) 
                  : formatNumber(Math.round(value));
                return `${name}: ${displayValue} (${(percent * 100).toFixed(0)}%)`;
              }}
              labelLine={({ percent }) => percent >= 0.01} // Hide label line if less than 1%
            >
              {filteredDonutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => {
                return donutMetric === 'crawlIntensity' 
                  ? [value.toFixed(2), name] 
                  : [formatNumber(Math.round(value)), name];
              }}
            />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Subdomain Share Table</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th 
                    className="py-2 px-4 border-b text-left cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => requestSort('rowNumber')}
                  >
                    # {getSortIcon('rowNumber')}
                  </th>
                  <th 
                    className="py-2 px-4 border-b text-left cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => requestSort('name')}
                  >
                    Domain {getSortIcon('name')}
                  </th>
                  <th 
                    className="py-2 px-4 border-b text-right cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => requestSort(donutMetric)}
                  >
                    {getMetricHeader()} {getSortIcon(donutMetric)}
                  </th>
                  <th 
                    className="py-2 px-4 border-b text-right cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => requestSort('share')}
                  >
                    Share (%) {getSortIcon('share')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => {
                  const share = (item[donutMetric] / total) * 100;
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border-b">{index + 1}</td>
                      <td className="py-2 px-4 border-b relative group">
                        {item.name}
                        <a
                          href={`https://${item.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute left-full ml-2 hidden group-hover:inline-block"
                        >
                          <FaExternalLinkAlt className="text-blue-500 hover:text-blue-700" />
                        </a>
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {donutMetric === 'crawlIntensity' 
                          ? item[donutMetric].toFixed(2)
                          : formatNumber(Math.round(item[donutMetric]))}
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {share.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOverallChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Overall Subdomain Comparison</h2>
      <div className="mb-4">
        <button
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-50"
        >
          <span>Chart Options</span>
          {isOptionsOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isOptionsOpen && (
          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Domains</label>
                <Select
                  isMulti
                  name="domains"
                  options={domainOptions}
                  styles={customStyles}
                  value={domainOptions.filter(option => selectedDomains.includes(option.value))}
                  onChange={handleDomainSelection}
                  placeholder="Select domains to compare..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Crawlers</label>
                <Select
                  isMulti
                  name="crawlers"
                  options={crawlerTypes}
                  styles={customStyles}
                  value={crawlerTypes.filter(option => selectedCrawlers.includes(option.value))}
                  onChange={handleCrawlerSelection}
                  placeholder="Select crawlers to display..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={filteredOverallData} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            tickFormatter={formatNumber} 
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={150}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }}
            formatter={(value, name, props) => [formatNumber(value), name]}
          />
          <Legend />
          {selectedCrawlers.map(crawler => {
            const crawlerInfo = crawlerTypes.find(c => c.value === crawler);
            return (
              <Bar 
                key={crawler} 
                dataKey={crawler} 
                fill={crawlerInfo.color} 
                name={crawlerInfo.label} 
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderSubdomainData = () => {
    return Object.entries(filteredSubdomainData)
      .filter(([subdomain]) => selectedSubdomains[subdomain])
      .map(([subdomain, data]) => {
        const isExpanded = expandedSubdomains[subdomain] || false;
        const toggleExpand = () => {
          setExpandedSubdomains(prev => ({
            ...prev,
            [subdomain]: !prev[subdomain]
          }));
        };

        // Calculate subfolder counts
        const subfolderCounts = Object.entries(data.subfolders).map(([subfolder, info]) => ({
          name: subfolder,
          count: info.urls.size // Use the size of the Set for the count
        }));

        const sortedSubfolders = subfolderCounts.sort((a, b) => b.count - a.count);

        const displayedSubfolders = isExpanded ? sortedSubfolders : sortedSubfolders.slice(0, 4);

        return (
          <div key={subdomain} className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{subdomain}</h2>
            <p className="mb-2 text-gray-600">Sample URL: <a href={data.sampleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{data.sampleUrl}</a></p>
            <p className="mb-4 text-gray-600">Total Crawls: <span className="font-semibold">{formatNumber(data.totalCrawls)}</span></p>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Crawler Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[data.crawlers]} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" tickFormatter={formatNumber} />
                <YAxis type="category" width={150} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }}
                  formatter={(value, name, props) => [formatNumber(value), name]}
                />
                <Legend />
                <Bar dataKey="googleOther" fill="#10b981" name="Google Other" />
                <Bar dataKey="googleSmartphone" fill="#f59e0b" name="Google Smartphone" />
                <Bar dataKey="googleDesktop" fill="#ef4444" name="Google Desktop" />
              </BarChart>
            </ResponsiveContainer>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-700">Most Repeated Subfolders</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={sortedSubfolders.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" tickFormatter={formatNumber} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px' }}
                  formatter={(value, name, props) => [formatNumber(value), name]}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Unique URL Count" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">Subfolder Sample URLs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedSubfolders.map(({ name: subfolder, count }) => (
                  <div key={subfolder} className="bg-gray-50 p-3 rounded-lg relative">
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <a href={generateResourceReportUrl(subfolder)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 relative group">
                        <FaFileCode />
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -left-1/2 bottom-full mb-2 whitespace-nowrap">
                          Resource Report
                        </span>
                      </a>
                      <a href={generateGoogleSearchConsoleUrl(subfolder)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 relative group">
                        <FaGoogle />
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -left-1/2 bottom-full mb-2 whitespace-nowrap">
                          Google Search Console
                        </span>
                      </a>
                      <a href={generateBotifyUrlExplorerUrl(subfolder)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 relative group">
                        <FaChartLine />
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -left-1/2 bottom-full mb-2 whitespace-nowrap">
                          Botify URL Explorer
                        </span>
                      </a>
                      <a href={generateLogAnalyzerUrl(subfolder)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 relative group">
                        <FaClipboardList />
                        <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -left-1/2 bottom-full mb-2 whitespace-nowrap">
                          Botify Log Analyzer
                        </span>
                      </a>
                    </div>
                    <p className="font-medium text-gray-700 mb-1">{subfolder}</p>
                    <a href={data.subfolders[subfolder].sampleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm break-all">
                      {data.subfolders[subfolder].sampleUrl}
                    </a>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatNumber(count)} unique URL{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
              {sortedSubfolders.length > 4 && (
                <button 
                  onClick={toggleExpand}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
        );
      });
  };

  const renderSubdomainFilter = () => (
    <div className="mb-4">
      <label htmlFor="urlCountFilter" className="block text-sm font-medium text-gray-700">
        Minimum URL Count for Subdomain Display:
      </label>
      <input
        type="number"
        id="urlCountFilter"
        value={urlCountFilter}
        onChange={(e) => setUrlCountFilter(Number(e.target.value))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        min="1"
      />
    </div>
  );

  const renderSubdomainSelector = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Select Subdomains to Display</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.keys(filteredSubdomainData).map(subdomain => (
          <label key={subdomain} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedSubdomains[subdomain] || false}
              onChange={() => setSelectedSubdomains(prev => ({
                ...prev,
                [subdomain]: !prev[subdomain]
              }))}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">{subdomain}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto mt-8 p-4 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Unknown Crawl Analysis Dashboard</h1>
      {renderSubdomainFilter()}
      {renderDonutChart()}
      {renderOverallChart()}
      {renderSubdomainSelector()}
      {renderSubdomainData()}
    </div>
  );
};

export default UnknownCrawlAnalysis;
