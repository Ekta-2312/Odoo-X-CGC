import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface StatusProgressProps {
  statuses: Array<{ label: string; completed: boolean }>;
  currentStatus: number;
}

const StatusProgress: React.FC<StatusProgressProps> = ({ statuses, currentStatus }) => {
  return (
    <div className="space-y-4">
      {statuses.map((status, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            index <= currentStatus
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}>
            {index <= currentStatus ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            <p className={`font-medium transition-colors duration-300 ${
              index <= currentStatus ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {status.label}
            </p>
            {index === currentStatus && (
              <p className="text-sm text-blue-600 animate-pulse">In progress...</p>
            )}
          </div>
          
          {index === currentStatus && (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatusProgress;
