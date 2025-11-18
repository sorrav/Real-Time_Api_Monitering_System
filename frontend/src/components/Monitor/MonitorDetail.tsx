import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monitor, HealthRecord, MonitorStats, TimeRange } from '../../types';
import { monitorAPI, healthAPI } from '../../services/api';
import { socketService } from '../../services/socket';
import {
  ArrowLeft,
  Star,
  Trash2,
  ExternalLink,
  Pause,
  Play,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';
import LatencyBadge from '../Common/LatencyBadge';
import LatencyChart from './LatencyChart';
import StatusHistory from './StatusHistory';
import MetricsCards from './MetricsCards';
import ConfirmDialog from '../Common/ConfirmDialog';

const MonitorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch monitor details
  const fetchMonitorDetails = async () => {
    if (!id) return;

    try {
      const response = await monitorAPI.getOne(id);
      setMonitor(response.data.data);
    } catch (error) {
      console.error('Error fetching monitor:', error);
      navigate('/dashboard');
    }
  };

  // Fetch health records
  const fetchHealthRecords = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await healthAPI.getRecords(id, {
        timeRange,
        limit: 100,
      });
      setHealthRecords(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitorDetails();
    fetchHealthRecords();
  }, [id, timeRange]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!id) return;

    socketService.subscribeToMonitor(id);

    const handleHealthUpdate = (data: any) => {
      if (data.monitorId === id) {
        // Update monitor status
        setMonitor((prev) =>
          prev
            ? {
                ...prev,
                currentStatus: data.status,
                currentLatency: data.responseTime,
                lastChecked: data.timestamp,
              }
            : null
        );

        // Add new health record to the list
        const newRecord: HealthRecord = {
          _id: `temp-${Date.now()}`,
          monitorId: id,
          status: data.status,
          statusCode: data.statusCode,
          responseTime: data.responseTime,
          checkedAt: data.timestamp,
        };

        setHealthRecords((prev) => [newRecord, ...prev.slice(0, 99)]);
      }
    };

    socketService.on('health:update', handleHealthUpdate);

    return () => {
      socketService.unsubscribeFromMonitor(id);
      socketService.off('health:update', handleHealthUpdate);
    };
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    try {
      await monitorAPI.toggleFavorite(id);
      fetchMonitorDetails();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleActive = async () => {
    if (!id) return;
    try {
      await monitorAPI.toggleActive(id);
      fetchMonitorDetails();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleteLoading(true);
      await monitorAPI.delete(id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting monitor:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleRefresh = () => {
    fetchMonitorDetails();
    fetchHealthRecords();
  };

  if (!monitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                title={monitor.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-5 h-5 ${
                    monitor.isFavorite
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-400'
                  }`}
                />
              </button>

              <button
                onClick={handleToggleActive}
                className={`p-2 rounded-lg transition-colors ${
                  monitor.isActive
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={monitor.isActive ? 'Pause monitoring' : 'Resume monitoring'}
              >
                {monitor.isActive ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open URL"
              >
                <ExternalLink className="w-5 h-5" />
              </a>

              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete monitor"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {monitor.name}
              </h1>
              <p className="text-gray-600 mb-4">{monitor.url}</p>
              <div className="flex items-center gap-3">
                <StatusBadge status={monitor.currentStatus} />
                <LatencyBadge latency={monitor.currentLatency} />
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {monitor.method}
                </span>
                {!monitor.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                    Paused
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        {stats && <MetricsCards stats={stats} monitor={monitor} />}

        {/* Time Range Selector */}
        <div className="mb-6 flex justify-end">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white">
            {(['1h', '24h', '7d', '30d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${
                  range === '1h'
                    ? 'rounded-l-lg'
                    : range === '30d'
                    ? 'rounded-r-lg'
                    : ''
                }`}
              >
                {range === '1h'
                  ? 'Last Hour'
                  : range === '24h'
                  ? 'Last 24 Hours'
                  : range === '7d'
                  ? 'Last 7 Days'
                  : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Latency Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Response Time Chart
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading chart...</div>
            </div>
          ) : (
            <LatencyChart data={healthRecords} />
          )}
        </div>

        {/* Status History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Status History
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading history...</div>
            </div>
          ) : (
            <StatusHistory records={healthRecords} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Monitor"
          message={`Are you sure you want to delete "${monitor.name}"? This will also delete all associated health records.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          loading={deleteLoading}
          type="danger"
        />
      )}
    </div>
  );
};

export default MonitorDetail;