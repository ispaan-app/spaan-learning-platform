import React from 'react';

export interface AdminNotification {
  id: string;
  message: string;
  type: 'system' | 'message' | 'alert';
  date: string;
  read?: boolean;
}

interface AdminNotificationsPanelProps {
  notifications: AdminNotification[];
}

export const AdminNotificationsPanel: React.FC<AdminNotificationsPanelProps> = ({ notifications }) => {
  if (!notifications.length) return null;
  return (
    <div className="mb-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm">
        <h3 className="font-bold text-blue-700 mb-2 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          Admin Notifications
        </h3>
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className={`text-sm text-${n.type === 'alert' ? 'red' : n.type === 'system' ? 'blue' : 'gray'}-800`}>
              <span className="font-medium">[{n.type}]</span> {n.message}
              <span className="ml-2 text-xs text-gray-400">{new Date(n.date).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
