// ChartsTab.jsx
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  getL1BarChartData,
  getL1L2StackedData,
  getL1L3StackedData
} from './chartHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register scales and components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// A base config for all charts
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        },
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1F2937',
      bodyColor: '#4B5563',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      padding: 12,
      bodyFont: {
        size: 13,
        family: 'Inter, sans-serif'
      },
      titleFont: {
        size: 14,
        family: 'Inter, sans-serif',
        weight: 'bold'
      },
      boxPadding: 6
    }
  }
};

const barChartOptions = {
  ...baseChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#F3F4F6',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        },
        color: '#6B7280'
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        },
        color: '#6B7280'
      }
    }
  }
};

const stackedChartOptions = {
  ...baseChartOptions,
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        },
        color: '#6B7280'
      }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        color: '#F3F4F6',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        },
        color: '#6B7280'
      }
    }
  }
};

// A small layout for each chart block
const ChartCard = ({ title, children, extraControls }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800">
        {title}
      </h2>
      {extraControls}
    </div>
    <div className="relative h-[400px]">{children}</div>
  </div>
);

// Additional data for "Parent category" counts
// (only used if dataset is December18 and toggle is on)
const parentCategoryArticles = {
  Snowsports: 106,
  Cycling: 145,
  Climbing: 78,
  Watersports: 51,
  'Outdoor Basics': 62,
  Hiking: 114,
  Running: 77,
  Fitness: 43,
  Family: 28,
  Camping: 141,
  Clothing: 34,
  Travel: 24
};

const ChartsTab = ({ linkedInPulseTopicsData }) => {
  // Create the basic data sets from the selected dataset
  const l1BarDataOriginal = getL1BarChartData(linkedInPulseTopicsData);
  const l2StackedData = getL1L2StackedData(linkedInPulseTopicsData);
  const l3StackedData = getL1L3StackedData(linkedInPulseTopicsData);

  // If the user has "december18" dataset selected, we show an extra toggle
  const isDecember18 =
    linkedInPulseTopicsData && linkedInPulseTopicsData.name?.includes('REI');

  // State to track whether to show the "Parent category" data side by side
  const [showParentCategory, setShowParentCategory] = useState(false);

  // Build the L1 data object for the Primary Topic Distribution chart
  // If showParentCategory is true and it's December18 data, add a second dataset
  const l1BarData = React.useMemo(() => {
    // Start with a shallow copy of original so we don't mutate the reference
    const newData = {
      labels: [...l1BarDataOriginal.labels],
      datasets: l1BarDataOriginal.datasets.map((ds) => ({ ...ds }))
    };

    if (isDecember18 && showParentCategory) {
      // Build second dataset
      // We'll match each label in newData.labels to parentCategoryArticles
      // If no match, default to 0
      const secondData = [];
      newData.labels.forEach((label) => {
        // Possibly 'Camping', 'Snowsports', etc.
        secondData.push(parentCategoryArticles[label] || 0);
      });

      newData.datasets.push({
        label: 'Current L1 Structure',
        data: secondData,
        backgroundColor: '#F87171' // A red-ish color
      });
    }

    return newData;
  }, [l1BarDataOriginal, showParentCategory, isDecember18]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Topic Distribution Analysis
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Explore the distribution of articles across different topic levels.
          Each chart provides insights into how content is organized within our hierarchy.
        </p>
      </div>

      <div className="grid gap-8">
        <ChartCard 
          title="Primary Topic Distribution"
          extraControls={
            isDecember18 && (
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showParentCategory}
                    onChange={() => setShowParentCategory(prev => !prev)}
                  />
                  <div className={`
                    w-9 h-5 rounded-full peer 
                    bg-gray-200 peer-checked:bg-indigo-600
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-4 after:w-4
                    after:transition-all peer-checked:after:translate-x-full
                  `}></div>
                </label>
                <span className="text-sm text-gray-600">
                  Compare with current website data
                </span>
              </div>
            )
          }
        >
          <div className="absolute inset-0">
            <Bar data={l1BarData} options={barChartOptions} />
          </div>
        </ChartCard>

        <ChartCard title="Secondary Topics by Primary Category">
          <div className="absolute inset-0">
            <Bar data={l2StackedData} options={stackedChartOptions} />
          </div>
        </ChartCard>

        <ChartCard title="Tertiary Topics Distribution">
          <div className="absolute inset-0">
            <Bar data={l3StackedData} options={stackedChartOptions} />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default ChartsTab;
