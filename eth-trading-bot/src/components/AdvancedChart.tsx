import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts';
import { Box } from '@chakra-ui/react';

interface AdvancedChartProps {
  data: number[];
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
          vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
          horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
        },
        crosshair: {
          mode: 0,
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
      });

      const lineSeries = chart.addLineSeries({ color: 'rgb(75, 192, 192)' });
      const currentTime = Math.floor(Date.now() / 1000) as UTCTimestamp;
      lineSeries.setData(data.map((price, index) => ({
        time: (currentTime - (data.length - 1 - index) * 86400) as UTCTimestamp,
        value: price
      })));

      chart.timeScale().fitContent();

      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [data]);

  return <Box ref={chartContainerRef} width="100%" height="300px" />;
};

export default AdvancedChart;