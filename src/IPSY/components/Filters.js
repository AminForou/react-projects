import React, { useMemo, useState, useEffect } from 'react';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { keywordData } from '../data/data.js';
import { Dropdown } from 'react-bootstrap';
import { FaSearch, FaFilter } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Filters Component
 * 
 *This component provides the user interface for all filtering options
 * in the IPSY Gap Analysis Dashboard.
 * 
 * Features:
 * - Category selection (multi-select checkboxes)
 * - Minimum search volume input
 * - Questions only toggle
 * - Keyword filter input
 * - Competitor filter toggle and selection
 * - Competitor rank range slider
 * 
 * The component receives filter states and setter functions as props
 * from the parent Dashboard component, allowing for centralized state management.
 */


const Filters = ({
  categoryFilters,
  setCategoryFilters,
  subcategoryFilters,
  setSubcategoryFilters,
  usageFilters,
  setUsageFilters,
  searchVolumeFilter,
  setSearchVolumeFilter,
  questionFilter,
  setQuestionFilter,
  keywordFilter,
  setKeywordFilter,
  showCompetitors,
  setShowCompetitors,
  selectedCompetitors,
  setSelectedCompetitors,
  rankRange,
  setRankRange
}) => {
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const categories = useMemo(() => [...new Set(keywordData.map(item => item.category))], []);
  
  const subcategories = useMemo(() => {
    const subCats = new Set(
      keywordData
        .filter(item => categoryFilters.length === 0 || categoryFilters.includes(item.category))
        .map(item => item.subcategory.charAt(0).toUpperCase() + item.subcategory.slice(1).toLowerCase())
    );
    return Array.from(subCats).sort();
  }, [categoryFilters]);

  const subcategoryCountsByCategory = useMemo(() => {
    const counts = {};
    keywordData.forEach(item => {
      if (!counts[item.category]) {
        counts[item.category] = new Set();
      }
      counts[item.category].add(item.subcategory.toLowerCase());
    });
    return Object.fromEntries(
      Object.entries(counts).map(([category, set]) => [category, set.size])
    );
  }, []);

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter(sub => 
      sub.toLowerCase().includes(subcategorySearch.toLowerCase())
    );
  }, [subcategories, subcategorySearch]);

  const usageOptions = ["Blog", "Product Page", "Social Media", "Videos"];

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

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCategoryFilters(prev => {
      if (prev.includes(value)) {
        return prev.filter(cat => cat !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  useEffect(() => {
    setSubcategoryFilters([]);
  }, [categoryFilters]);

  return (
    <div style={styles.section}>
      <div style={styles.filterHeader}>
        <h2 style={styles.sectionTitle}>Filters</h2>
        <button 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={styles.advancedButton}
        >
          <FaFilter style={{marginRight: '5px'}} />
          {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </div>

      <div style={styles.mainFilters}>
        {/* Primary Filters Row */}
        <div style={styles.primaryFilters}>
          {/* Categories Dropdown */}
          <div style={styles.filterDropdown} className="dropdown">
            <Dropdown 
              align="start"
            >
              <Dropdown.Toggle style={styles.dropdownToggle}>
                Categories ({categoryFilters.length || 'All'})
              </Dropdown.Toggle>
              <Dropdown.Menu style={styles.dropdownMenu}>
                <div style={styles.dropdownScroll}>
                  {categories.map(category => (
                    <div key={category} style={styles.dropdownItem}>
                      <label style={styles.dropdownLabel}>
                        <input
                          type="checkbox"
                          value={category}
                          checked={categoryFilters.includes(category)}
                          onChange={handleCategoryChange}
                          style={styles.checkbox}
                        />
                        <span style={styles.dropdownText}>
                          {category} ({subcategoryCountsByCategory[category]})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Subcategories Dropdown */}
          <div style={styles.filterDropdown} className="dropdown">
            <Dropdown 
              align="start"
            >
              <Dropdown.Toggle 
                style={styles.dropdownToggle}
                disabled={categoryFilters.length === 0}
              >
                Subcategories ({subcategoryFilters.length || 'All'})
              </Dropdown.Toggle>
              <Dropdown.Menu style={styles.dropdownMenu}>
                <input
                  type="text"
                  value={subcategorySearch}
                  onChange={(e) => setSubcategorySearch(e.target.value)}
                  placeholder="Search subcategories..."
                  style={styles.searchInput}
                />
                <div style={styles.dropdownScroll}>
                  {filteredSubcategories.map(subcategory => (
                    <label key={subcategory} style={styles.dropdownItem}>
                      <input
                        type="checkbox"
                        value={subcategory}
                        checked={subcategoryFilters.includes(subcategory)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSubcategoryFilters(prev => {
                            if (prev.includes(value)) {
                              return prev.filter(sub => sub !== value);
                            } else {
                              return [...prev, value];
                            }
                          });
                        }}
                        style={styles.checkbox}
                      />
                      {subcategory}
                    </label>
                  ))}
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Usage Types Dropdown */}
          <div style={styles.filterDropdown} className="dropdown">
            <Dropdown 
              align="start"
            >
              <Dropdown.Toggle style={styles.dropdownToggle}>
                Usage Types ({usageFilters.length || 'All'})
              </Dropdown.Toggle>
              <Dropdown.Menu style={styles.dropdownMenu}>
                {usageOptions.map(usage => (
                  <label key={usage} style={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      value={usage.toLowerCase()}
                      checked={usageFilters.includes(usage.toLowerCase())}
                      onChange={(e) => {
                        const value = e.target.value;
                        setUsageFilters(prev => {
                          if (prev.includes(value)) {
                            return prev.filter(u => u !== value);
                          } else {
                            return [...prev, value];
                          }
                        });
                      }}
                      style={styles.checkbox}
                    />
                    {usage}
                  </label>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Keyword Search */}
          <div style={styles.searchContainer}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              placeholder="Search keywords..."
              style={styles.searchField}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div style={styles.advancedFilters}>
            <div style={styles.filterRow}>
              {/* Min Search Volume */}
              <div style={styles.filterItem}>
                <label style={styles.label}>Min Search Volume</label>
                <input
                  type="number"
                  value={searchVolumeFilter}
                  onChange={(e) => setSearchVolumeFilter(Number(e.target.value))}
                  style={styles.input}
                />
              </div>

              {/* Questions Only Toggle */}
              <div style={styles.filterItem}>
                <label style={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={questionFilter}
                    onChange={(e) => setQuestionFilter(e.target.checked)}
                    style={styles.checkbox}
                  />
                  Questions Only
                </label>
              </div>

              {/* Competitor Controls */}
              {showCompetitors && (
                <>
                  <div style={styles.filterItem}>
                    <Select
                      isMulti
                      options={competitorOptions}
                      value={selectedCompetitors.map(comp => ({ value: comp, label: comp }))}
                      onChange={(selected) => setSelectedCompetitors(selected.map(option => option.value))}
                      placeholder="Select competitors..."
                    />
                  </div>
                  <div style={styles.filterItem}>
                    <label style={styles.label}>Rank Range: {rankRange[0]} - {rankRange[1]}</label>
                    <Slider
                      range
                      min={1}
                      max={50}
                      value={rankRange}
                      onChange={setRankRange}
                      style={styles.slider}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    margin: 0,
    color: '#6a0dad',
  },
  mainFilters: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  primaryFilters: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterDropdown: {
    position: 'relative',
    width: '200px',
  },
  dropdownToggle: {
    width: '100%',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    color: '#333',
    padding: '8px 12px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(106, 13, 173, 0.25)',
    },
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    padding: '8px 0',
    maxHeight: '300px',
    width: '350px',
    position: 'absolute',
    zIndex: 1000,
    left: '0',
    marginTop: '4px',
  },
  dropdownScroll: {
    maxHeight: '250px',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
  },
  dropdownItem: {
    padding: '4px 8px',
    display: 'block',
    width: '100%',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  dropdownLabel: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    cursor: 'pointer',
    margin: 0,
  },
  dropdownText: {
    marginLeft: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  checkbox: {
    marginRight: '8px',
    cursor: 'pointer',
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    minWidth: '200px',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
  },
  searchField: {
    width: '100%',
    padding: '8px 12px 8px 35px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.9rem',
  },
  advancedFilters: {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
  },
  filterRow: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  advancedButton: {
    backgroundColor: 'transparent',
    border: '1px solid #6a0dad',
    color: '#6a0dad',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  filterItem: {
    flex: '1 1 200px',
  },
  categoryItem: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },
  slider: {
    width: '100%',
    marginTop: '10px',
  },
  divider: {
    borderTop: '1px solid #ddd',
    margin: '8px 0',
  },
  selectedCount: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '5px',
    textAlign: 'right',
  },
  searchInput: {
    width: 'calc(100% - 16px)',
    margin: '8px',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#6a0dad',
      boxShadow: '0 0 0 2px rgba(106, 13, 173, 0.1)',
    },
    '&::placeholder': {
      color: '#999',
    },
    backgroundColor: '#f8f9fa',
  }
};

export default Filters;
