import React, { useState } from 'react';
import { monitorAPI } from '../../services/api';
import { X } from 'lucide-react';

interface AddMonitorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddMonitorModal: React.FC<AddMonitorModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'GET',
    interval: 60,
    timeout: 30,
    isFavorite: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Monitor name is required');
      return;
    }

    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }

    // URL validation
    try {
      new URL(formData.url);
    } catch {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setLoading(true);

    try {
      await monitorAPI.create(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create monitor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseInt(value)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Monitor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Monitor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monitor Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Production API"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL / API Endpoint *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://api.example.com/health"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Include http:// or https://
              </p>
            </div>

            {/* HTTP Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Check Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check Interval (seconds)
              </label>
              <select
                name="interval"
                value={formData.interval}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
              </select>
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (seconds)
              </label>
              <select
                name="timeout"
                value={formData.timeout}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={10}>10 seconds</option>
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>

            {/* Favorite Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFavorite"
                id="isFavorite"
                checked={formData.isFavorite}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isFavorite" className="ml-2 text-sm text-gray-700">
                Mark as favorite
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Monitor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMonitorModal;