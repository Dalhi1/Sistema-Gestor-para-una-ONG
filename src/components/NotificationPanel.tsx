import { useState, useEffect } from 'react';
import { Bell, X, Check, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../utils/dateHelpers';

export interface Notification {
  id: string;
  recipientUsername: string;
  type: 'file_uploaded' | 'phase_approved' | 'phase_returned';
  projectId: string;
  projectTitle: string;
  phaseName: string;
  message: string;
  read: boolean;
  createdAt: Date | string;
  metadata?: {
    fileName?: string;
    senderUsername?: string;
  };
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  currentUser: string;
}

export function NotificationPanel({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  currentUser 
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'file_uploaded':
        return <Upload className="size-4 text-blue-600" />;
      case 'phase_approved':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'phase_returned':
        return <XCircle className="size-4 text-red-600" />;
      default:
        return <Bell className="size-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'file_uploaded':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'phase_approved':
        return 'border-l-green-500 bg-green-50/50';
      case 'phase_returned':
        return 'border-l-red-500 bg-red-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            variant="default"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-96"
            >
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Notificaciones</CardTitle>
                      <CardDescription>
                        {unreadCount > 0 
                          ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
                          : 'No tienes notificaciones sin leer'
                        }
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className="w-full mt-2"
                    >
                      <Check className="size-4 mr-2" />
                      Marcar todas como leídas
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Bell className="size-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600">No hay notificaciones</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Te avisaremos cuando haya novedades
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-l-4 transition-all hover:bg-gray-50 ${
                              getNotificationColor(notification.type)
                            } ${notification.read ? 'opacity-60' : ''}`}
                            onClick={() => !notification.read && onMarkAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm ${notification.read ? '' : 'font-medium'}`}>
                                    {notification.message}
                                  </p>
                                  {!notification.read && (
                                    <div className="size-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {notification.projectTitle}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(notification.createdAt)}
                                  </span>
                                </div>
                                {notification.metadata?.fileName && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    📎 {notification.metadata.fileName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
