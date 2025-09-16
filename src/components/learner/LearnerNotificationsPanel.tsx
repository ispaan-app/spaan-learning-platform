import React from 'react';
import { AlertCircle, Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LearnerNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read?: boolean;
}

interface LearnerNotificationsPanelProps {
  notifications: LearnerNotification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'info': return <Info className="h-4 w-4 text-blue-600" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
    default: return <Bell className="h-4 w-4 text-gray-600" />;
  }
};

export const LearnerNotificationsPanel: React.FC<LearnerNotificationsPanelProps> = ({ notifications, onMarkAsRead, onDelete }) => {
  if (!notifications.length) return null;
  return (
    <div className="mb-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm">
        <h3 className="font-bold text-blue-700 mb-2 text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notifications
        </h3>
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className={`flex items-center gap-2 text-sm text-${n.type === 'error' ? 'red' : n.type === 'warning' ? 'yellow' : n.type === 'success' ? 'green' : 'blue'}-800 bg-white rounded p-2 shadow-sm`}>
              {getIcon(n.type)}
              <span className={n.read ? 'line-through text-gray-400' : ''}>{n.message}</span>
              <span className="ml-2 text-xs text-gray-400">{new Date(n.date).toLocaleString()}</span>
              {onMarkAsRead && !n.read && (
                <Button size="xs" variant="ghost" className="ml-2 text-blue-500" aria-label="Mark as read" onClick={() => onMarkAsRead(n.id)}>
                  Mark as read
                </Button>
              )}
              {onDelete && (
                <Button size="xs" variant="ghost" className="ml-1 text-red-500" aria-label="Delete notification" onClick={() => onDelete(n.id)}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
