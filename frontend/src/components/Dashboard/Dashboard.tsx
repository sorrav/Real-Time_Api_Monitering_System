import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Monitor, MonitorSummary, FilterType, SortType } from '../../types';
import { monitorAPI } from '../../services/api';
import { socketService } from '../../services/socket';
import DashboardHeader from './DashboardHeader';
import FilterBar from './FilterBar';
import MonitorGrid from './MonitorGrid';
import AddMonitorModal from './AddMonitorModal';
import { Activity, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [summary, setSummary] = useState<MonitorSummary>({
    total: 0,
    up: 0,
    down: 0,
    unknown: 0,
    favorites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch monitors
  const fetchMonitors = async () => {
    try {
      setLoading(true);
      const params: any = { sort };
      
      if (filter === 'favorites') params.favorite = true;
      if (filter === 'up') params.status = 'up';
      if (filter === 'down') params.status = 'down';

      const response = await monitorAPI.getAll(params);
      setMonitors(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching monitors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, [filter, sort]);

  // Socket.IO real-time updates
  useEffect(() => {
    const handleHealthUpdate = (data: any) => {
      setMonitors((prevMonitors) =>
        prevMonitors.map((monitor) =>
          monitor._id === data.monitorId
            ? {
                ...monitor,
                currentStatus: data.status,
                currentLatency: data.responseTime,
                lastChecked: data.timestamp,
              }
            : monitor
        )
      );

      // Update summary
      setSummary((prev) => {
        const newSummary = { ...prev };
        // Recalculate based on updated monitors
        return newSummary;
      });
    };

    socketService.on('health:update', handleHealthUpdate);

    return () => {
      socketService.off('health:update', handleHealthUpdate);
    };
  }, []);

  const handleAddMonitor = () => {
    setShowAddModal(true);
  };

  const handleMonitorAdded = () => {
    setShowAddModal(false);
    fetchMonitors();
  };

  const handleMonitorDeleted = () => {
    fetchMonitors();
  };

  const handleMonitorUpdated = () => {
    fetchMonitors();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-indigo-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Health Monitor</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Summary */}
        <DashboardHeader summary={summary} onAddMonitor={handleAddMonitor} />

        {/* Filters and Sorting */}
        <FilterBar
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />

        {/* Monitors Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading monitors...</div>
          </div>
        ) : monitors.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No monitors yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first monitor
            </p>
            <button
              onClick={handleAddMonitor}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Monitor
            </button>
          </div>
        ) : (
          <MonitorGrid
            monitors={monitors}
            onMonitorDeleted={handleMonitorDeleted}
            onMonitorUpdated={handleMonitorUpdated}
          />
        )}
      </div>

      {/* Add Monitor Modal */}
      {showAddModal && (
        <AddMonitorModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleMonitorAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;