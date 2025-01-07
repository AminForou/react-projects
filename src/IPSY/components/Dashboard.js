import React, { useState, useMemo, useCallback } from 'react';
import { keywordData } from './ipsy/data/data.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import KeywordTable from './KeywordTable';

const Dashboard = () => {
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

      return categoryMatch && volumeMatch && questionMatch && keywordMatch && competitorMatch;
    });
  }, [categoryFilters, searchVolumeFilter, questionFilter, keywordFilter, selectedCompetitors, rankRange]);

  const categories = useMemo(() => [...new Set(keywordData.map(item => item.category))], []);

  const competitors = useMemo(() => {
    const allCompetitors = new Set();
    keywordData.forEach(item => {
      item.competitors.forEach(comp => {
        allCompetitors.add(comp.name);
      });
    });
    return Array.from(allCompetitors);
  }, []);

  const competitorOptions = useMemo(() => 
    competitors.map(comp => ({ value: comp, label: comp }))
  , [competitors]);

  const handleCategoryChange = useCallback((event) => {
    const value = event.target.value;
    setCategoryFilters(prev => {
      if (prev.includes(value)) {
        return prev.filter(cat => cat !== value);
      } else {
        return [...prev, value];
      }
    });
  }, []);

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

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>IPSY's Gap Analysis Dashboard</h1>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Filters</h2>
        <div style={styles.flexContainer}>
          <div style={styles.filterItem}>
            <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Categories</label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
              {categories.map(category => (
                <label key={category} style={styles.categoryItem}>
                  <input
                    type="checkbox"
                    value={category}
                    checked={categoryFilters.includes(category)}
                    onChange={handleCategoryChange}
                    style={styles.checkbox}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          <div style={styles.filterItem}>
            <label htmlFor="search-volume-filter" style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Minimum Search Volume</label>
            <input
              id="search-volume-filter"
              type="number"
              value={searchVolumeFilter}
              onChange={(e) => setSearchVolumeFilter(Number(e.target.value))}
              style={styles.input}
            />
          </div>

          <div style={styles.filterItem}>
            <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>
              <input
                type="checkbox"
                checked={questionFilter}
                onChange={(e) => setQuestionFilter(e.target.checked)}
                style={styles.checkbox}
              />
              Questions Only
            </label>
          </div>

          <div style={styles.filterItem}>
            <label htmlFor="keyword-filter" style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Keyword Filter</label>
            <input
              id="keyword-filter"
              type="text"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              placeholder="e.g., shampoo, soap"
              style={styles.input}
            />
          </div>

          <div style={styles.filterItem}>
            <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>
              <input
                type="checkbox"
                checked={showCompetitors}
                onChange={(e) => setShowCompetitors(e.target.checked)}
                style={styles.checkbox}
              />
              Show Competitors
            </label>
          </div>

          {showCompetitors && (
            <>
              <div style={styles.filterItem}>
                <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Select Competitors</label>
                <Select
                  isMulti
                  options={competitorOptions}
                  value={selectedCompetitors.map(comp => ({ value: comp, label: comp }))}
                  onChange={(selected) => setSelectedCompetitors(selected.map(option => option.value))}
                />
              </div>

              <div style={styles.filterItem}>
                <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Rank Range</label>
                <Slider
                  range
                  min={1}
                  max={50}
                  defaultValue={rankRange}
                  onChange={setRankRange}
                  style={styles.slider}
                />
                <div style={{marginTop: '5px'}}>
                  Showing ranks {rankRange[0]} to {rankRange[1]}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <KeywordTable
        filteredData={filteredData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        showCompetitors={showCompetitors}
        selectedKeywords={selectedKeywords}
        handleKeywordSelect={handleKeywordSelect}
      />

      {/* Add other components here (CategoryAnalysis, QuestionsAnalysis, CategoryDistribution, CompetitorAnalysis) */}

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
  sectionTitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#6a0dad',
  },
  flexContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '30px',
  },
  filterItem: {
    flex: '1 1 200px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },
  checkbox: {
    marginRight: '8px',
    accentColor: '#6a0dad',
  },
  categoryItem: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '0.9rem',
  },
  slider: {
    width: '100%',
    marginTop: '10px',
  },
};

export default Dashboard;