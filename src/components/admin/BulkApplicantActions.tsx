import React from 'react';
import { Button } from '@/components/ui/button';

interface BulkApplicantActionsProps {
  onApproveAll: () => void;
  onSendReminders: () => void;
}

export const BulkApplicantActions: React.FC<BulkApplicantActionsProps> = ({ onApproveAll, onSendReminders }) => (
  <div className="flex gap-2 mb-4">
    <Button variant="default" size="sm" onClick={onApproveAll}>
      Approve All
    </Button>
    <Button variant="secondary" size="sm" onClick={onSendReminders}>
      Send Reminders
    </Button>
  </div>
);
