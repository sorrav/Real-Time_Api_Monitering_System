import React from 'react';
import { Monitor, MonitorStats } from '../../types';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MetricsCardsProps {
  stats: MonitorStats;
  monitor: Monitor;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ stats, monitor }) => {
  const formatLastChecked = (date?: string) => {
    if (!date) return 'Never';
    const now = new Date();
    const checked = new Date(date);
    const diffMs = now.getTime() - checked.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} minutes ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hours ago`;
    return checked.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Uptime */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Uptime</p>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.uptime}%</p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.successfulChecks} / {stats.totalChecks} successful
        </p>
      </div>

      {/* Average Latency */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Avg. Latency</p>
          <Clock className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.averageLatency}ms</p>
        <p className="text-xs text-gray-500 mt-1">
          Current: {monitor.currentLatency}ms
        </p>
      </div>

      {/* Total Checks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Checks</p>
          <CheckCircle className="w-5 h-5 text-indigo-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.totalChecks}</p>
        <p className="text-xs text-gray-500 mt-1">
          Interval: {monitor.interval}s
        </p>
      </div>

      {/* Failed Checks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Failed Checks</p>
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.failedChecks}</p>
        <p className="text-xs text-gray-500 mt-1">
          Last checked: {formatLastChecked(monitor.lastChecked)}
        </p>
      </div>
    </div>
  );
};

export default MetricsCards;