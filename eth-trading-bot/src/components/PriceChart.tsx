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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  data: number[];
  type: 'line' | 'bar';
}

const PriceChart: React.FC<PriceChartProps> = ({ data, type }) => {
  const labels = data.map((_, index) => index.toString());

  const chartData: ChartData<'line' | 'bar'> = {
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
  };

  if (type === 'line') {
    return <Line data={chartData as ChartData<'line'>} options={options as ChartOptions<'line'>} />;
  } else {
    return <Bar data={chartData as ChartData<'bar'>} options={options as ChartOptions<'bar'>} />;
  }
};

export default PriceChart;