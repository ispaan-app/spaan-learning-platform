import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, User, FileText, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
// Helper to update escalation status
async function updateEscalation(id: string, status: string, updatedBy: string, note?: string) {
  const res = await fetch('/api/escalations', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status, updatedBy, note })
  });
  return res.ok;
}

interface Escalation {
  id: string;
  type: string;
  refId: string;
  reason: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdBy: string;
  createdAt: { seconds: number; nanoseconds: number } | string;
  assignedTo?: string;
  escalationHistory?: Array<{
    status: string;
    updatedBy: string;
    updatedAt: { seconds: number; nanoseconds: number } | string;
    note?: string;
  }>;
}

export function EscalationPanel() {
  const { user } = useAuth();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Escalation | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignNote, setAssignNote] = useState('');

  const fetchEscalations = () => {
    setLoading(true);
    fetch('/api/escalations')
      .then(res => res.json())
      .then(data => {
        setEscalations(data.escalations || []);
        setLoading(false);
      });
  };
  useEffect(fetchEscalations, []);
  const handleStatusUpdate = async (status: string) => {
    if (!selected || !user) return;
    setStatusLoading(true);
    await updateEscalation(selected.id, status, user.uid);
    setStatusLoading(false);
    setSelected(null);
    fetchEscalations();
  };

  const handleAssign = async () => {
    if (!selected || !user) return;
    setAssignLoading(true);
    await updateEscalation(selected.id, 'in_progress', user.uid, assignNote);
    setAssignLoading(false);
    setSelected(null);
    setAssignNote('');
    fetchEscalations();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Escalations</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-gray-500">Loading escalations...</div>
        ) : escalations.length === 0 ? (
          <div className="text-center text-gray-400">No escalations found.</div>
        ) : (
          <div className="space-y-3">
            {escalations.map(escalation => (
              <div
                key={escalation.id}
                className="border rounded-lg p-3 flex items-center justify-between hover:bg-orange-50 cursor-pointer"
                onClick={() => setSelected(escalation)}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-500 w-5 h-5" />
                  <div>
                    <div className="font-medium">{escalation.type} - {escalation.status}</div>
                    <div className="text-xs text-gray-500">{escalation.reason}</div>
                  </div>
                </div>
                <Badge variant={escalation.status === 'open' ? 'destructive' : escalation.status === 'resolved' ? 'default' : 'secondary'}>
                  {escalation.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escalation Details</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Type:</span> {selected.type}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Created By:</span> {selected.createdBy}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Created At:</span> {typeof selected.createdAt === 'string' ? selected.createdAt : new Date(selected.createdAt.seconds * 1000).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Reason:</span>
                  <div className="text-gray-700 text-sm mt-1">{selected.reason}</div>
                </div>
                <div>
                  <span className="font-medium">History:</span>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    {selected.escalationHistory?.map((h, i) => (
                      <li key={i}>
                        <span className="font-semibold">{h.status}</span> by {h.updatedBy} at {typeof h.updatedAt === 'string' ? h.updatedAt : new Date(h.updatedAt.seconds * 1000).toLocaleString()} {h.note && `- ${h.note}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-col gap-2 items-stretch">
              {user && selected && selected.status === 'open' && (
                <div className="flex gap-2">
                  <Textarea
                    value={assignNote}
                    onChange={e => setAssignNote(e.target.value)}
                    placeholder="Add note (optional)"
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={handleAssign} disabled={assignLoading} className="bg-blue-600 text-white flex items-center">
                    {assignLoading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}<UserCheck className="w-4 h-4 mr-2" />Assign to Me
                  </Button>
                </div>
              )}
              {user && selected && selected.status !== 'closed' && (
                <div className="flex gap-2">
                  <Button onClick={() => handleStatusUpdate('resolved')} disabled={statusLoading} className="bg-green-600 text-white flex-1">
                    {statusLoading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}<CheckCircle className="w-4 h-4 mr-2" />Mark Resolved
                  </Button>
                  <Button onClick={() => handleStatusUpdate('closed')} disabled={statusLoading} className="bg-gray-600 text-white flex-1">
                    {statusLoading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}Close
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
