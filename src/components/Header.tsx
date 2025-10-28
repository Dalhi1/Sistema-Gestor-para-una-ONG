import { Heart, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  currentUser: string;
  currentRole: 'user' | 'coordinator' | 'employee';
  onLogout: () => void;
}

export function Header({ currentUser, currentRole, onLogout }: HeaderProps) {
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