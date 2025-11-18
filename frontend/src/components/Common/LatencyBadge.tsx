import React from 'react';
import { Zap, AlertTriangle, Clock } from 'lucide-react';

interface LatencyBadgeProps {
  latency: number; // in milliseconds
}

const LatencyBadge: React.FC<LatencyBadgeProps> = ({ latency }) => {
  const getLatencyConfig = () => {
    if (latency === 0) {
      return {
        icon: <Clock className="w-4 h-4" />,
        text: 'N/A',
        className: 'bg-gray-100 text-gray-700',
      };
    } else if (latency < 200) {
      return {
        icon: <Zap className="w-4 h-4" />,
        text: `${latency}ms`,
        className: 'bg-green-100 text-green-700',
      };
    } else if (latency < 1000) {
      return {
        icon: <Clock className="w-4 h-4" />,
        text: `${latency}ms`,
        className: 'bg-yellow-100 text-yellow-700',
      };
    } else {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        text: `${latency}ms`,
        className: 'bg-red-100 text-red-700',
      };
    }
  };

  const config = getLatencyConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.icon}
      <span className="ml-1.5">{config.text}</span>
    </span>
  );
};

export default LatencyBadge;