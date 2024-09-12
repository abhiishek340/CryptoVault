import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface PriceChartProps {
  data: number[];
  type: 'line' | 'bar';
}

const PriceChart: React.FC<PriceChartProps> = ({ data, type }) => {
  const labels = data.map((_, index) => index.toString());

  const baseChartData = {
    labels,
    datasets: [
      {
        label: 'Price',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    scales: {
      x: {
        type: 'category',
      },
      y: {
        type: 'linear',
      },
    },
    plugins: {
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'xy' as const,
        },
        pan: {
          enabled: true,
          mode: 'xy' as const,
        },
      },
    },
  };

  if (type === 'line') {
    const lineChartData: ChartData<'line'> = baseChartData;
    return <Line data={lineChartData} options={options as ChartOptions<'line'>} />;
  } else {
    const barChartData: ChartData<'bar'> = baseChartData;
    return <Bar data={barChartData} options={options as ChartOptions<'bar'>} />;
  }
};

export default PriceChart;