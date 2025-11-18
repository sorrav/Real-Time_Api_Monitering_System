import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HealthRecord } from '../../types';

interface LatencyChartProps {
  data: HealthRecord[];
}

const LatencyChart: React.FC<LatencyChartProps> = ({ data }) => {
  // Transform data for chart
  const chartData = data
    .slice()
    .reverse()
    .map((record) => ({
      time: new Date(record.checkedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      latency: record.status === 'up' ? record.responseTime : null,
      status: record.status,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {payload[0].payload.time}
          </p>
          {payload[0].payload.status === 'up' ? (
            <p className="text-sm text-gray-600">
              Latency: <span className="font-semibold">{payload[0].value}ms</span>
            </p>
          ) : (
            <p className="text-sm text-red-600 font-semibold">Down</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Latency (ms)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="latency"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ fill: '#4f46e5', r: 3 }}
            activeDot={{ r: 5 }}
            name="Response Time"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LatencyChart;