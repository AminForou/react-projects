import React, { useState, useMemo } from 'react';

// 1) Import multiple datasets
import { december5data, december18data } from './data';

import HierarchyTab from './components/HierarchyTab';
import ChartsTab from './components/ChartsTab';
import CollapsibleTreeTab from './components/CollapsibleTreeTab';
import { Sidebar } from './components/CommonComponents';

// -----------------------------------------------
// Helper function to count how many L1, L2, and L3
// nodes exist in the selected dataset
// -----------------------------------------------
function countNodesByLevel(node, counts) {
  // If the node has a level of 1, 2, or 3, increment the corresponding counter
  if (node.level === 1) counts.l1 += 1;
  if (node.level === 2) counts.l2 += 1;
  if (node.level === 3) counts.l3 += 1;

  if (node.children) {
    node.children.forEach((child) => countNodesByLevel(child, counts));
  }
}

const TabButton = ({ isActive, onClick, icon, text }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 px-6 py-3.5 
      rounded-lg transition-all duration-200
      font-medium text-sm
      ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-600 scale-105' 
          : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200 hover:text-gray-900'
      }
    `}
  >
    {icon}
    {text}
  </button>
);

const DatasetSelector = ({ selectedDataset, datasetOptions, onChange, levelCounts }) => (
  <div className="mb-8 flex justify-center">
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <svg 
            className="w-5 h-5 text-indigo-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
          <label className="text-sm font-medium text-gray-700">
            Select Dataset:
          </label>
        </div>
        <div className="relative">
          <select
            value={Object.keys(datasetOptions).find(
              key => datasetOptions[key] === selectedDataset
            )}
            onChange={(e) => onChange(datasetOptions[e.target.value])}
            className="
              appearance-none
              bg-gray-50
              border border-gray-200
              text-gray-700
              font-medium
              rounded-lg
              pl-4 pr-10 py-2.5
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
              focus:border-indigo-500
              transition-colors
              duration-200
              min-w-[200px]
              hover:bg-gray-100
            "
          >
            {Object.keys(datasetOptions).map((key) => (
              <option 
                key={key} 
                value={key}
                className="py-2"
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {Object.keys(datasetOptions).length} Datasets
          </span>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-indigo-200 text-indigo-400 font-semibold text-sm">
            L1: {levelCounts.l1}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
            L2: {levelCounts.l2}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm">
            L3: {levelCounts.l3}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const LinkedInPulseTopicsHierarchy = () => {
  // 2) Keep references to your different datasets in a map:
  const datasetOptions = {
    December5: december5data,
    December18: december18data
    // Add more as needed
  };

  // 3) Manage the selected dataset in state. 
  //    By default, pick one dataset (must match a key in datasetOptions).
  const [selectedDataset, setSelectedDataset] = useState(datasetOptions.December5);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchLevel, setSearchLevel] = useState(['all']);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [sidebarTitle, setSidebarTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [activeTab, setActiveTab] = useState('hierarchy');

  const handleSelect = (articles, title, crumb) => {
    setSelectedArticles(articles);
    setSidebarTitle(title);
    setBreadcrumb(crumb);
    setIsSidebarOpen(true);
  };

  // 4) Updated to generate CSV from whichever dataset is selected
  const generateCSV = (topicsData) => {
    const rows = [];
    const addRow = (l1, l2, l3, volume, articleCount) => {
      rows.push([l1, l2, l3, volume, articleCount].join(','));
    };

    const traverse = (node, level1 = '', level2 = '', level3 = '') => {
      if (node.level === 1) {
        level1 = node.name.replace(/^\d+\s-\s/, '');
        addRow(level1, '', '', node.volume, '');
      } else if (node.level === 2) {
        level2 = node.name.replace(/^\d+\s-\s/, '');
        addRow(level1, level2, '', '', node.articleCount);
      } else if (node.level === 3) {
        level3 = node.name.replace(/^\d+\s-\s/, '');
        addRow(level1, level2, level3, '', node.articleCount);
      }
      if (node.children) {
        node.children.forEach((child) =>
          traverse(child, level1, level2, level3)
        );
      }
    };

    traverse(topicsData);
    return [
      'Level 1,Level 2,Level 3,Search Volume,Article Count',
      ...rows
    ].join('\n');
  };

  // 5) Use selectedDataset in downloadCSV
  const downloadCSV = () => {
    const csv = generateCSV(selectedDataset);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'linkedin_pulse_topics.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --------------------------------------
  // 6) Count L1, L2, and L3 for display
  // --------------------------------------
  const levelCounts = useMemo(() => {
    if (!selectedDataset) return { l1: 0, l2: 0, l3: 0 };
    let counts = { l1: 0, l2: 0, l3: 0 };
    countNodesByLevel(selectedDataset, counts); 
    return counts;
  }, [selectedDataset]);

  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-3 text-gray-900 text-center">
          REI Topics Hierarchy
        </h1>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          Explore and analyze topic relationships through different visualization methods.
          Each view provides unique insights into the hierarchical structure.
        </p>

        <DatasetSelector 
          selectedDataset={selectedDataset}
          datasetOptions={datasetOptions}
          onChange={setSelectedDataset}
          levelCounts={levelCounts}
        />

        <div className="bg-gray-50/50 backdrop-blur-sm rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex flex-wrap justify-center gap-4">
            <TabButton
              isActive={activeTab === 'hierarchy'}
              onClick={() => setActiveTab('hierarchy')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              }
              text="Hierarchy View"
            />
            <TabButton
              isActive={activeTab === 'visualization'}
              onClick={() => setActiveTab('visualization')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              text="Charts View"
            />
            <TabButton
              isActive={activeTab === 'collapsible-tree'}
              onClick={() => setActiveTab('collapsible-tree')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
              text="Tree View"
            />
          </div>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'hierarchy' && (
            <div className="animate-fadeIn">
              <HierarchyTab
                linkedInPulseTopicsData={selectedDataset}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchLevel={searchLevel}
                setSearchLevel={setSearchLevel}
                handleSelect={handleSelect}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                selectedArticles={selectedArticles}
                sidebarTitle={sidebarTitle}
                breadcrumb={breadcrumb}
                downloadCSV={downloadCSV}
              />
            </div>
          )}

          {activeTab === 'visualization' && (
            <div className="animate-fadeIn">
              <ChartsTab linkedInPulseTopicsData={selectedDataset} />
            </div>
          )}

          {activeTab === 'collapsible-tree' && (
            <div className="animate-fadeIn">
              <CollapsibleTreeTab linkedInPulseTopicsData={selectedDataset} />
            </div>
          )}
        </div>

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          articles={selectedArticles}
          title={sidebarTitle}
          breadcrumb={breadcrumb}
        />
      </div>
    </div>
  );
};

export default LinkedInPulseTopicsHierarchy;
