import { Heart, User, LogOut, Database, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationPanel, type Notification } from './NotificationPanel';

interface HeaderProps {
  currentUser: string;
  currentRole: 'user' | 'coordinator' | 'employee';
  onLogout: () => void;
  onShowDataViewer?: () => void;
  showingDataViewer?: boolean;
  onShowHealthCheck?: () => void;
  showingHealthCheck?: boolean;
  notifications?: Notification[];
  onMarkNotificationAsRead?: (notificationId: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
}

export function Header({ 
  currentUser, 
  currentRole, 
  onLogout, 
  onShowDataViewer, 
  showingDataViewer, 
  onShowHealthCheck, 
  showingHealthCheck,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Heart className="size-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-gray-900">Charity Homework</h1>
              <p className="text-sm text-gray-600">Plataforma de causas benéficas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <User className="size-4 text-gray-600" />
              <div className="flex flex-col">
                <span className="text-sm">{currentUser}</span>
                <span className="text-xs text-gray-500">
                  {currentRole === 'coordinator' ? 'Coordinador' : currentRole === 'employee' ? 'Empleado' : 'Usuario'}
                </span>
              </div>
            </div>

            {/* Mostrar notificaciones solo para usuarios y empleados */}
            {currentRole !== 'coordinator' && onMarkNotificationAsRead && onMarkAllNotificationsAsRead && (
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={onMarkNotificationAsRead}
                onMarkAllAsRead={onMarkAllNotificationsAsRead}
                currentUser={currentUser}
              />
            )}

            {onShowHealthCheck && (
              <Button 
                variant={showingHealthCheck ? "default" : "outline"} 
                size="sm" 
                onClick={onShowHealthCheck}
              >
                <Activity className="size-4 mr-2" />
                {showingHealthCheck ? 'Ocultar Check' : 'Verificar Sistema'}
              </Button>
            )}

            {onShowDataViewer && (
              <Button 
                variant={showingDataViewer ? "default" : "outline"} 
                size="sm" 
                onClick={onShowDataViewer}
              >
                <Database className="size-4 mr-2" />
                {showingDataViewer ? 'Ocultar BD' : 'Ver BD'}
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="size-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
