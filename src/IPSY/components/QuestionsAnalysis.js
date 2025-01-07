import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * QuestionsAnalysis Component
 * 
 * This component focuses on analyzing and visualizing question-type keywords within categories.
 * 
 * Features:
 * - Displays a bar chart showing either search volume or count of question keywords per category
 * - Uses the same metric (search volume or count) as the main CategoryAnalysis component
 * - Provides tooltips for detailed information on hover
 * 
 * The component helps identify categories with high question-based search intent,
 * which can be valuable for content strategy and FAQ development.
 */

const QuestionsAnalysis = ({ filteredData, chartMetric }) => {
  const questionChartData = useMemo(() => {
    const groupedData = filteredData.reduce((acc, item) => {
      if (item.isQuestion) {
        if (!acc[item.category]) {
          acc[item.category] = { category: item.category, searchVolume: 0, count: 0 };
        }
        acc[item.category].searchVolume += item.searchVolume;
        acc[item.category].count += 1;
      }
      return acc;
    }, {});
    return Object.values(groupedData);
  }, [filteredData]);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Questions Analysis</h2>
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={questionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
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
              fill="#4ECDC4"
              name={chartMetric === 'searchVolume' ? 'Search Volume' : 'Question Count'}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={styles.description}>
        This chart shows the distribution of questions across categories based on {chartMetric === 'searchVolume' ? 'search volume' : 'question count'}.
      </p>
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
  chartContainer: {
    width: '100%',
    height: '400px',
  },
  description: {
    marginTop: '20px',
    fontSize: '1rem',
    color: '#666',
    textAlign: 'center',
  },
};

export default QuestionsAnalysis;