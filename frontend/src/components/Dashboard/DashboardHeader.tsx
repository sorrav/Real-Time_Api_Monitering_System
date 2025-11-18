import React from 'react';
import { MonitorSummary } from '../../types';
import { Activity, AlertCircle, CheckCircle, HelpCircle, Plus, Star } from 'lucide-react';

interface DashboardHeaderProps {
  summary: MonitorSummary;
  onAddMonitor: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ summary, onAddMonitor }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <button
          onClick={onAddMonitor}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Monitor
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Monitors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total}</p>
            </div>
            <Activity className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Up */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Up</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{summary.up}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Down */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Down</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{summary.down}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Unknown */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unknown</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{summary.unknown}</p>
            </div>
            <HelpCircle className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Favorites */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{summary.favorites}</p>
            </div>
            <Star className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;