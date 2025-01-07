import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


/**
 * CategoryAnalysis Component
 * 
 * This component provides a visual representation of keyword data grouped by categories.
 * 
 * Features:
 * - Displays a bar chart showing either search volume or keyword count per category
 * - Allows switching between search volume and keyword count metrics
 * - Provides tooltips for detailed information on hover
 * 
 * The component uses the Recharts library for creating responsive and interactive charts.
 * It receives filtered data and chart metric controls as props from the parent Dashboard component.
 */


const CategoryAnalysis = ({ filteredData, chartMetric, setChartMetric }) => {
  const chartData = useMemo(() => {
    const groupedData = filteredData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { category: item.category, searchVolume: 0, count: 0 };
      }
      acc[item.category].searchVolume += item.searchVolume;
      acc[item.category].count += 1;
      return acc;
    }, {});
    return Object.values(groupedData);
  }, [filteredData]);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Category Analysis</h2>
      <div style={styles.controlsContainer}>
        <label htmlFor="chart-metric" style={styles.label}>Select Metric:</label>
        <select 
          id="chart-metric"
          onChange={(e) => setChartMetric(e.target.value)} 
          value={chartMetric}
          style={styles.select}
        >
          <option value="searchVolume">Search Volume</option>
          <option value="count">Keyword Count</option>
        </select>
      </div>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <XAxis 
              dataKey="category" 
              interval={0}
              tick={{ angle: -45, textAnchor: 'end', fontSize: 12 }}
              height={70}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => chartMetric === 'searchVolume' ? value.toLocaleString() : value}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Bar 
              dataKey={chartMetric} 
              fill="#6a0dad"
              name={chartMetric === 'searchVolume' ? 'Search Volume' : 'Keyword Count'}
            />
          </BarChart>
        </ResponsiveContainer>
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
  controlsContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  label: {
    marginRight: '10px',
    fontWeight: '600',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    fontSize: '1rem',
    color: '#333',
  },
  chartContainer: {
    width: '100%',
    height: '400px',
  },
};

export default CategoryAnalysis;