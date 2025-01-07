import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import { FaChartPie, FaThLarge } from 'react-icons/fa';

/**
 * CategoryDistribution Component
 * 
 * This component provides a detailed breakdown of how keywords and search volume
 * are distributed across different categories.
 * 
 * Features:
 * - Displays two pie charts: one for keyword count distribution and another for search volume distribution
 * - Includes interactive features like hover effects and tooltips
 * - Provides sortable tables below each chart for detailed numerical data
 * - Allows sorting of data by category name, count/volume, or percentage
 * 
 * This component helps identify which categories are most significant in terms of
 * keyword volume and search potential, aiding in prioritization of content and SEO efforts.
 */


const COLORS = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC949', '#AF7AA1', '#FF9DA7', '#9C755F', '#BAB0AB',
  '#86BCB6', '#FF9E1B', '#D37295', '#8CD17D', '#B6992D',
  '#499894', '#E15759', '#F28E2B', '#FFBE7D', '#FF6600',
  '#A14C58', '#4E79A7', '#76B7B2', '#FF9DA7', '#FFBF79'
];

const CategoryDistribution = ({ filteredData }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeIndexVolume, setActiveIndexVolume] = useState(null);
  const [countSortConfig, setCountSortConfig] = useState({ key: null, direction: 'ascending' });
  const [volumeSortConfig, setVolumeSortConfig] = useState({ key: null, direction: 'ascending' });
  const [chartType, setChartType] = useState('doughnut');

  const pieChartData = useMemo(() => {
    const groupedData = filteredData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { category: item.category, searchVolume: 0, count: 0 };
      }
      acc[item.category].searchVolume += item.searchVolume;
      acc[item.category].count += 1;
      return acc;
    }, {});

    const data = Object.values(groupedData);
    const totalSearchVolume = data.reduce((sum, item) => sum + item.searchVolume, 0);
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);

    return data.map(item => ({
      ...item,
      searchVolumePercentage: (item.searchVolume / totalSearchVolume) * 100,
      countPercentage: (item.count / totalCount) * 100
    }));
  }, [filteredData]);

  const sortedCountData = useMemo(() => {
    let sortableItems = [...pieChartData];
    if (countSortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = countSortConfig.key.includes('Percentage') ? parseFloat(a[countSortConfig.key]) : a[countSortConfig.key];
        const bValue = countSortConfig.key.includes('Percentage') ? parseFloat(b[countSortConfig.key]) : b[countSortConfig.key];
        if (aValue < bValue) {
          return countSortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return countSortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [pieChartData, countSortConfig]);
  
  const sortedVolumeData = useMemo(() => {
    let sortableItems = [...pieChartData];
    if (volumeSortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = volumeSortConfig.key.includes('Percentage') ? parseFloat(a[volumeSortConfig.key]) : a[volumeSortConfig.key];
        const bValue = volumeSortConfig.key.includes('Percentage') ? parseFloat(b[volumeSortConfig.key]) : b[volumeSortConfig.key];
        if (aValue < bValue) {
          return volumeSortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return volumeSortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [pieChartData, volumeSortConfig]);

  const requestSort = (key, sortConfig, setSortConfig) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, fill }) => {
    if (percent <= 0.04) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 60;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${name} ${(percent * 100).toFixed(0)}%`}
        </text>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={styles.tooltip}>
          <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: data.fill }}>{data.name || data.category}</p>
          <p style={{ margin: '0 0 3px' }}>{`${payload[0].name}: ${payload[0].value.toLocaleString()}`}</p>
          <p style={{ margin: '0' }}>{`Percentage: ${parseFloat(data.percentage || data.countPercentage || data.searchVolumePercentage || 0).toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const renderTreemapCell = (props) => {
    const { x, y, width, height, index, name, depth, root } = props;
    const isKeywordCount = root.name === 'Keyword Count';
    const percentage = isKeywordCount ? props.countPercentage : props.searchVolumePercentage;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: '#fff',
            strokeWidth: 1,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
          fontWeight="200"
          style={{
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            letterSpacing: '1px',
          }}
        >
          <tspan x={x + width / 2} dy="-0.5em">{name}</tspan>
          {percentage !== undefined && (
            <tspan x={x + width / 2} dy="1.2em">{`${percentage.toFixed(2)}%`}</tspan>
          )}
        </text>
      </g>
    );
  };

  const SortableTable = ({ data, sortConfig, requestSort, type }) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th} onClick={() => requestSort('category')}>
            Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
          </th>
          <th style={styles.th} onClick={() => requestSort(type === 'count' ? 'count' : 'searchVolume')}>
            {type === 'count' ? 'Count' : 'Volume'} {sortConfig.key === (type === 'count' ? 'count' : 'searchVolume') && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
          </th>
          <th style={styles.th} onClick={() => requestSort(type === 'count' ? 'countPercentage' : 'searchVolumePercentage')}>
            Percentage {sortConfig.key === (type === 'count' ? 'countPercentage' : 'searchVolumePercentage') && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={item.category} style={{backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'}}>
            <td style={styles.td}>{item.category}</td>
            <td style={styles.td}>{type === 'count' ? item.count.toLocaleString() : item.searchVolume.toLocaleString()}</td>
            <td style={styles.td}>{(type === 'count' ? item.countPercentage : item.searchVolumePercentage).toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderChart = (data, chartType, dataKey, activeIndex, setActiveIndex) => {
    switch (chartType) {
      case 'pie':
      case 'doughnut':
        return (
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={chartType === 'doughnut' ? 60 : 0}
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
            label={renderCustomLabel}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        );
      case 'treemap':
        return (
          <Treemap
            data={data}
            dataKey={dataKey}
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={renderTreemapCell}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        );
      default:
        return null;
    }
  };

  const ChartTypeSelector = ({ chartType, setChartType }) => (
    <div style={styles.selectorContainer}>
      <div style={styles.selectorGroup}>
        <button
          style={{
            ...styles.selectorButton,
            backgroundColor: chartType === 'doughnut' ? '#6a0dad' : 'white',
            color: chartType === 'doughnut' ? 'white' : '#6a0dad',
          }}
          onClick={() => setChartType('doughnut')}
        >
          Doughnut
        </button>
        <button
          style={{
            ...styles.selectorButton,
            backgroundColor: chartType === 'pie' ? '#6a0dad' : 'white',
            color: chartType === 'pie' ? 'white' : '#6a0dad',
          }}
          onClick={() => setChartType('pie')}
        >
          <FaChartPie style={styles.icon} /> Pie
        </button>
        <button
          style={{
            ...styles.selectorButton,
            backgroundColor: chartType === 'treemap' ? '#6a0dad' : 'white',
            color: chartType === 'treemap' ? 'white' : '#6a0dad',
          }}
          onClick={() => setChartType('treemap')}
        >
          <FaThLarge style={styles.icon} /> Treemap
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Category Distribution</h2>
      <ChartTypeSelector chartType={chartType} setChartType={setChartType} />
      <div style={styles.flexContainer}>
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>By Keyword Count</h3>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'treemap' ? (
              <Treemap
                data={[{
                  name: 'Keyword Count',
                  children: pieChartData.map(item => ({
                    name: item.category,
                    size: item.count,
                    countPercentage: item.countPercentage || 0
                  }))
                }]}
                dataKey="size"
                ratio={4/3}
                stroke="#fff"
                fill="#8884d8"
                content={renderTreemapCell}
              >
                <Tooltip content={<CustomTooltip />} />
              </Treemap>
            ) : (
              <PieChart>
                {renderChart(pieChartData, chartType, "count", activeIndex, setActiveIndex)}
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
          <div style={styles.tableContainer}>
            <SortableTable 
              data={sortedCountData} 
              sortConfig={countSortConfig} 
              requestSort={(key) => requestSort(key, countSortConfig, setCountSortConfig)}
              type="count"
            />
          </div>
        </div>
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>By Search Volume</h3>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'treemap' ? (
              <Treemap
                data={[{
                  name: 'Search Volume',
                  children: pieChartData.map(item => ({
                    name: item.category,
                    size: item.searchVolume,
                    searchVolumePercentage: item.searchVolumePercentage || 0
                  }))
                }]}
                dataKey="size"
                ratio={4/3}
                stroke="#fff"
                fill="#8884d8"
                content={renderTreemapCell}
              >
                <Tooltip content={<CustomTooltip />} />
              </Treemap>
            ) : (
              <PieChart>
                {renderChart(pieChartData, chartType, "searchVolume", activeIndexVolume, setActiveIndexVolume)}
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
          <div style={styles.tableContainer}>
            <SortableTable 
              data={sortedVolumeData} 
              sortConfig={volumeSortConfig} 
              requestSort={(key) => requestSort(key, volumeSortConfig, setVolumeSortConfig)}
              type="volume"
            />
          </div>
        </div>
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
  flexContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '30px',
  },
  chartContainer: {
    flex: '1 1 400px',
  },
  chartTitle: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '1.2rem',
  },
  tableContainer: {
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#6a0dad',
    color: 'white',
    padding: '10px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #ddd',
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  selectorContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  selectorGroup: {
    display: 'inline-flex',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
  },
  selectorButton: {
    padding: '10px 15px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s, color 0.3s',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '5px',
    fontSize: '16px',
  },
};

export default CategoryDistribution;