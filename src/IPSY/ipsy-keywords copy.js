// import React, { useState, useMemo, useCallback, useEffect } from 'react';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
// import { keywordData } from './ipsy/data/data.js';
// import { Info } from 'lucide-react';
// import Select from 'react-select';
// import Slider from 'rc-slider';
// import 'rc-slider/assets/index.css';


// const COLORS = [
//   '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
//   '#EDC949', '#AF7AA1', '#FF9DA7', '#9C755F', '#BAB0AB',
//   '#86BCB6', '#FF9E1B', '#D37295', '#8CD17D', '#B6992D',
//   '#499894', '#E15759', '#F28E2B', '#FFBE7D', '#FF6600',
//   '#A14C58', '#4E79A7', '#76B7B2', '#FF9DA7', '#FFBF79'
// ];


// const capitalizeFirstLetter = (string) => {
//   return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
// };

// const Dashboard = () => {
//   const [categoryFilters, setCategoryFilters] = useState([]);
//   const [searchVolumeFilter, setSearchVolumeFilter] = useState(0);
//   const [questionFilter, setQuestionFilter] = useState(false);
//   const [keywordFilter, setKeywordFilter] = useState('');
//   const [chartMetric, setChartMetric] = useState('searchVolume');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 100;
//   const data = keywordData;
//   const [countSortConfig, setCountSortConfig] = useState({ key: null, direction: 'ascending' });
//   const [volumeSortConfig, setVolumeSortConfig] = useState({ key: null, direction: 'ascending' });
//   const [activeIndex, setActiveIndex] = useState(null);
//   const [activeIndexCount, setActiveIndexCount] = useState(null);
//   const [activeIndexVolume, setActiveIndexVolume] = useState(null);
//   const [showCompetitors, setShowCompetitors] = useState(true);
//   const [selectedCompetitors, setSelectedCompetitors] = useState([]);
//   const [rankRange, setRankRange] = useState([1, 10]);
//   const [competitorSortConfig, setCompetitorSortConfig] = useState({ key: null, direction: 'ascending' });
//   const [competitorMetric, setCompetitorMetric] = useState('count');
//   const [competitorDataType, setCompetitorDataType] = useState('count');
//   const [selectedKeywords, setSelectedKeywords] = useState(new Set());
//   const [allVisibleSelected, setAllVisibleSelected] = useState(false);




//   const styles = {
//     container: {
//       fontFamily: "'Poppins', sans-serif",
//       maxWidth: '1400px',
//       margin: '0 auto',
//       padding: '40px 20px',
//       backgroundColor: '#f8f9fa',
//       color: '#333',
//     },
//     header: {
//       color: '#6a0dad',
//       borderBottom: '2px solid #6a0dad',
//       paddingBottom: '20px',
//       marginBottom: '40px',
//       textAlign: 'center',
//       fontSize: '2.5rem',
//       fontWeight: '700',
//     },
//     section: {
//       backgroundColor: 'white',
//       borderRadius: '12px',
//       padding: '30px',
//       marginBottom: '40px',
//       boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//       transition: 'all 0.3s ease',
//     },
//     flexContainer: {
//       display: 'flex',
//       flexWrap: 'wrap',
//       gap: '30px',
//     },
//     filterItem: {
//       flex: '1 1 200px',
//     },
//     input: {
//       width: '100%',
//       padding: '12px',
//       border: '1px solid #ddd',
//       borderRadius: '8px',
//       fontSize: '1rem',
//       transition: 'border-color 0.3s ease',
//     },
//     select: {
//       width: '200px',
//       padding: '12px',
//       border: '1px solid #ddd',
//       borderRadius: '8px',
//       fontSize: '1rem',
//       appearance: 'none',
//       backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236a0dad' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")",
//       backgroundRepeat: 'no-repeat',
//       backgroundPosition: 'right 12px center',
//       paddingRight: '30px', // Add space for the dropdown arrow
//     },
//     chartContainer: {
//       marginTop: '20px',
//       width: '100%',
//       height: '400px',
//     },
//     button: {
//       backgroundColor: '#6a0dad',
//       color: 'white',
//       border: 'none',
//       padding: '12px 20px',
//       borderRadius: '8px',
//       cursor: 'pointer',
//       fontSize: '1rem',
//       fontWeight: '600',
//       transition: 'background-color 0.3s ease',
//     },
//     table: {
//       width: '100%',
//       borderSpacing: '0 10px',
//     },
//     th: {
//       backgroundColor: '#6a0dad',
//       color: 'white',
//       padding: '15px',
//       textAlign: 'left',
//     },
//     td: {
//       padding: '8px',
//       borderBottom: '1px solid #eee',
//       transition: 'background-color 0.3s ease',
//     },
//     questionTag: {
//       backgroundColor: '#6a0dad',
//       color: 'white',
//       padding: '4px 8px',
//       borderRadius: '20px',
//       fontSize: '0.8em',
//       marginLeft: '8px',
//       fontWeight: '600',
//     },
//     checkbox: {
//       marginRight: '8px',
//       accentColor: '#6a0dad',
//     },
//     categoryItem: {
//       display: 'block',
//       marginBottom: '10px',
//       fontSize: '0.9rem',
//     },
//     sectionTitle: {
//       fontSize: '1.8rem',
//       marginBottom: '20px',
//       color: '#6a0dad',
//     },
//     competitorTag: {
//       display: 'inline-block',
//       padding: '2px 6px',
//       margin: '2px',
//       borderRadius: '12px',
//       fontSize: '0.8em',
//       backgroundColor: '#e0e0e0',
//       color: '#333',
//     },
//     ipsyTag: {
//       display: 'inline-block',
//       padding: '2px 6px',
//       margin: '2px',
//       borderRadius: '12px',
//       fontSize: '0.8em',
//       background: 'linear-gradient(45deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
//       color: 'white',
//       fontWeight: 'bold',
//     },
//     ipsyIcon: {
//       display: 'inline-flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       width: '20px',
//       height: '20px',
//       borderRadius: '50%',
//       backgroundColor: '#6a0dad',
//       color: 'white',
//       fontSize: '0.8em',
//       marginLeft: '5px',
//       cursor: 'pointer',
//     },
//     competitorFilter: {
//       marginBottom: '20px',
//     },
//     checkbox: {
//       marginRight: '8px',
//       accentColor: '#6a0dad',
//     },
//     slider: {
//       width: '100%',
//       marginTop: '10px',
//     },
//   };

//   const categories = useMemo(() => [...new Set(data.map(item => item.category))], []);

  
//   const filteredData = useMemo(() => {
//     return data.filter(item => {
//       const categoryMatch = categoryFilters.length === 0 || categoryFilters.includes(item.category);
//       const volumeMatch = item.searchVolume >= searchVolumeFilter;
//       const questionMatch = !questionFilter || item.isQuestion;
//       const keywordMatch = keywordFilter === '' || 
//         keywordFilter.split(',').some(keyword => 
//           item.keyword.toLowerCase().includes(keyword.trim().toLowerCase())
//         );
//       const competitorMatch = item.competitors.some(comp => 
//         (selectedCompetitors.length === 0 || selectedCompetitors.includes(comp.name)) &&
//         comp.rank >= rankRange[0] && comp.rank <= rankRange[1]
//       );

//       return categoryMatch && volumeMatch && questionMatch && keywordMatch && competitorMatch;
//     });
//   }, [categoryFilters, searchVolumeFilter, questionFilter, keywordFilter, selectedCompetitors, rankRange]);

//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredData.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredData, currentPage]);

//   const chartData = useMemo(() => {
//     const groupedData = filteredData.reduce((acc, item) => {
//       if (!acc[item.category]) {
//         acc[item.category] = { category: item.category, searchVolume: 0, count: 0 };
//       }
//       acc[item.category].searchVolume += item.searchVolume;
//       acc[item.category].count += 1;
//       return acc;
//     }, {});
//     return Object.values(groupedData);
//   }, [filteredData]);

//   const questionChartData = useMemo(() => {
//     return chartData.filter(item => 
//       filteredData.some(dataItem => dataItem.category === item.category && dataItem.isQuestion)
//     );
//   }, [chartData, filteredData]);

//   const pieChartData = useMemo(() => {
//     const totalSearchVolume = chartData.reduce((sum, item) => sum + item.searchVolume, 0);
//     const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
//     return chartData.map(item => ({
//       ...item,
//       searchVolumePercentage: (item.searchVolume / totalSearchVolume) * 100,
//       countPercentage: (item.count / totalCount) * 100
//     }));
//   }, [chartData]);

//   const handleCategoryChange = useCallback((event) => {
//     const value = event.target.value;
//     setCategoryFilters(prev => {
//       if (prev.includes(value)) {
//         return prev.filter(cat => cat !== value);
//       } else {
//         return [...prev, value];
//       }
//     });
//   }, []);

//   const downloadCSV = useCallback(() => {
//     const csvContent = [
//       ['keyword', 'category', 'search volume'],
//       ...filteredData.map(item => [item.keyword, item.category, item.searchVolume])
//     ].map(row => row.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute('href', url);
//       link.setAttribute('download', 'ipsy_gap_analysis.csv');
//       link.style.visibility = 'hidden';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   }, [filteredData]);

//   // useEffect(() => {
//   //   // Smooth scroll to top when page changes
//   //   window.scrollTo({ top: 0, behavior: 'smooth' });
//   // }, [currentPage]);

//   const sortedCountData = useMemo(() => {
//     let sortableItems = [...pieChartData];
//     if (countSortConfig.key) {
//       sortableItems.sort((a, b) => {
//         const aValue = countSortConfig.key.includes('Percentage') ? parseFloat(a[countSortConfig.key]) : a[countSortConfig.key];
//         const bValue = countSortConfig.key.includes('Percentage') ? parseFloat(b[countSortConfig.key]) : b[countSortConfig.key];
//         if (aValue < bValue) {
//           return countSortConfig.direction === 'ascending' ? -1 : 1;
//         }
//         if (aValue > bValue) {
//           return countSortConfig.direction === 'ascending' ? 1 : -1;
//         }
//         return 0;
//       });
//     }
//     return sortableItems;
//   }, [pieChartData, countSortConfig]);
  
//   const sortedVolumeData = useMemo(() => {
//     let sortableItems = [...pieChartData];
//     if (volumeSortConfig.key) {
//       sortableItems.sort((a, b) => {
//         const aValue = volumeSortConfig.key.includes('Percentage') ? parseFloat(a[volumeSortConfig.key]) : a[volumeSortConfig.key];
//         const bValue = volumeSortConfig.key.includes('Percentage') ? parseFloat(b[volumeSortConfig.key]) : b[volumeSortConfig.key];
//         if (aValue < bValue) {
//           return volumeSortConfig.direction === 'ascending' ? -1 : 1;
//         }
//         if (aValue > bValue) {
//           return volumeSortConfig.direction === 'ascending' ? 1 : -1;
//         }
//         return 0;
//       });
//     }
//     return sortableItems;
//   }, [pieChartData, volumeSortConfig]);

  

//   const requestSort = (key, sortConfig, setSortConfig) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   const SortableTable = ({ data, sortConfig, requestSort, type }) => (
//     <table style={styles.table}>
//       <thead>
//         <tr>
//           <th style={styles.th} onClick={() => requestSort('category')}>
//             Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
//           </th>
//           <th style={styles.th} onClick={() => requestSort(type === 'count' ? 'count' : 'searchVolume')}>
//             {type === 'count' ? 'Count' : 'Volume'} {sortConfig.key === (type === 'count' ? 'count' : 'searchVolume') && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
//           </th>
//           <th style={styles.th} onClick={() => requestSort(type === 'count' ? 'countPercentage' : 'searchVolumePercentage')}>
//             Percentage {sortConfig.key === (type === 'count' ? 'countPercentage' : 'searchVolumePercentage') && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
//           </th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((item, index) => (
//           <tr key={item.category} style={{backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'}}>
//             <td style={styles.td}>{item.category}</td>
//             <td style={styles.td}>{type === 'count' ? item.count.toLocaleString() : item.searchVolume.toLocaleString()}</td>
//             <td style={styles.td}>{(type === 'count' ? item.countPercentage : item.searchVolumePercentage).toFixed(2)}%</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );


//   const renderActiveShape = (props) => {
//     const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
//     return (
//       <g>
//         <Sector
//           cx={cx}
//           cy={cy}
//           innerRadius={innerRadius}
//           outerRadius={outerRadius + 6}
//           startAngle={startAngle}
//           endAngle={endAngle}
//           fill={fill}
//         />
//       </g>
//     );
//   }

//   const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, fill }) => {
//     if (percent <= 0.04) return null;
//     const RADIAN = Math.PI / 180;
//     const radius = outerRadius + 60;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);
//     const sin = Math.sin(-RADIAN * midAngle);
//     const cos = Math.cos(-RADIAN * midAngle);
//     const sx = cx + (outerRadius + 10) * cos;
//     const sy = cy + (outerRadius + 10) * sin;
//     const mx = cx + (outerRadius + 30) * cos;
//     const my = cy + (outerRadius + 30) * sin;
//     const ex = mx + (cos >= 0 ? 1 : -1) * 22;
//     const ey = my;
//     const textAnchor = cos >= 0 ? 'start' : 'end';
  
//     return (
//       <g>
//         <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
//           {`${name} ${(percent * 100).toFixed(0)}%`}
//         </text>
//         <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
//         <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
//       </g>
//     );
//   };

//   const renderCompetitorCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, fill }) => {
//     const RADIAN = Math.PI / 180;
//     const radius = outerRadius + 70;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);
//     const sin = Math.sin(-RADIAN * midAngle);
//     const cos = Math.cos(-RADIAN * midAngle);
//     const sx = cx + (outerRadius + 10) * cos;
//     const sy = cy + (outerRadius + 10) * sin;
//     const mx = cx + (outerRadius + 30) * cos;
//     const my = cy + (outerRadius + 30) * sin;
//     const ex = mx + (cos >= 0 ? 1 : -1) * 22;
//     const ey = my;
//     const textAnchor = cos >= 0 ? 'start' : 'end';

//     return (
//       <g>
//         <text x={x} y={y} fill={fill} textAnchor={textAnchor} dominantBaseline="central">
//           {`${name} ${(percent * 100).toFixed(0)}%`}
//         </text>
//         <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
//         <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
//       </g>
//     );
//   };

//   const CompetitorTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div style={{ 
//           backgroundColor: 'rgba(255, 255, 255, 0.9)',
//           padding: '12px',
//           border: '1px solid #ccc',
//           borderRadius: '4px',
//           boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
//         }}>
//           <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: data.fill || '#000' }}>{data.name}</p>
//           <p style={{ margin: '0 0 3px' }}>
//             {competitorDataType === 'count' 
//               ? `Keyword Count: ${data.value.toLocaleString()}`
//               : `Search Volume: ${data.volume.toLocaleString()}`
//             }
//           </p>
//           <p style={{ margin: '0' }}>
//             {`Percentage: ${competitorDataType === 'count' 
//               ? parseFloat(data.percentage).toFixed(2)
//               : parseFloat(data.volumePercentage).toFixed(2)
//             }%`}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div style={{ 
//           backgroundColor: 'rgba(255, 255, 255, 0.9)',
//           padding: '12px',
//           border: '1px solid #ccc',
//           borderRadius: '4px',
//           boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
//         }}>
//           <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: data.fill }}>{data.name || data.category}</p>
//           <p style={{ margin: '0 0 3px' }}>{`${payload[0].name}: ${payload[0].value.toLocaleString()}`}</p>
//           <p style={{ margin: '0' }}>{`Percentage: ${parseFloat(data.percentage || data.countPercentage || data.searchVolumePercentage || 0).toFixed(2)}%`}</p>
//         </div>
//       );
//     }
//     return null;
//   };

  
//   const EXTENDED_COLORS = [...COLORS, '#8A2BE2', '#20B2AA', '#FF4500', '#32CD32', '#FF1493', '#1E90FF'];

//   const competitors = useMemo(() => {
//     const allCompetitors = new Set();
//     data.forEach(item => {
//       item.competitors.forEach(comp => {
//         allCompetitors.add(comp.name);
//       });
//     });
//     return Array.from(allCompetitors);
//   }, [data]);

//   const competitorOptions = useMemo(() => 
//     competitors.map(comp => ({ value: comp, label: comp }))
//   , [competitors]);

//   const competitorColors = useMemo(() => 
//     Object.fromEntries(competitors.map((comp, index) => 
//       [comp, comp === 'ipsy.com' ? 'url(#ipsyGradient)' : EXTENDED_COLORS[index % EXTENDED_COLORS.length]]
//     ))
//   , [competitors]);


//   const competitorRankingData = useMemo(() => {
//     const rankData = Array.from({ length: 10 }, (_, i) => ({
//       rank: i + 1,
//       total: 0,
//       totalVolume: 0,
//       ...competitors.reduce((acc, comp) => ({ ...acc, [comp]: 0, [`${comp}Volume`]: 0 }), {})
//     }));

//     filteredData.forEach(item => {
//       item.competitors.forEach(comp => {
//         if (comp.rank <= 10) {
//           rankData[comp.rank - 1][comp.name]++;
//           rankData[comp.rank - 1].total++;
//           rankData[comp.rank - 1][`${comp.name}Volume`] += item.searchVolume;
//           rankData[comp.rank - 1].totalVolume += item.searchVolume;
//         }
//       });
//     });

//     // Calculate percentages and sort competitors
//     rankData.forEach(rankItem => {
//       competitors.forEach(comp => {
//         rankItem[`${comp}Percentage`] = rankItem.total > 0 
//           ? (rankItem[comp] / rankItem.total * 100).toFixed(2)
//           : '0.00';
//         rankItem[`${comp}VolumePercentage`] = rankItem.totalVolume > 0
//           ? (rankItem[`${comp}Volume`] / rankItem.totalVolume * 100).toFixed(2)
//           : '0.00';
//       });
//       rankItem.sortedCompetitors = competitors
//         .sort((a, b) => rankItem[b] - rankItem[a])
//         .filter(comp => rankItem[comp] > 0);
//     });

//     return rankData;
//   }, [filteredData, competitors]);

//   const competitorTotalData = useMemo(() => {
//     const totals = competitors.reduce((acc, comp) => ({ ...acc, [comp]: 0, [`${comp}Volume`]: 0 }), {});
//     competitorRankingData.forEach(rankData => {
//       competitors.forEach(comp => {
//         totals[comp] += rankData[comp];
//         totals[`${comp}Volume`] += rankData[`${comp}Volume`];
//       });
//     });
//     const totalKeywords = competitors.reduce((sum, comp) => sum + totals[comp], 0);
//     const totalVolume = competitors.reduce((sum, comp) => sum + totals[`${comp}Volume`], 0);
//     return competitors.map(comp => ({
//       name: comp,
//       value: totals[comp],
//       percentage: (totals[comp] / totalKeywords * 100).toFixed(2),
//       volume: totals[`${comp}Volume`],
//       volumePercentage: (totals[`${comp}Volume`] / totalVolume * 100).toFixed(2)
//     }));
//   }, [competitorRankingData, competitors]);

//   const sortedCompetitorData = useMemo(() => {
//     let sortableItems = [...competitorTotalData];
//     if (competitorSortConfig.key) {
//         sortableItems.sort((a, b) => {
//             let aValue, bValue;
            
//             if (competitorDataType === 'count') {
//                 // Sorting based on count and percentage for keyword count
//                 aValue = parseFloat(a[competitorSortConfig.key === 'percentage' ? 'percentage' : 'value']);
//                 bValue = parseFloat(b[competitorSortConfig.key === 'percentage' ? 'percentage' : 'value']);
//             } else {
//                 // Sorting based on volume and percentage for search volume
//                 aValue = parseFloat(a[competitorSortConfig.key === 'volumePercentage' ? 'volumePercentage' : 'volume']);
//                 bValue = parseFloat(b[competitorSortConfig.key === 'volumePercentage' ? 'volumePercentage' : 'volume']);
//             }

//             if (aValue < bValue) {
//                 return competitorSortConfig.direction === 'ascending' ? -1 : 1;
//             }
//             if (aValue > bValue) {
//                 return competitorSortConfig.direction === 'ascending' ? 1 : -1;
//             }
//             return 0;
//         });
//     }
//     return sortableItems;
// }, [competitorTotalData, competitorSortConfig, competitorDataType]);



//   const CompetitorTable = ({ data, sortConfig, requestSort, dataType }) => (
//     <table style={styles.table}>
//       <thead>
//         <tr>
//           <th style={styles.th} onClick={() => requestSort('name')}>
//             Competitor {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
//           </th>
//           <th style={styles.th} onClick={() => requestSort(dataType === 'count' ? 'value' : 'volume')}>
//             Total {dataType === 'count' ? 'Keywords' : 'Search Volume'} {sortConfig.key === (dataType === 'count' ? 'value' : 'volume') && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
//           </th>
//           <th style={styles.th} onClick={() => requestSort(dataType === 'count' ? 'percentage' : 'volumePercentage')}>
//             Percentage {sortConfig.key === (dataType === 'count' ? 'percentage' : 'volumePercentage') && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
//           </th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((item, index) => (
//           <tr key={item.name} style={{backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'}}>
//             <td style={styles.td}>{item.name}</td>
//             <td style={styles.td}>
//               {dataType === 'count' 
//                 ? item.value.toLocaleString() 
//                 : item.volume.toLocaleString()}
//             </td>
//             <td style={styles.td}>
//               {dataType === 'count' 
//                 ? parseFloat(item.percentage).toFixed(2)
//                 : parseFloat(item.volumePercentage).toFixed(2)}%
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );

//   const formatLegend = (value) => {
//     return value.replace('Volume', '');
//   };

//   const filteredKeywordsStats = useMemo(() => {
//     const totalKeywords = filteredData.length;
//     const totalSearchVolume = filteredData.reduce((sum, item) => sum + item.searchVolume, 0);
//     return { totalKeywords, totalSearchVolume };
//   }, [filteredData]);

//   const selectedKeywordsStats = useMemo(() => {
//     const selectedItems = filteredData.filter(item => selectedKeywords.has(item.keyword));
//     const totalSearchVolume = selectedItems.reduce((sum, item) => sum + item.searchVolume, 0);
//     return { totalKeywords: selectedItems.length, totalSearchVolume };
//   }, [filteredData, selectedKeywords]);

//   const handleKeywordSelect = useCallback((keyword) => {
//     setSelectedKeywords(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(keyword)) {
//         newSet.delete(keyword);
//       } else {
//         newSet.add(keyword);
//       }
//       return newSet;
//     });
//   }, []);

//   const copySelectedKeywords = useCallback(() => {
//     const selectedData = filteredData
//       .filter(item => selectedKeywords.has(item.keyword))
//       .map(item => `${item.keyword},${item.category},${item.searchVolume}`)
//       .join('\n');
//     navigator.clipboard.writeText(`keyword,category,search volume\n${selectedData}`);
//     alert('Selected keywords copied to clipboard!');
//   }, [filteredData, selectedKeywords]);

//   const downloadSelectedKeywords = useCallback(() => {
//     const selectedData = filteredData
//       .filter(item => selectedKeywords.has(item.keyword))
//       .map(item => `${item.keyword},${item.category},${item.searchVolume}`)
//       .join('\n');
//     const csvContent = `keyword,category,search volume\n${selectedData}`;
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute('href', url);
//       link.setAttribute('download', 'selected_keywords.csv');
//       link.style.visibility = 'hidden';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   }, [filteredData, selectedKeywords]);

//   const handleSelectAllVisible = useCallback((event) => {
//     const isChecked = event.target.checked;
//     setAllVisibleSelected(isChecked);
    
//     const visibleKeywords = paginatedData.map(item => item.keyword);
//     setSelectedKeywords(prev => {
//       const newSet = new Set(prev);
//       visibleKeywords.forEach(keyword => {
//         if (isChecked) {
//           newSet.add(keyword);
//         } else {
//           newSet.delete(keyword);
//         }
//       });
//       return newSet;
//     });
//   }, [paginatedData]);

//   useEffect(() => {
//     setAllVisibleSelected(false);
//   }, [currentPage, filteredData]);


//   return (
//     <div style={styles.container}>
//       <h1 style={styles.header}>IPSY's Gap Analysis Dashboard</h1>
      
//       <div style={styles.section}>
//       <h2 style={styles.sectionTitle}>Filters</h2>
//         <div style={styles.flexContainer}>
//           <div style={styles.filterItem}>
//             <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Categories</label>
//             <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
//               {categories.map(category => (
//                 <label key={category} style={styles.categoryItem}>
//                   <input
//                     type="checkbox"
//                     value={category}
//                     checked={categoryFilters.includes(category)}
//                     onChange={handleCategoryChange}
//                     style={styles.checkbox}
//                   />
//                   {category}
//                 </label>
//               ))}
//             </div>
//           </div>

//           <div style={styles.filterItem}>
//             <label htmlFor="search-volume-filter" style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Minimum Search Volume</label>
//             <input
//               id="search-volume-filter"
//               type="number"
//               value={searchVolumeFilter}
//               onChange={(e) => setSearchVolumeFilter(Number(e.target.value))}
//               style={styles.input}
//             />
//           </div>

//           <div style={styles.filterItem}>
//             <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>
//               <input
//                 type="checkbox"
//                 checked={questionFilter}
//                 onChange={(e) => setQuestionFilter(e.target.checked)}
//                 style={styles.checkbox}
//               />
//               Questions Only
//             </label>
//           </div>

//           <div style={styles.filterItem}>
//             <label htmlFor="keyword-filter" style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Keyword Filter</label>
//             <input
//               id="keyword-filter"
//               type="text"
//               value={keywordFilter}
//               onChange={(e) => setKeywordFilter(e.target.value)}
//               placeholder="e.g., shampoo, soap"
//               style={styles.input}
//             />
//           </div>

//           <div style={styles.filterItem}>
//             <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>
//               <input
//                 type="checkbox"
//                 checked={showCompetitors}
//                 onChange={(e) => setShowCompetitors(e.target.checked)}
//                 style={styles.checkbox}
//               />
//               Show Competitors
//             </label>
//           </div>

//           {showCompetitors && (
//             <>
//               <div style={styles.filterItem}>
//                 <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Select Competitors</label>
//                 <Select
//                   isMulti
//                   options={competitorOptions}
//                   value={selectedCompetitors.map(comp => ({ value: comp, label: comp }))}
//                   onChange={(selected) => setSelectedCompetitors(selected.map(option => option.value))}
//                 />
//               </div>

//               <div style={styles.filterItem}>
//                 <label style={{display: 'block', marginBottom: '10px', fontWeight: '600'}}>Rank Range</label>
//                 <Slider
//                   range
//                   min={1}
//                   max={50}
//                   defaultValue={rankRange}
//                   onChange={setRankRange}
//                   style={styles.slider}
//                 />
//                 <div style={{marginTop: '5px'}}>
//                   Showing ranks {rankRange[0]} to {rankRange[1]}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       <div style={styles.section}>
//       <h2 style={styles.sectionTitle}>Filtered Keywords</h2>
//         <button onClick={downloadCSV} style={{...styles.button, marginBottom: '20px'}}>
//           Download All CSV
//         </button>
//         <div style={{ marginBottom: '20px' }}>
//   <p><strong>{selectedKeywords.size > 0 ? 'Total Selected Keywords:' : 'Total Keywords:'}</strong> {(selectedKeywords.size > 0 ? selectedKeywordsStats.totalKeywords : filteredKeywordsStats.totalKeywords).toLocaleString()}</p>
//   <p><strong>{selectedKeywords.size > 0 ? 'Total Search Volume for Selected Keywords:' : 'Total Search Volume:'}</strong> {(selectedKeywords.size > 0 ? selectedKeywordsStats.totalSearchVolume : filteredKeywordsStats.totalSearchVolume).toLocaleString()}</p>
// </div>
//         {selectedKeywords.size > 0 && (
//           <div style={{ marginBottom: '20px' }}>
//             <button onClick={copySelectedKeywords} style={{...styles.button, marginRight: '10px'}}>
//               Copy Selected
//             </button>
//             <button onClick={downloadSelectedKeywords} style={styles.button}>
//               Download Selected
//             </button>
//           </div>
//         )}
//         <div style={{ overflowX: 'auto' }}>
//           <table style={styles.table}>
// <thead>
//   <tr>
//     <th style={styles.th}>
//       <input
//         type="checkbox"
//         checked={allVisibleSelected}
//         onChange={handleSelectAllVisible}
//         style={{
//           ...styles.checkbox,
//           width: '18px',
//           height: '18px',
//           cursor: 'pointer',
//           accentColor: '#6a0dad'
//         }}
//       />
//       Select All
//     </th>
//     <th style={styles.th}>Keyword</th>
//     <th style={styles.th}>Category</th>
//     <th style={styles.th}>Search Volume</th>
//     {showCompetitors && <th style={styles.th}>Competitors</th>}
//   </tr>
//             </thead>
//             <tbody>
//               {paginatedData.map((item, index) => (
//                 <tr key={item.keyword} style={{backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'}}>
//                   <td style={styles.td}>
//                     <input
//                       type="checkbox"
//                       checked={selectedKeywords.has(item.keyword)}
//                       onChange={() => handleKeywordSelect(item.keyword)}
//                       style={{
//                         ...styles.checkbox,
//                         width: '18px',
//                         height: '18px',
//                         cursor: 'pointer',
//                         accentColor: '#6a0dad'
//                       }}
//                     />
//                   </td>
//                   <td style={styles.td}>
//                     {capitalizeFirstLetter(item.keyword)}
//                     {item.isQuestion && (
//                       <span style={styles.questionTag}>Question</span>
//                     )}
//                   </td>
//                   <td style={styles.td}>{item.category}</td>
//                   <td style={styles.td}>{item.searchVolume.toLocaleString()}</td>
//                   {showCompetitors && (
//                     <td style={styles.td}>
//                       {item.competitors
//                         .filter(competitor => 
//                           (selectedCompetitors.length === 0 || selectedCompetitors.includes(competitor.name)) &&
//                           competitor.rank >= rankRange[0] && competitor.rank <= rankRange[1]
//                         )
//                         .map(competitor => (
//                           competitor.name === 'ipsy.com' ? (
//                             <span key={competitor.name} style={styles.ipsyTag}>
//                               IPSY: {competitor.rank}
//                             </span>
//                           ) : (
//                             <span key={competitor.name} style={styles.competitorTag}>
//                               {competitor.name}: {competitor.rank}
//                             </span>
//                           )
//                         ))}
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <button 
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             style={{...styles.button, opacity: currentPage === 1 ? 0.5 : 1}}
//           >
//             Previous
//           </button>
//           <span style={{fontSize: '1rem', fontWeight: '600'}}>Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>
//           <button 
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))}
//             disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
//             style={{...styles.button, opacity: currentPage === Math.ceil(filteredData.length / itemsPerPage) ? 0.5 : 1}}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       <div style={styles.section}>
//         <h2 style={styles.sectionTitle}>Category Analysis</h2>
//         <select 
//           onChange={(e) => setChartMetric(e.target.value)} 
//           value={chartMetric}
//           style={styles.select}
//         >
//           <option value="searchVolume">Search Volume</option>
//           <option value="count">Keyword Count</option>
//         </select>
// <div style={styles.chartContainer}>
//           <ResponsiveContainer>
//             <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
//               <XAxis 
//                 dataKey="category" 
//                 interval={0}
//                 tick={{ angle: -45, textAnchor: 'end', fontSize: 12 }}
//                 height={70}
//               />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey={chartMetric} fill="#6a0dad" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div style={styles.section}>
//         <h2 style={styles.sectionTitle}>Questions Analysis</h2>
//         <div style={styles.chartContainer}>
//           <ResponsiveContainer>
//             <BarChart data={questionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
//               <XAxis 
//                 dataKey="category" 
//                 interval={0}
//                 tick={{ angle: -45, textAnchor: 'end', fontSize: 12 }}
//                 height={70}
//               />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey={chartMetric} fill="#4ECDC4" />
//             </BarChart>
//           </ResponsiveContainer>
//       </div>
//       </div>

//       <div style={styles.section}>
//         <h2 style={styles.sectionTitle}>Category Distribution</h2>
//         <div style={styles.flexContainer}>
//           <div style={{ flex: '1 1 400px' }}>
//           <h3 style={{textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem'}}>By Keyword Count</h3>
//             <ResponsiveContainer width="100%" height={400}>
//               <PieChart>
//                 <Pie
//                   data={pieChartData}
//                   dataKey="count"
//                   nameKey="category"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={95}
//                   fill="#8884d8"
//                   labelLine={false}
//                   label={renderCustomLabel}
//                   activeIndex={activeIndex}
//                   activeShape={renderActiveShape}
//                   onMouseEnter={(_, index) => setActiveIndex(index)}
//                   onMouseLeave={() => setActiveIndex(null)}
//                 >
//                   {pieChartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>
//             <div style={{ marginTop: '20px' }}>
//               <SortableTable 
//                 data={sortedCountData} 
//                 sortConfig={countSortConfig} 
//                 requestSort={(key) => requestSort(key, countSortConfig, setCountSortConfig)}
//                 type="count"
//               />
//             </div>
//           </div>
//           <div style={{ flex: '1 1 400px' }}>
//           <h3 style={{textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem'}}>By Search Volume</h3>
//             <ResponsiveContainer width="100%" height={400}>
//               <PieChart>
//                 <Pie
//                   data={pieChartData}
//                   dataKey="searchVolume"
//                   nameKey="category"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={95}
//                   fill="#82ca9d"
//                   labelLine={false}
//                   label={renderCustomLabel}
//                   activeIndex={activeIndexVolume}
//                   activeShape={renderActiveShape}
//                   onMouseEnter={(_, index) => setActiveIndexVolume(index)}
//                   onMouseLeave={() => {
//                     setActiveIndexVolume(null);
//                     // Force tooltip to hide
//                     const event = new MouseEvent('mouseout', {
//                       view: window,
//                       bubbles: true,
//                       cancelable: true,
//                     });
//                     document.dispatchEvent(event);
//                   }}
//                 >
//                   {pieChartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>
//             <div style={{ marginTop: '20px' }}>
//               <SortableTable 
//                 data={sortedVolumeData} 
//                 sortConfig={volumeSortConfig} 
//                 requestSort={(key) => requestSort(key, volumeSortConfig, setVolumeSortConfig)}
//                 type="volume"
//               />
//           </div>
//           </div>

//         </div>
//       </div>
//       <div style={styles.section}>
//       <h2 style={styles.sectionTitle}>Competitor Ranking Analysis</h2>
//         <div style={{marginBottom: '20px'}}>
//           <label style={{marginRight: '10px', fontWeight: '600'}}>Select Data Type:</label>
//           <select 
//             onChange={(e) => setCompetitorDataType(e.target.value)} 
//             value={competitorDataType}
//             style={styles.select}
//           >
//             <option value="count">Keyword Count</option>
//             <option value="volume">Search Volume</option>
//           </select>
//         </div>
//         <ResponsiveContainer width="100%" height={500}>
//           <BarChart data={competitorRankingData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
//             <defs>
//               <linearGradient id="ipsyGradient" x1="0" y1="0" x2="1" y2="0">
//                 <stop offset="0%" stopColor="#FF9A8B" />
//                 <stop offset="50%" stopColor="#FF6A88" />
//                 <stop offset="100%" stopColor="#FF99AC" />
//               </linearGradient>
//             </defs>
//             <XAxis 
//               dataKey="rank" 
//               label={{ value: 'Rank', position: 'bottom', offset: 20 }}
//               tick={{ fontSize: 12 }}
//             />
//             <YAxis 
//               label={{ value: competitorDataType === 'count' ? 'Number of Keywords' : 'Search Volume', angle: -90, position: 'insideLeft', offset: -40 }}
//               tick={{ fontSize: 12 }}
//             />
// <Tooltip
//   content={({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const dataPoint = competitorRankingData[label - 1];
//       return (
//         <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
//           <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{`Rank: ${label}`}</p>
//           {dataPoint.sortedCompetitors.map((comp) => (
//             <p key={comp} style={{ color: competitorColors[comp], margin: '3px 0' }}>
//               {competitorDataType === 'count' ? 
//                 `${comp}: ${dataPoint[comp].toLocaleString()} (${dataPoint[`${comp}Percentage`]}%)` :
//                 `${comp}: ${dataPoint[`${comp}Volume`].toLocaleString()} (${dataPoint[`${comp}VolumePercentage`]}%)`
//               }
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   }}
// />
//             <Legend 
//   verticalAlign="bottom" 
//   height={36} 
//   wrapperStyle={{ paddingTop: '50px' }}
//   formatter={formatLegend}
// />
//             {competitors.map((competitor, index) => (
//               <Bar
//                 key={competitor}
//                 dataKey={competitorDataType === 'count' ? competitor : `${competitor}Volume`}
//                 stackId="a"
//                 fill={competitor === 'ipsy.com' ? '#FF6A88' : COLORS[index % COLORS.length]}
//                 name={competitor}
//               />
//             ))}
//           </BarChart>
//         </ResponsiveContainer>

//         <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', flexDirection: 'column', alignItems: 'center' }}>
//           <h3 style={{textAlign: 'center', marginBottom: '10px',  marginTop: '40px',fontSize: '1.2rem'}}>
//             Competitor Distribution by {competitorDataType === 'count' ? 'Keyword Count' : 'Search Volume'}
//           </h3>
//           <div style={{ width: '80%', height: '500px' }}>
//             <ResponsiveContainer>
//               <PieChart>
//                 <Pie
//                   data={competitorTotalData}
//                   dataKey={competitorDataType === 'count' ? 'value' : 'volume'}
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={130}
//                   fill="#8884d8"
//                   labelLine={true}
//                   label={renderCompetitorCustomLabel}
//                   activeShape={renderActiveShape}
//                   onMouseEnter={(_, index) => setActiveIndex(index)}
//                   onMouseLeave={() => setActiveIndex(null)}
//                 >
//                   {competitorTotalData.map((entry, index) => (
//                     <Cell 
//                       key={`cell-${index}`} 
//                       fill={entry.name === 'ipsy.com' ? 'url(#ipsyGradient)' : competitorColors[entry.name]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CompetitorTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//         <div style={{ marginTop: '40px' }}>
//           <CompetitorTable 
//             data={sortedCompetitorData} 
//             sortConfig={competitorSortConfig} 
//             requestSort={(key) => requestSort(key, competitorSortConfig, setCompetitorSortConfig)}
//             dataType={competitorDataType}
//           />

//         </div>
//     </div>

//     </div>

//   );
// };

// export default Dashboard;