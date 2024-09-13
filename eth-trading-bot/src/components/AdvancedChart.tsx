import React, { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import { Box, Select, HStack, Button, useColorModeValue } from "@chakra-ui/react"

interface AdvancedChartProps {
  data: any[]
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [timeframe, setTimeframe] = useState('1M')
  const [interval, setInterval] = useState('1h')

  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')
  const gridColor = useColorModeValue('rgba(197, 203, 206, 0.5)', 'rgba(197, 203, 206, 0.1)')

  useEffect(() => {
    if (chartContainerRef.current && data && data.length > 0) {
      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current!.clientWidth })
      }

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: bgColor },
          textColor: textColor,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        crosshair: {
          mode: 0,
        },
        rightPriceScale: {
          borderColor: gridColor,
        },
        timeScale: {
          borderColor: gridColor,
          timeVisible: true,
          secondsVisible: false,
        },
      })

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      })

      candleSeries.setData(data)

      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      })

      volumeSeries.setData(data.map((d: any) => ({
        time: d.time,
        value: d.volume,
        color: d.close > d.open ? '#26a69a' : '#ef5350',
      })))

      chart.timeScale().fitContent()

      window.addEventListener('resize', handleResize)

      chartRef.current = chart
      candleSeriesRef.current = candleSeries

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.remove()
      }
    }
  }, [data, bgColor, textColor, gridColor])

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    // Here you would fetch new data based on the timeframe and update the chart
  }

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval)
    // Here you would fetch new data based on the interval and update the chart
  }

  const addSMA = () => {
    if (chartRef.current && candleSeriesRef.current) {
      const smaData = calculateSMA(data, 20)
      chartRef.current.addLineSeries({
        color: 'rgba(4, 111, 232, 1)',
        lineWidth: 2,
      }).setData(smaData)
    }
  }

  const addEMA = (period: number) => {
    if (chartRef.current && candleSeriesRef.current) {
      const emaData = calculateEMA(data, period)
      chartRef.current.addLineSeries({
        color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
        lineWidth: 2,
      }).setData(emaData)
    }
  }

  const addBollingerBands = () => {
    if (chartRef.current && candleSeriesRef.current) {
      const { upper, lower } = calculateBollingerBands(data, 20, 2)
      chartRef.current.addLineSeries({
        color: 'rgba(255, 0, 0, 0.5)',
        lineWidth: 1,
      }).setData(upper)
      chartRef.current.addLineSeries({
        color: 'rgba(0, 255, 0, 0.5)',
        lineWidth: 1,
      }).setData(lower)
    }
  }

  return (
    <Box>
      <HStack spacing={4} mb={4}>
        <Select value={timeframe} onChange={(e) => handleTimeframeChange(e.target.value)}>
          <option value="1M">1 Month</option>
          <option value="3M">3 Months</option>
          <option value="1Y">1 Year</option>
        </Select>
        <Select value={interval} onChange={(e) => handleIntervalChange(e.target.value)}>
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
        </Select>
        <Button onClick={addSMA}>Add SMA</Button>
        <Button onClick={() => addEMA(9)}>Add EMA 9</Button>
        <Button onClick={() => addEMA(21)}>Add EMA 21</Button>
        <Button onClick={addBollingerBands}>Add Bollinger Bands</Button>
      </HStack>
      <Box ref={chartContainerRef} height="400px" />
    </Box>
  )
}

function calculateSMA(data: any[], period: number) {
  const sma = []
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0)
    sma.push({ time: data[i].time as UTCTimestamp, value: sum / period })
  }
  return sma
}

function calculateEMA(data: any[], period: number) {
  const k = 2 / (period + 1)
  let ema = data[0].close
  return data.map((d) => {
    ema = d.close * k + ema * (1 - k)
    return { time: d.time as UTCTimestamp, value: ema }
  })
}

function calculateBollingerBands(data: any[], period: number, multiplier: number) {
  const sma = data.map((_, i, arr) => {
    if (i < period - 1) return null
    const sum = arr.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0)
    return sum / period
  })

  const upper = []
  const lower = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const avg = sma[i]!
    const stdDev = Math.sqrt(slice.reduce((sum, val) => sum + Math.pow(val.close - avg, 2), 0) / period)
    upper.push({ time: data[i].time as UTCTimestamp, value: avg + multiplier * stdDev })
    lower.push({ time: data[i].time as UTCTimestamp, value: avg - multiplier * stdDev })
  }

  return { upper, lower }
}

export default AdvancedChart