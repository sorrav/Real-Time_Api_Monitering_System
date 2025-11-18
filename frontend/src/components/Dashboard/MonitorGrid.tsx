import React from 'react';
import { Monitor } from '../../types';
import MonitorCard from './MonitorCard';

interface MonitorGridProps {
  monitors: Monitor[];
  onMonitorDeleted: () => void;
  onMonitorUpdated: () => void;
}

const MonitorGrid: React.FC<MonitorGridProps> = ({
  monitors,
  onMonitorDeleted,
  onMonitorUpdated,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {monitors.map((monitor) => (
        <MonitorCard
          key={monitor._id}
          monitor={monitor}
          onDeleted={onMonitorDeleted}
          onUpdated={onMonitorUpdated}
        />
      ))}
    </div>
  );
};

export default MonitorGrid;