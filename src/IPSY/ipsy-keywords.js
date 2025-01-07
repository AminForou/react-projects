import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { keywordData } from './data/data.js';
import Filters from './components/Filters';
import KeywordTable from './components/KeywordTable';
import CategoryAnalysis from './components/CategoryAnalysis';
import QuestionsAnalysis from './components/QuestionsAnalysis';
import CategoryDistribution from './components/CategoryDistribution';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import Sidebar from './components/Sidebar';

/**
 * IPSY Keywords Analysis Dashboard
 * File: ipsy-keywords.js
 * 
 * This is the main component and entry point for the IPSY Gap Analysis Dashboard application.
 * It orchestrates the entire dashboard, managing state and data flow between all sub-components.
 * 
 * Key Responsibilities:
 * 1. State Management:
 *    - Manages all filter states (categories, search volume, questions, keywords, competitors)
 *    - Controls pagination for the keyword table
 *    - Handles chart metric selection (search volume vs keyword count)
 *    - Manages selected keywords for bulk actions
 * 
 * 2. Data Processing:
 *    - Imports and processes the raw keyword data
 *    - Implements the main filtering logic based on user-selected criteria
 *    - Prepares and passes filtered data to child components
 * 
 * 3. User Interactions:
 *    - Handles keyword selection/deselection
 *    - Provides functionality for downloading all or selected keywords as CSV
 *    - Allows copying selected keywords to clipboard
 * 
 * 4. Component Composition:
 *    Renders and manages the following components:
 *    - Filters: For user input on various filtering criteria
 *    - KeywordTable: Displays paginated, filterable keyword data
 *    - CategoryAnalysis: Shows bar chart of keywords/volume by category
 *    - QuestionsAnalysis: Analyzes question-type keywords within categories
 *    - CategoryDistribution: Provides pie charts and tables for category distribution
 *    - CompetitorAnalysis: Visualizes competitor data and rankings
 * 
 * This component uses React hooks (useState, useMemo, useCallback) for efficient
 * state management and performance optimization. It implements responsive design
 * principles and consistent styling across all sub-components.
 * 
 * To use this dashboard:
 * 1. Ensure all sub-components are correctly imported
 * 2. Verify that the keyword data file (data.js) is in the correct location
 * 3. Import and render this component in your main App.js or routing configuration
 * 
 * Note: This dashboard is designed to handle large datasets efficiently. However,
 * for extremely large datasets, consider implementing server-side pagination and
 * filtering for optimal performance.
 */

const IpsyKeywordsAnalysis = () => {
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [searchVolumeFilter, setSearchVolumeFilter] = useState(0);
  const [questionFilter, setQuestionFilter] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [chartMetric, setChartMetric] = useState('searchVolume');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [rankRange, setRankRange] = useState([1, 10]);
  const [competitorDataType, setCompetitorDataType] = useState('count');
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('keywordTable');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [subcategoryFilters, setSubcategoryFilters] = useState([]);
  const [usageFilters, setUsageFilters] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const filteredData = useMemo(() => {
    return keywordData.filter(item => {
      const categoryMatch = categoryFilters.length === 0 || categoryFilters.includes(item.category);
      const volumeMatch = item.searchVolume >= searchVolumeFilter;
      const questionMatch = !questionFilter || item.isQuestion;
      const keywordMatch = keywordFilter === '' || 
        keywordFilter.split(',').some(keyword => 
          item.keyword.toLowerCase().includes(keyword.trim().toLowerCase())
        );
      const competitorMatch = item.competitors.some(comp => 
        (selectedCompetitors.length === 0 || selectedCompetitors.includes(comp.name)) &&
        comp.rank >= rankRange[0] && comp.rank <= rankRange[1]
      );
      const normalizedSubcategory = item.subcategory.charAt(0).toUpperCase() + item.subcategory.slice(1).toLowerCase();
      const subcategoryMatch = subcategoryFilters.length === 0 || subcategoryFilters.includes(normalizedSubcategory);
      const usageMatch = usageFilters.length === 0 || 
        item.usages.some(usage => usageFilters.includes(usage.toLowerCase()));

      return categoryMatch && volumeMatch && questionMatch && keywordMatch && 
             competitorMatch && subcategoryMatch && usageMatch;
    });
  }, [categoryFilters, searchVolumeFilter, questionFilter, keywordFilter, 
      selectedCompetitors, rankRange, subcategoryFilters, usageFilters]);

  const handleKeywordSelect = useCallback((keyword) => {
    setSelectedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  }, []);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div style={styles.container}>
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        activeView={activeView} 
        setActiveView={setActiveView}
      />
      
      <div style={styles.content}>
        <button 
          onClick={toggleSidebar} 
          style={{
            ...styles.menuButton,
            top: scrollPosition > 64 ? '20px' : '84px',
          }}
        >
          ☰
        </button>

        <h1 style={styles.header}>IPSY's Gap Analysis Dashboard</h1>
        
        <Filters
          categoryFilters={categoryFilters}
          setCategoryFilters={setCategoryFilters}
          searchVolumeFilter={searchVolumeFilter}
          setSearchVolumeFilter={setSearchVolumeFilter}
          questionFilter={questionFilter}
          setQuestionFilter={setQuestionFilter}
          keywordFilter={keywordFilter}
          setKeywordFilter={setKeywordFilter}
          showCompetitors={showCompetitors}
          setShowCompetitors={setShowCompetitors}
          selectedCompetitors={selectedCompetitors}
          setSelectedCompetitors={setSelectedCompetitors}
          rankRange={rankRange}
          setRankRange={setRankRange}
          subcategoryFilters={subcategoryFilters}
          setSubcategoryFilters={setSubcategoryFilters}
          usageFilters={usageFilters}
          setUsageFilters={setUsageFilters}
        />

        {activeView === 'keywordTable' && (
          <KeywordTable
            filteredData={filteredData}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            showCompetitors={showCompetitors}
            selectedKeywords={selectedKeywords}
            handleKeywordSelect={handleKeywordSelect}
          />
        )}

        {activeView === 'categoryAnalysis' && (
          <>
            <CategoryAnalysis
              filteredData={filteredData}
              chartMetric={chartMetric}
              setChartMetric={setChartMetric}
            />

            <QuestionsAnalysis
              filteredData={filteredData}
              chartMetric={chartMetric}
            />

            <CategoryDistribution
              filteredData={filteredData}
            />
          </>
        )}

        {activeView === 'competitorAnalysis' && (
          <CompetitorAnalysis
            filteredData={filteredData}
            competitorDataType={competitorDataType}
            setCompetitorDataType={setCompetitorDataType}
          />
        )}

      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  header: {
    color: '#6a0dad',
    borderBottom: '2px solid #6a0dad',
    paddingBottom: '20px',
    marginBottom: '40px',
    textAlign: 'center',
    fontSize: '2.5rem',
    fontWeight: '700',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  button: {
    backgroundColor: '#6a0dad',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
  },
  menuButton: {
    position: 'fixed',
    left: '20px',
    zIndex: 1001,
    background: '#6a0dad',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'top 0.3s ease-in-out',
  },
};

export default IpsyKeywordsAnalysis;