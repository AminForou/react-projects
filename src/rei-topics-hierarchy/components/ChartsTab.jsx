import React from 'react';
import { Bar } from 'react-chartjs-2';
import { getL1BarChartData, getL1L2StackedData, getL1L3StackedData } from './chartHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
          family: 'Inter, sans-serif',
        },
        usePointStyle: true,
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
        family: 'Inter, sans-serif',
      },
      titleFont: {
        size: 14,
        family: 'Inter, sans-serif',
        weight: 'bold',
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
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
        color: '#6B7280',
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
        color: '#6B7280',
      },
    }
  },
};

const stackedChartOptions = {
  ...baseChartOptions,
  scales: {
    x: { 
      stacked: true,
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
        color: '#6B7280',
      },
    },
    y: { 
      stacked: true, 
      beginAtZero: true,
      grid: {
        color: '#F3F4F6',
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
        color: '#6B7280',
      },
    }
  },
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
      {title}
    </h2>
    <div className="relative h-[400px]">
      {children}
    </div>
  </div>
);

const ChartsTab = ({ linkedInPulseTopicsData }) => {
  const l1BarData = getL1BarChartData(linkedInPulseTopicsData);
  const l2StackedData = getL1L2StackedData(linkedInPulseTopicsData);
  const l3StackedData = getL1L3StackedData(linkedInPulseTopicsData);

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
        <ChartCard title="Primary Topic Distribution">
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

