
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, Trash2, MoreHorizontal, ExternalLink, AlertTriangle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';


// Dummy types and data for demonstration
type Notification = {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  read: boolean;
  createdAt: Date;
  senderName?: string;
  actionUrl?: string;
  type?: string;
};
const notifications: Notification[] = [];
const filteredNotifications: Notification[] = notifications;
const selectedNotifications = new Set<string>();
const stats = { unreadNotifications: 0 };
const handleDeleteSelected = () => {};
const handleMarkAllAsRead = () => {};
const toggleNotificationSelection = (id: string) => {};
const getNotificationIcon = (type?: string) => <Bell />;
const getCategoryColor = (category: string) => '';
const getPriorityColor = (priority: string) => '';
const formatTimeAgo = (date: Date) => '';
const handleMarkAsRead = (id: string) => {};
const handleEscalate = (notification: Notification) => {};
const handleDeleteNotification = (id: string) => {};

export default function Inbox() {
  return (
    <div className={cn('space-y-6')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600">Manage your notifications and messages</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedNotifications && selectedNotifications.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedNotifications.size})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={stats.unreadNotifications === 0}>
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>
      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {notifications.length === 0 ? 'No notifications yet' : 'No notifications found'}
              </h3>
              <p className="text-gray-500">
                {notifications.length === 0 ? 'Notifications will appear here when you receive them.' : 'Try adjusting your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications && selectedNotifications.has(notification.id)}
                    onChange={() => toggleNotificationSelection(notification.id)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 rounded-lg bg-blue-100">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-sm">{notification.title}</h3>
                            <Badge variant="secondary" className="text-xs">{notification.category}</Badge>
                            <span className="text-xs">{notification.priority}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            {notification.senderName && <span>From: {notification.senderName}</span>}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(notification.actionUrl, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEscalate(notification)} className="text-orange-600">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Escalate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteNotification(notification.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}



