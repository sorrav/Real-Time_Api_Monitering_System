import React, { useState } from 'react';
import { HealthRecord } from '../../types';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusHistoryProps {
  records: HealthRecord[];
}

const StatusHistory: React.FC<StatusHistoryProps> = ({ records }) => {
  const [showAll, setShowAll] = useState(false);
  const displayRecords = showAll ? records : records.slice(0, 10);

  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">No history available</p>
      </div>
    );
  }

  const formatTime = (date: string) => {
    const now = new Date();
    const checked = new Date(date);
    const diffMs = now.getTime() - checked.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return checked.toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    return status === 'up' ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 200) return 'text-green-600';
    if (latency < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-600';
    if (code >= 300 && code < 400) return 'text-blue-600';
    if (code >= 400 && code < 500) return 'text-orange-600';
    if (code >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Response Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Checked At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Error
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayRecords.map((record, index) => (
              <tr key={record._id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(record.status)}
                    <span
                      className={`ml-2 text-sm font-medium ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${getStatusCodeColor(
                      record.statusCode
                    )}`}
                  >
                    {record.statusCode || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${getLatencyColor(
                      record.responseTime
                    )}`}
                  >
                    {record.responseTime}ms
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {formatTime(record.checkedAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.errorMessage ? (
                    <div className="flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      <span className="truncate max-w-xs">
                        {record.errorMessage}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length > 10 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            {showAll ? 'Show Less' : `Show All (${records.length} records)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusHistory;