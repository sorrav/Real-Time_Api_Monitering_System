import React from 'react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'up' | 'down' | 'unknown';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'up':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'UP',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'down':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'DOWN',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'unknown':
      default:
        return {
          icon: <HelpCircle className="w-4 h-4" />,
          text: 'UNKNOWN',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.icon}
      <span className="ml-1.5">{config.text}</span>
    </span>
  );
};

export default StatusBadge;