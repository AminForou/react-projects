import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';
import { FaChartPie, FaThLarge, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * CompetitorAnalysis Component
 * 
 * This component focuses on analyzing and visualizing competitor data across keywords.
 * 
 * Features:
 * - Displays a stacked bar chart showing competitor rankings across the top 10 positions
 * - Provides a pie chart showing overall competitor distribution
 * - Includes a sortable table with detailed competitor data
 * - Allows switching between keyword count and search volume metrics
 * - Offers interactive features like hover effects and tooltips
 * 
 * This component helps identify strong competitors, analyze their keyword coverage,
 * and understand the competitive landscape across different ranking positions.
 * It's crucial for developing competitive SEO strategies and identifying gaps and opportunities.
 */


const COLORS = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC949', '#AF7AA1', '#FF9DA7', '#9C755F', '#BAB0AB',
  '#86BCB6', '#FF9E1B', '#D37295', '#8CD17D', '#B6992D',
  '#499894', '#E15759', '#F28E2B', '#FFBE7D', '#FF6600',
  '#A14C58', '#4E79A7', '#76B7B2', '#FF9DA7', '#FFBF79'
];

const EXTENDED_COLORS = [...COLORS, '#8A2BE2', '#20B2AA', '#FF4500', '#32CD32', '#FF1493', '#1E90FF'];

const CTR_BY_POSITION = {
  1: 0.398, 2: 0.187, 3: 0.102, 4: 0.072, 5: 0.051,
  6: 0.044, 7: 0.030, 8: 0.021, 9: 0.019, 10: 0.016,
  11: 0.014, 12: 0.012, 13: 0.010, 14: 0.009, 15: 0.008,
  16: 0.007, 17: 0.006, 18: 0.005, 19: 0.004, 20: 0.003
};

const CompetitorAnalysis = ({ filteredData, competitorDataType, setCompetitorDataType }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  const [competitorSortConfig, setCompetitorSortConfig] = useState({ key: null, direction: 'ascending' });
  const [activeIndexPie, setActiveIndexPie] = useState(null);
  const [chartType, setChartType] = useState('doughnut');

  const competitors = useMemo(() => {
    const allCompetitors = new Set();
    filteredData.forEach(item => {
      item.competitors.forEach(comp => {
        allCompetitors.add(comp.name);
      });
    });
    return Array.from(allCompetitors);
  }, [filteredData]);

  const competitorColors = useMemo(() => 
    Object.fromEntries(competitors.map((comp, index) => 
      [comp, comp === 'ipsy.com' ? 'url(#ipsyGradient)' : EXTENDED_COLORS[index % EXTENDED_COLORS.length]]
    ))
  , [competitors]);

  const competitorRankingData = useMemo(() => {
    const rankData = Array.from({ length: 20 }, (_, i) => ({
      rank: i + 1,
      total: 0,
      totalVolume: 0,
      totalTraffic: 0,
      ...competitors.reduce((acc, comp) => ({ ...acc, [comp]: 0, [`${comp}Volume`]: 0, [`${comp}Traffic`]: 0 }), {})
    }));

    filteredData.forEach(item => {
      item.competitors.forEach(comp => {
        if (comp.rank <= 20) {
          rankData[comp.rank - 1][comp.name]++;
          rankData[comp.rank - 1].total++;
          rankData[comp.rank - 1][`${comp.name}Volume`] += item.searchVolume;
          rankData[comp.rank - 1].totalVolume += item.searchVolume;
          const estimatedTraffic = item.searchVolume * CTR_BY_POSITION[comp.rank];
          rankData[comp.rank - 1][`${comp.name}Traffic`] += estimatedTraffic;
          rankData[comp.rank - 1].totalTraffic += estimatedTraffic;
        }
      });
    });

    rankData.forEach(rankItem => {
      competitors.forEach(comp => {
        rankItem[`${comp}Percentage`] = rankItem.total > 0 
          ? (rankItem[comp] / rankItem.total * 100).toFixed(2)
          : '0.00';
        rankItem[`${comp}VolumePercentage`] = rankItem.totalVolume > 0
          ? (rankItem[`${comp}Volume`] / rankItem.totalVolume * 100).toFixed(2)
          : '0.00';
        rankItem[`${comp}TrafficPercentage`] = rankItem.totalTraffic > 0
          ? (rankItem[`${comp}Traffic`] / rankItem.totalTraffic * 100).toFixed(2)
          : '0.00';
      });
      rankItem.sortedCompetitors = competitors
        .sort((a, b) => rankItem[b] - rankItem[a])
        .filter(comp => rankItem[comp] > 0);
    });

    return rankData;
  }, [filteredData, competitors]);

  const competitorTotalData = useMemo(() => {
    const totals = competitors.reduce((acc, comp) => ({ ...acc, [comp]: 0, [`${comp}Volume`]: 0, [`${comp}Traffic`]: 0 }), {});
    competitorRankingData.forEach(rankData => {
      competitors.forEach(comp => {
        totals[comp] += rankData[comp];
        totals[`${comp}Volume`] += rankData[`${comp}Volume`];
        totals[`${comp}Traffic`] += rankData[`${comp}Traffic`];
      });
    });
    const totalKeywords = competitors.reduce((sum, comp) => sum + totals[comp], 0);
    const totalVolume = competitors.reduce((sum, comp) => sum + totals[`${comp}Volume`], 0);
    const totalTraffic = competitors.reduce((sum, comp) => sum + totals[`${comp}Traffic`], 0);
    return competitors.map(comp => ({
      name: comp,
      value: totals[comp],
      percentage: (totals[comp] / totalKeywords * 100).toFixed(2),
      volume: totals[`${comp}Volume`],
      volumePercentage: (totals[`${comp}Volume`] / totalVolume * 100).toFixed(2),
      traffic: totals[`${comp}Traffic`],
      trafficPercentage: (totals[`${comp}Traffic`] / totalTraffic * 100).toFixed(2)
    }));
  }, [competitorRankingData, competitors]);

  const sortedCompetitorData = useMemo(() => {
    let sortableItems = [...competitorTotalData];
    if (competitorSortConfig.key) {
        sortableItems.sort((a, b) => {
            let aValue, bValue;
            
            if (competitorDataType === 'count') {
                aValue = parseFloat(a[competitorSortConfig.key === 'percentage' ? 'percentage' : 'value']);
                bValue = parseFloat(b[competitorSortConfig.key === 'percentage' ? 'percentage' : 'value']);
            } else if (competitorDataType === 'volume') {
                aValue = parseFloat(a[competitorSortConfig.key === 'volumePercentage' ? 'volumePercentage' : 'volume']);
                bValue = parseFloat(b[competitorSortConfig.key === 'volumePercentage' ? 'volumePercentage' : 'volume']);
            } else {
                aValue = parseFloat(a[competitorSortConfig.key === 'trafficPercentage' ? 'trafficPercentage' : 'traffic']);
                bValue = parseFloat(b[competitorSortConfig.key === 'trafficPercentage' ? 'trafficPercentage' : 'traffic']);
            }

            if (aValue < bValue) {
                return competitorSortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return competitorSortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableItems;
  }, [competitorTotalData, competitorSortConfig, competitorDataType]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (competitorSortConfig.key === key && competitorSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setCompetitorSortConfig({ key, direction });
  };

  const formatLegend = (value) => {
    return value.replace('Volume', '');
  };

  const treemapData = competitorTotalData.map(item => ({
    name: item.name,
    size: competitorDataType === 'count' ? item.value : competitorDataType === 'volume' ? item.volume : item.traffic,
    percentage: competitorDataType === 'count' ? item.percentage : competitorDataType === 'volume' ? item.volumePercentage : item.trafficPercentage
  }));

  const CompetitorTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={styles.tooltip}>
          <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: data.fill || '#000' }}>{data.name}</p>
          <p style={{ margin: '0 0 3px' }}>
            {competitorDataType === 'count' 
              ? `Keyword Count: ${(data.value || data.size).toLocaleString()}`
              : competitorDataType === 'volume'
                ? `Search Volume: ${(data.volume || data.size).toLocaleString()}`
                : `Estimated Traffic: ${(data.traffic || data.size).toLocaleString()}`
            }
          </p>
          <p style={{ margin: '0' }}>
            {`Percentage: ${data.percentage || (data.size / treemapData.reduce((sum, item) => sum + item.size, 0) * 100).toFixed(2)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, fill }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 70;
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
        <text x={x} y={y} fill={fill} textAnchor={textAnchor} dominantBaseline="central">
          {`${name} ${(percent * 100).toFixed(0)}%`}
        </text>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      </g>
    );
  };

  const renderTreemapCell = (props) => {
    const { x, y, width, height, name, index, percentage } = props;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: name === 'ipsy.com' ? 'url(#ipsyGradient)' : competitorColors[name],
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="200"
          letterSpacing="1px"
        >
          {`${name} (${percentage}%)`}
        </text>
      </g>
    );
  };

  const CompetitorTable = ({ data, sortConfig, requestSort, dataType }) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th} onClick={() => requestSort('name')}>
            Competitor {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
          </th>
          <th style={styles.th} onClick={() => requestSort(dataType === 'count' ? 'value' : dataType === 'volume' ? 'volume' : 'traffic')}>
            Total {dataType === 'count' ? 'Keywords' : dataType === 'volume' ? 'Search Volume' : 'Estimated Traffic'} {sortConfig.key === (dataType === 'count' ? 'value' : dataType === 'volume' ? 'volume' : 'traffic') && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
          </th>
          <th style={styles.th} onClick={() => requestSort(dataType === 'count' ? 'percentage' : dataType === 'volume' ? 'volumePercentage' : 'trafficPercentage')}>
            Percentage {sortConfig.key === (dataType === 'count' ? 'percentage' : dataType === 'volume' ? 'volumePercentage' : 'trafficPercentage') && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={item.name} style={{backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'}}>
            <td style={styles.td}>{item.name}</td>
            <td style={styles.td}>
              {dataType === 'count' 
                ? item.value.toLocaleString() 
                : dataType === 'volume'
                  ? item.volume.toLocaleString()
                  : item.traffic.toLocaleString()}
            </td>
            <td style={styles.td}>
              {dataType === 'count' 
                ? parseFloat(item.percentage).toFixed(2)
                : dataType === 'volume'
                  ? parseFloat(item.volumePercentage).toFixed(2)
                  : parseFloat(item.trafficPercentage).toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const ShareOfVoiceInfo = () => (
    <div ref={tooltipRef} style={styles.infoBox}>
      <div style={styles.infoHeader}>
        <h3 style={styles.infoTitle}>Share of Voice Explanation</h3>
        <FaTimes style={styles.closeButton} onClick={() => setShowTooltip(false)} />
      </div>
      <p>Share of Voice is an estimate of the traffic a competitor receives based on their ranking positions and assumed Click-Through Rates (CTR) for each position.</p>
      <p>Calculation: For each keyword, we multiply the search volume by the assumed CTR for the competitor's ranking position.</p>
      
      <h4 style={styles.exampleTitle}>Example Calculation:</h4>
      <div style={styles.exampleBox}>
        <p><strong>Keyword:</strong> "beauty box subscription"</p>
        <p><strong>Search Volume:</strong> 10,000 monthly searches</p>
        <p><strong>Competitor A Ranking:</strong> Position 3</p>
        <p><strong>Assumed CTR for Position 3:</strong> 10.2%</p>
        <p><strong>Share of Voice Calculation:</strong></p>
        <p style={styles.calculation}>10,000 × 10.2% = 1,020 estimated monthly clicks</p>
        <p>Therefore, Competitor A's Share of Voice for this keyword is estimated at 1,020 monthly clicks.</p>
      </div>

      <h4 style={styles.tableTitle}>Assumed Click-Through Rates by Position:</h4>
      <p style={styles.sourceNote}>Source for positions 1-10: <a href="https://firstpagesage.com/reports/google-click-through-rates-ctrs-by-ranking-position/" target="_blank" rel="noopener noreferrer">First Page Sage CTR Report</a></p>
      <p style={styles.sourceNote}>Note: CTRs for positions 11-20 are estimated based on a logarithmic decay model.</p>
      <table style={styles.infoTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Position</th>
            <th style={styles.tableHeader}>Assumed CTR</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(CTR_BY_POSITION).slice(0, showFullTable ? 20 : 10).map(([position, ctr]) => (
            <tr key={position} style={styles.tableRow}>
              <td style={styles.tableCell}>{position}</td>
              <td style={styles.tableCell}>{(ctr * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showFullTable && (
        <button style={styles.showMoreButton} onClick={() => setShowFullTable(true)}>
          Show positions 11-20
        </button>
      )}
    </div>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTooltip = (e) => {
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Competitor Analysis</h2>
      <div style={styles.controlsContainer}>
        <div style={styles.selectorGroup}>
          <button
            style={{
              ...styles.selectorButton,
              backgroundColor: competitorDataType === 'count' ? '#6a0dad' : 'white',
              color: competitorDataType === 'count' ? 'white' : '#6a0dad',
            }}
            onClick={() => setCompetitorDataType('count')}
          >
            Keyword Count
          </button>
          <button
            style={{
              ...styles.selectorButton,
              backgroundColor: competitorDataType === 'volume' ? '#6a0dad' : 'white',
              color: competitorDataType === 'volume' ? 'white' : '#6a0dad',
            }}
            onClick={() => setCompetitorDataType('volume')}
          >
            Search Volume
          </button>
          <div style={styles.buttonContainer}>
            <button
              ref={buttonRef}
              style={{
                ...styles.selectorButton,
                backgroundColor: competitorDataType === 'traffic' ? '#6a0dad' : 'white',
                color: competitorDataType === 'traffic' ? 'white' : '#6a0dad',
              }}
              onClick={() => setCompetitorDataType('traffic')}
            >
              <span style={styles.buttonText}>Share of Voice</span>
              <FaInfoCircle 
                style={styles.infoIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
              />
            </button>
            {showTooltip && <ShareOfVoiceInfo />}
          </div>
        </div>
        
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
      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={competitorRankingData} margin={{ top: 20, right: 30, left: 60, bottom: 140 }}>
            <defs>
              <linearGradient id="ipsyGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF9A8B" />
                <stop offset="50%" stopColor="#FF6A88" />
                <stop offset="100%" stopColor="#FF99AC" />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="rank" 
              label={{ value: 'Rank', position: 'bottom', offset: 20 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ 
                value: competitorDataType === 'count' 
                  ? 'Number of Keywords' 
                  : competitorDataType === 'volume'
                    ? 'Search Volume'
                    : 'Estimated Traffic',
                angle: -90, 
                position: 'insideLeft', 
                offset: -40 
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = competitorRankingData[label - 1];
                  return (
                    <div style={styles.tooltip}>
                      <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{`Rank: ${label}`}</p>
                      {dataPoint.sortedCompetitors.map((comp) => (
                        <p key={comp} style={{ color: competitorColors[comp], margin: '3px 0' }}>
                          {competitorDataType === 'count' 
                            ? `${comp}: ${dataPoint[comp].toLocaleString()} (${dataPoint[`${comp}Percentage`]}%)`
                            : competitorDataType === 'volume'
                              ? `${comp}: ${dataPoint[`${comp}Volume`].toLocaleString()} (${dataPoint[`${comp}VolumePercentage`]}%)`
                              : `${comp}: ${dataPoint[`${comp}Traffic`].toLocaleString()} (${dataPoint[`${comp}TrafficPercentage`]}%)`
                          }
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              offset={40}
              wrapperStyle={{ paddingTop: '60px' }}
            />
            {competitors.map((competitor, index) => (
              <Bar
                key={competitor}
                dataKey={
                  competitorDataType === 'count' 
                    ? competitor 
                    : competitorDataType === 'volume'
                      ? `${competitor}Volume`
                      : `${competitor}Traffic`
                }
                stackId="a"
                fill={competitor === 'ipsy.com' ? '#FF6A88' : COLORS[index % COLORS.length]}
                name={competitor}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={styles.pieChartContainer}>
        <h3 style={styles.chartTitle}>
          Competitor Distribution by {
            competitorDataType === 'count' 
              ? 'Keyword Count' 
              : competitorDataType === 'volume'
                ? 'Search Volume'
                : 'Share of Voice'
          }
        </h3>
        <ResponsiveContainer width="100%" height={600}>
          {chartType === 'treemap' ? (
            <Treemap
              data={treemapData}
              dataKey="size"
              ratio={4/3}
              stroke="#fff"
              fill="#8884d8"
              content={renderTreemapCell}
            >
              <Tooltip content={<CompetitorTooltip />} />
            </Treemap>
          ) : (
            <PieChart>
              <Pie
                data={competitorTotalData}
                dataKey={competitorDataType === 'count' ? 'value' : competitorDataType === 'volume' ? 'volume' : 'traffic'}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={200}
                innerRadius={chartType === 'doughnut' ? 120 : 0}
                fill="#8884d8"
                labelLine={true}
                label={renderCustomLabel}
                onMouseEnter={(_, index) => setActiveIndexPie(index)}
                onMouseLeave={() => setActiveIndexPie(null)}
              >
                {competitorTotalData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'ipsy.com' ? 'url(#ipsyGradient)' : competitorColors[entry.name]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CompetitorTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div style={styles.tableContainer}>
        <h3 style={styles.chartTitle}>Competitor Rankings</h3>
        <CompetitorTable 
          data={sortedCompetitorData} 
          sortConfig={competitorSortConfig} 
          requestSort={requestSort}
          dataType={competitorDataType}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  selectorGroup: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  buttonContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  buttonText: {
    marginRight: '8px',
  },
  infoIcon: {
    fontSize: '14px',
    cursor: 'pointer',
  },
  icon: {
    marginRight: '5px',
    fontSize: '16px',
  },
  chartContainer: {
    width: '100%',
    height: '500px',
    marginBottom: '40px',
  },
  pieChartContainer: {
    width: '100%',
    height: '700px',
    marginBottom: '40px',
  },
  chartTitle: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '1.2rem',
  },
  tableContainer: {
    marginTop: '40px',
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
  infoBox: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '20px',
    maxWidth: '400px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    zIndex: 9999,
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  infoTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  closeButton: {
    cursor: 'pointer',
    fontSize: '20px',
    color: '#666',
  },
  exampleTitle: {
    marginTop: '20px',
    marginBottom: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  exampleBox: {
    backgroundColor: '#f8f8f8',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '20px',
  },
  calculation: {
    fontWeight: 'bold',
    color: '#6a0dad',
    marginTop: '10px',
    marginBottom: '10px',
  },
  tableTitle: {
    marginTop: '20px',
    marginBottom: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  infoTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
    border: '1px solid #ddd',
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    ':nth-child(even)': {
      backgroundColor: '#f8f8f8',
    },
  },
  tableCell: {
    padding: '8px',
    borderBottom: '1px solid #ddd',
  },
  showMoreButton: {
    marginTop: '10px',
    padding: '5px 10px',
    backgroundColor: '#6a0dad',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  sourceNote: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '10px',
  },
};

export default CompetitorAnalysis;