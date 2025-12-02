import { useState } from 'react';
import { Heart, LogIn, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { authAPI } from '../utils/supabase/client';

interface LoginScreenProps {
  onLogin: (username: string, role: 'user' | 'coordinator' | 'employee') => void;
  onGoToRegister: () => void;
}

export function LoginScreen({ onLogin, onGoToRegister }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebugInfo(null);

    try {
      console.log('🔐 Iniciando login...', { username, password: '***' });
      
      // Capturar información de debug
      const usersInStorage = localStorage.getItem('charity_homework_users');
      const parsedUsers = usersInStorage ? JSON.parse(usersInStorage) : [];
      
      setDebugInfo({
        attempting: username,
        totalUsers: parsedUsers.length,
        usernames: parsedUsers.map((u: any) => u.username)
      });
      
      const response = await authAPI.login(username, password);
      console.log('✅ Login exitoso:', response);
      onLogin(response.user.username, response.user.role);
    } catch (err: any) {
      console.error('❌ Login fallido:', err);
      setError(err.message || 'Usuario o contraseña incorrectos');
      setShowDebug(true);
    } finally {
      setLoading(false);
    }
  };

  const testDirectLogin = () => {
    // Login directo de prueba
    console.log('🧪 Test login directo');
    onLogin('admin', 'coordinator');
  };

  const clearAndTest = () => {
    localStorage.clear();
    alert('LocalStorage limpiado. Recarga la página y prueba con admin/1234');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl mb-4 shadow-lg">
            <Heart className="size-12 text-white" fill="white" />
          </div>
          <h1 className="text-gray-900 mb-2">Charity Homework</h1>
          <p className="text-gray-600">Plataforma de causas benéficas</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="size-4 mr-2" />
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onGoToRegister}
                disabled={loading}
              >
                <UserPlus className="size-4 mr-2" />
                Crear nueva cuenta
              </Button>
            </form>
          </CardContent>
        </Card>

        {showDebug && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Debug Info:</p>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={testDirectLogin}
            >
              Test Direct Login
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={clearAndTest}
            >
              Clear LocalStorage and Test
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}