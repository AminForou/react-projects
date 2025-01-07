import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, BarChart2, FileText } from 'lucide-react';
import { Tooltip } from './CommonComponents'; // Removed Sidebar and X imports

const TopicNode = ({
  name,
  level,
  volume,
  children,
  searchTerm,
  searchLevel,
  parentExpanded = true,
  articleCount,
  articles,
  onSelect,
  breadcrumb
}) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const matchBeginningOfWord = (text, term) => {
      if (!term) return true;
      const regex = new RegExp(`\\b${term}`, 'i');
      return regex.test(text);
    };

    if (level === 0) {
      setIsVisible(true);
      setIsExpanded(true);
    } else if (searchLevel.includes(level) || searchLevel.includes('all')) {
      const shouldBeVisible = matchBeginningOfWord(
        name.toLowerCase(),
        searchTerm.toLowerCase()
      );
      setIsVisible(shouldBeVisible);
      if (searchTerm !== '' && shouldBeVisible) {
        setIsExpanded(true);
      }
    } else {
      setIsVisible(parentExpanded);
    }
  }, [searchTerm, name, level, parentExpanded, searchLevel]);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getLevelStyle = (lvl) => {
    const styles = [
      'text-xl font-bold text-indigo-700',
      'text-lg font-semibold text-indigo-600',
      'text-md font-medium text-indigo-500',
      'text-sm font-normal text-indigo-400'
    ];
    return styles[lvl] || styles[3];
  };

  const getLevelBadgeColor = (lvl) => {
    const colors = [
      'bg-indigo-100 text-indigo-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-red-100 text-red-600'
    ];
    return colors[lvl] || colors[3];
  };

  const sortedChildren = useMemo(() => {
    if (!children) return [];
    if (level === 0) {
      return [...children].sort((a, b) => (b.volume || 0) - (a.volume || 0));
    } else if (level === 1 || level === 2) {
      return [...children].sort(
        (a, b) => (b.articleCount || 0) - (a.articleCount || 0)
      );
    }
    return children;
  }, [children, level]);

  const handleArticleClick = (e) => {
    e.stopPropagation();
    if (level === 3) {
      onSelect(
        articles,
        name.replace(/^\d+\s-\s/, ''),
        [...breadcrumb, name.replace(/^\d+\s-\s/, '')]
      );
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`mb-2 ${
        level === 0
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg overflow-hidden'
          : ''
      }`}
    >
      <div
        className={`flex items-center cursor-pointer py-4 px-6 hover:bg-indigo-50 transition-all duration-300 ${getLevelStyle(
          level
        )}`}
        onClick={toggleExpand}
        style={{
          paddingLeft: level === 0 ? '16px' : `${level * 24}px`
        }}
      >
        <div className="flex items-center flex-grow">
          {children && (
            <span
              className={`${
                level === 0 ? 'ml-2 mr-4' : 'mr-3'
              } transition-transform duration-300 ${
                isExpanded ? 'transform rotate-90' : ''
              }`}
            >
              <ChevronRight size={20} />
            </span>
          )}
          <span
            className={`${getLevelBadgeColor(
              level
            )} text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3`}
          >
            {level}
          </span>
          <span>{name.replace(/^\d+\s-\s/, '')}</span>
        </div>
        <div className="flex items-center space-x-4">
          {level === 1 && volume && (
            <Tooltip text="Monthly search volume">
              <div className="flex items-center space-x-2">
                <BarChart2 size={16} className="text-indigo-400" />
                <span className="text-sm text-indigo-400 font-normal">
                  {volume.toLocaleString()}
                </span>
              </div>
            </Tooltip>
          )}
          {level === 2 && typeof articleCount === 'number' && (
            <Tooltip text="Number of related articles">
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-indigo-400" />
                <span className="text-sm text-indigo-400 font-normal">
                  {articleCount}
                </span>
              </div>
            </Tooltip>
          )}
          {level === 3 && typeof articleCount === 'number' && (
            <Tooltip text="Click to view related articles">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={handleArticleClick}
              >
                <FileText size={16} className="text-indigo-400" />
                <span className="text-sm text-indigo-400 font-normal">
                  {articleCount}
                </span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      {children && (
        <div
          className={`ml-6 ${
            level >= 2 ? 'border-l border-indigo-100 pl-4' : ''
          } ${isExpanded ? '' : 'hidden'}`}
        >
          {sortedChildren.map((child, index) => (
            <TopicNode
              key={index}
              {...child}
              searchTerm={searchTerm}
              searchLevel={searchLevel}
              parentExpanded={isExpanded}
              onSelect={onSelect}
              breadcrumb={[
                ...breadcrumb,
                name.replace(/^\d+\s-\s/, '')
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchyTab = ({
  linkedInPulseTopicsData,
  searchTerm,
  setSearchTerm,
  searchLevel,
  setSearchLevel,
  handleSelect,
  isSidebarOpen,
  setIsSidebarOpen,
  selectedArticles,
  sidebarTitle,
  breadcrumb,
  downloadCSV
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/2 relative">
            <input
              type="text"
              placeholder="Search main topics to explore..."
              className="w-full py-3 px-4 pr-10 rounded-lg bg-white text-indigo-800 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500"
              size={20}
            />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white font-semibold">Search Levels:</span>
            <div className="flex space-x-2">
              {['All', 'L1', 'L2', 'L3'].map((lvl, index) => {
                const value = index === 0 ? 'all' : index;
                return (
                  <button
                    key={lvl}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      searchLevel.includes(value)
                        ? 'bg-white text-indigo-600'
                        : 'bg-indigo-400 text-white hover:bg-indigo-300'
                    }`}
                    onClick={() => {
                      setSearchLevel((prev) =>
                        prev.includes(value)
                          ? prev.filter((l) => l !== value)
                          : [value]
                      );
                    }}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={downloadCSV}
            className="bg-white text-indigo-600 py-2 px-4 rounded-lg flex items-center hover:bg-indigo-100 transition-colors duration-300"
          >
            <span className="mr-2">
              <FileText size={20} />
            </span>
            CSV
          </button>
        </div>
      </div>
      <div className="p-6">
        <TopicNode
          {...linkedInPulseTopicsData}
          searchTerm={searchTerm}
          searchLevel={searchLevel}
          onSelect={handleSelect}
          breadcrumb={[]}
        />
      </div>
    </div>
  );
};

export default HierarchyTab;
