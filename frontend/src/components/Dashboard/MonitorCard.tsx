import React, { useState } from 'react';
import { Monitor } from '../../types';
import { monitorAPI } from '../../services/api';
import {
  Star,
  Trash2,
  ExternalLink,
  Clock,
  Pause,
  Play,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../Common/ConfirmDialog';
import StatusBadge from '../Common/StatusBadge';
import LatencyBadge from '../Common/LatencyBadge';

interface MonitorCardProps {
  monitor: Monitor;
  onDeleted: () => void;
  onUpdated: () => void;
}

const MonitorCard: React.FC<MonitorCardProps> = ({
  monitor,
  onDeleted,
  onUpdated,
}) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await monitorAPI.toggleFavorite(monitor._id);
      onUpdated();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await monitorAPI.toggleActive(monitor._id);
      onUpdated();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await monitorAPI.delete(monitor._id);
      onDeleted();
    } catch (error) {
      console.error('Error deleting monitor:', error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/monitor/${monitor._id}`);
  };

  const formatLastChecked = (date?: string) => {
    if (!date) return 'Never';
    const now = new Date();
    const checked = new Date(date);
    const diffMs = now.getTime() - checked.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return checked.toLocaleDateString();
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleViewDetails}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {monitor.name}
              </h3>
              <button
                onClick={handleToggleFavorite}
                className="flex-shrink-0 focus:outline-none"
              >
                <Star
                  className={`w-5 h-5 ${
                    monitor.isFavorite
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-gray-600 truncate">{monitor.url}</p>
          </div>
        </div>

        {/* Status and Latency */}
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status={monitor.currentStatus} />
          <LatencyBadge latency={monitor.currentLatency} />
        </div>

        {/* Method Badge */}
        <div className="mb-4">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            {monitor.method}
          </span>
        </div>

        {/* Last Checked */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Clock className="w-4 h-4 mr-1.5" />
          <span>Last checked: {formatLastChecked(monitor.lastChecked)}</span>
        </div>

        {/* Check Interval */}
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Interval:</span> {monitor.interval}s
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            View Stats
          </button>

          <div className="flex items-center gap-2">
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
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Open URL"
            >
              <ExternalLink className="w-5 h-5" />
            </a>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete monitor"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inactive Badge */}
        {!monitor.isActive && (
          <div className="mt-4 flex items-center justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <Pause className="w-3 h-3 mr-1" />
              Monitoring Paused
            </span>
          </div>
        )}
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
          loading={loading}
          type="danger"
        />
      )}
    </>
  );
};

export default MonitorCard;