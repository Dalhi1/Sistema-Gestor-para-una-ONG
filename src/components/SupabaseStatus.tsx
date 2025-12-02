import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function SupabaseStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-01ad82bb`;
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Verificar al montar
    checkSupabaseStatus();

    // Verificar cada 30 segundos
    const interval = setInterval(checkSupabaseStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-100">
        <div className="size-2 rounded-full bg-gray-400 animate-pulse" />
        <span className="text-xs text-gray-600">Verificando...</span>
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-green-50" title="Conectado a Supabase (datos en la nube)">
        <Wifi className="size-3 text-green-600" />
        <span className="text-xs text-green-700">Cloud</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-amber-50" title="Modo offline (solo localStorage)">
      <WifiOff className="size-3 text-amber-600" />
      <span className="text-xs text-amber-700">Local</span>
    </div>
  );
}
