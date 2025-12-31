'use client';

import { useEffect, useRef } from 'react';
import { getCandlestickConfig, getChartConfig } from '@/constants';
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { convertOHLCData } from '@/lib/utils';

const CandlestickChart = ({
    children,
    data,
    height = 360,
}: CandlestickChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    const ohlcData = data ?? [];

    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;
        const ohlcData = data ?? [];
        const chart = createChart(container, {
            ...getChartConfig(height, true),
            width: container.clientWidth,
        });
        const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());
        const convertedToSeconds = ohlcData.map(
            (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData,
        );
        const converted = convertOHLCData(convertedToSeconds);
        series.setData(converted);
        chart.timeScale().fitContent();
        chartRef.current = chart;
        candleSeriesRef.current = series;
        const observer = new ResizeObserver((entries) => {
            if (!entries.length) return;
            chart.applyOptions({ width: entries[0].contentRect.width });
        });
        observer.observe(container);
        return () => {
            observer.disconnect();
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
        };
    }, [height, data]);

    return (
        <div id="candlestick-chart">
            <div className="chart-header">
                <div className="flex-1">{children}</div>
            </div>

            <div ref={chartContainerRef} className="chart" style={{ height }} />
        </div>
    );
};

export default CandlestickChart;