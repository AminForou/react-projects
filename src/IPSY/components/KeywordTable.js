import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { FaSortUp, FaSortDown, FaColumns } from 'react-icons/fa';

/**
 * KeywordTable Component
 * 
 * This component displays the filtered keyword data in a paginated table format.
 * It also provides functionality for downloading and copying selected keywords,
 * and displays statistics about the selected keywords.
 * 
 * Features:
 * - Displays keywords with their categories and search volumes
 * - Shows competitor information when enabled
 * - Provides checkboxes for selecting individual keywords
 * - Implements pagination for large datasets
 * - Allows for selecting all visible keywords on the current page
 * - Provides buttons for downloading all data, selected data, and copying selected data
 * - Displays statistics about selected keywords
 * - Allows users to adjust column widths
 * - Allows users to select which columns to display
 * - Enables sorting by search volume
 * 
 * The component receives filtered data, pagination controls, and keyword
 * selection handlers as props from the parent Dashboard component.
 */

const KeywordTable = ({
  filteredData,
  currentPage,
  setCurrentPage,
  showCompetitors,
  selectedKeywords,
  handleKeywordSelect
}) => {
  const [allVisibleSelected, setAllVisibleSelected] = useState(false);
  const [columnWidths, setColumnWidths] = useState({
    keyword: 200,
    category: 150,
    subcategory: 150,
    volume: 100,
    usages: 200,
    competitors: 200,
  });
  const [visibleColumns, setVisibleColumns] = useState({
    keyword: true,
    category: true,
    subcategory: true,
    volume: true,
    usages: false,
    competitors: false,
  });
  const [sortOrder, setSortOrder] = useState('desc');

  const itemsPerPage = 100;

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      return sortOrder === 'asc' ? a.searchVolume - b.searchVolume : b.searchVolume - a.searchVolume;
    });
  }, [filteredData, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSelectAllVisible = useCallback((event) => {
    const isChecked = event.target.checked;
    setAllVisibleSelected(isChecked);

    const visibleKeywords = paginatedData.map(item => item.keyword);
    visibleKeywords.forEach(keyword => {
      handleKeywordSelect(keyword);
    });
  }, [paginatedData, handleKeywordSelect]);

  useEffect(() => {
    setAllVisibleSelected(false);
  }, [currentPage, filteredData]);

  const capitalizeFirstLetter = (string) => {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const downloadCSV = useCallback(() => {
    const csvContent = [
      ['keyword', 'category', 'search volume'],
      ...filteredData.map(item => [item.keyword, item.category, item.searchVolume])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'ipsy_gap_analysis.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [filteredData]);

  const copySelectedKeywords = useCallback(() => {
    const selectedData = filteredData
      .filter(item => selectedKeywords.has(item.keyword))
      .map(item => `${item.keyword},${item.category},${item.searchVolume}`)
      .join('\n');
    navigator.clipboard.writeText(`keyword,category,search volume\n${selectedData}`);
    alert('Selected keywords copied to clipboard!');
  }, [filteredData, selectedKeywords]);

  const downloadSelectedKeywords = useCallback(() => {
    const selectedData = filteredData
      .filter(item => selectedKeywords.has(item.keyword))
      .map(item => `${item.keyword},${item.category},${item.searchVolume}`)
      .join('\n');
    const csvContent = `keyword,category,search volume\n${selectedData}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'selected_keywords.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [filteredData, selectedKeywords]);

  const selectedKeywordsStats = useMemo(() => {
    const selectedItems = filteredData.filter(item => selectedKeywords.has(item.keyword));
    const totalSearchVolume = selectedItems.reduce((sum, item) => sum + item.searchVolume, 0);
    return { totalKeywords: selectedItems.length, totalSearchVolume };
  }, [filteredData, selectedKeywords]);

  const handleResize = useCallback((columnName, data) => {
    setColumnWidths(prevWidths => ({
      ...prevWidths,
      [columnName]: data.size.width,
    }));
  }, []);

  const toggleColumnVisibility = useCallback((columnName) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  }, []);

  const handleSortToggle = useCallback(() => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  }, []);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Filtered Keywords</h2>
      <div style={styles.buttonContainer}>
        <button onClick={downloadCSV} style={styles.button}>
          Download All CSV
        </button>
        {selectedKeywords.size > 0 && (
          <>
            <button onClick={copySelectedKeywords} style={styles.button}>
              Copy Selected
            </button>
            <button onClick={downloadSelectedKeywords} style={styles.button}>
              Download Selected
            </button>
          </>
        )}
        <div style={styles.columnSelector}>
          <FaColumns style={{ marginRight: '5px' }} />
          <span>Columns:</span>
          {Object.keys(visibleColumns).map(column => (
            <label key={column} style={styles.columnLabel}>
              <input
                type="checkbox"
                checked={visibleColumns[column]}
                onChange={() => toggleColumnVisibility(column)}
                style={styles.checkbox}
              />
              {capitalizeFirstLetter(column)}
            </label>
          ))}
        </div>
      </div>
      <div style={styles.statsContainer}>
        <p><strong>Total Selected Keywords:</strong> {selectedKeywordsStats.totalKeywords.toLocaleString()}</p>
        <p><strong>Total Search Volume for Selected Keywords:</strong> {selectedKeywordsStats.totalSearchVolume.toLocaleString()}</p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '50px' }}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={handleSelectAllVisible}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#6a0dad'
                  }}
                />
              </th>
              {visibleColumns.keyword && (
                <Resizable
                  width={columnWidths.keyword}
                  height={0}
                  onResize={(e, data) => handleResize('keyword', data)}
                >
                  <th style={{ ...styles.th, width: columnWidths.keyword }}>Keyword</th>
                </Resizable>
              )}
              {visibleColumns.category && (
                <Resizable
                  width={columnWidths.category}
                  height={0}
                  onResize={(e, data) => handleResize('category', data)}
                >
                  <th style={{ ...styles.th, width: columnWidths.category }}>Category</th>
                </Resizable>
              )}
              {visibleColumns.subcategory && (
                <Resizable
                  width={columnWidths.subcategory}
                  height={0}
                  onResize={(e, data) => handleResize('subcategory', data)}
                >
                  <th style={{ ...styles.th, width: columnWidths.subcategory }}>Subcategory</th>
                </Resizable>
              )}
              {visibleColumns.volume && (
                <Resizable
                  width={columnWidths.volume}
                  height={0}
                  onResize={(e, data) => handleResize('volume', data)}
                >
                  <th style={{ ...styles.th, width: columnWidths.volume, cursor: 'pointer' }} onClick={handleSortToggle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      Volume {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                    </div>
                  </th>
                </Resizable>
              )}
              {visibleColumns.usages && (
                <Resizable
                  width={columnWidths.usages}
                  height={0}
                  onResize={(e, data) => handleResize('usages', data)}
                >
                  <th style={{ ...styles.th, width: columnWidths.usages }}>Usages</th>
                </Resizable>
              )}
              {visibleColumns.competitors && showCompetitors && (
                <Resizable
                  width={columnWidths.competitors}
                  height={0}
                  onResize={(e, data) => handleResize('competitors', data)}
                >
                  <th style={{ ...styles.th, width: columnWidths.competitors }}>Competitors</th>
                </Resizable>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item.keyword} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                <td style={{ ...styles.td, width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedKeywords.has(item.keyword)}
                    onChange={() => handleKeywordSelect(item.keyword)}
                    style={{
                      ...styles.checkbox,
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#6a0dad'
                    }}
                  />
                </td>
                {visibleColumns.keyword && (
                  <td style={{ ...styles.td, width: columnWidths.keyword }}>
                    {capitalizeFirstLetter(item.keyword)}
                    {item.isQuestion && (
                      <span style={styles.questionTag}>Question</span>
                    )}
                  </td>
                )}
                {visibleColumns.category && (
                  <td style={{ ...styles.td, width: columnWidths.category }}>{item.category}</td>
                )}
                {visibleColumns.subcategory && (
                  <td style={{ ...styles.td, width: columnWidths.subcategory }}>{item.subcategory}</td>
                )}
                {visibleColumns.volume && (
                  <td style={{ ...styles.td, width: columnWidths.volume }}>{item.searchVolume.toLocaleString()}</td>
                )}
                {visibleColumns.usages && (
                  <td style={{ ...styles.td, width: columnWidths.usages }}>
                    {item.usages.map((usage, index) => (
                      <span key={usage}>
                        {usage}
                        {index < item.usages.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </td>
                )}
                {visibleColumns.competitors && showCompetitors && (
                  <td style={{ ...styles.td, width: columnWidths.competitors }}>
                    {item.competitors.map(competitor => (
                      competitor.name === 'ipsy.com' ? (
                        <span key={competitor.name} style={styles.ipsyTag}>
                          IPSY: {competitor.rank}
                        </span>
                      ) : (
                        <span key={competitor.name} style={styles.competitorTag}>
                          {competitor.name}: {competitor.rank}
                        </span>
                      )
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ ...styles.button, opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          Previous
        </button>
        <span style={{ fontSize: '1rem', fontWeight: '600' }}>
          Page {currentPage} of {Math.ceil(sortedData.length / itemsPerPage)}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedData.length / itemsPerPage)))}
          disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
          style={{ ...styles.button, opacity: currentPage === Math.ceil(sortedData.length / itemsPerPage) ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const styles = {
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
  buttonContainer: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  statsContainer: {
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderSpacing: '0',
  },
  th: {
    backgroundColor: '#6a0dad',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    fontWeight: '600',
    fontSize: '0.95rem',
    borderRight: '1px solid #ddd',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderRight: '1px solid #ddd',
  },
  checkbox: {
    marginRight: '8px',
    accentColor: '#6a0dad',
  },
  questionTag: {
    backgroundColor: '#6a0dad',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '0.8em',
    marginLeft: '8px',
    fontWeight: '600',
  },
  competitorTag: {
    display: 'inline-block',
    padding: '2px 6px',
    margin: '2px',
    borderRadius: '12px',
    fontSize: '0.8em',
    backgroundColor: '#e0e0e0',
    color: '#333',
  },
  ipsyTag: {
    display: 'inline-block',
    padding: '2px 6px',
    margin: '2px',
    borderRadius: '12px',
    fontSize: '0.8em',
    background: 'linear-gradient(45deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
    color: 'white',
    fontWeight: 'bold',
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
    marginRight: '10px',
  },
  columnSelector: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  columnLabel: {
    marginLeft: '10px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
  },
};

export default KeywordTable;
