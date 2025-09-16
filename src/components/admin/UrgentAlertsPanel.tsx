import React from 'react';

export interface UrgentAlert {
  type: 'applicant' | 'placement' | 'learner';
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface UrgentAlertsPanelProps {
  alerts: UrgentAlert[];
}

export const UrgentAlertsPanel: React.FC<UrgentAlertsPanelProps> = ({ alerts }) => {
  if (!alerts.length) return null;
  return (
    <div className="mb-6">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
        <h3 className="font-bold text-red-700 mb-2 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
          Urgent Alerts
        </h3>
        <ul className="space-y-2">
          {alerts.map((alert, idx) => (
            <li key={idx} className={`text-sm text-${alert.severity === 'error' ? 'red' : alert.severity === 'warning' ? 'yellow' : 'blue'}-800`}>
              {alert.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
