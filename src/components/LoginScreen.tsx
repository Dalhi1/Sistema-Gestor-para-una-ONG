import { useState } from 'react';
import { Heart, LogIn, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface LoginScreenProps {
  onLogin: (username: string, role: 'user' | 'coordinator' | 'employee') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar credenciales
    const lowerUsername = username.toLowerCase();
    if (username === 'usser' && password === '1234') {
      onLogin('usser', 'user');
    } else if (username === 'admin' && password === '1234') {
      onLogin('admin', 'coordinator');
    } else if ((lowerUsername === 'andrea' || lowerUsername === 'luis' || lowerUsername === 'sergio') && password === '1234') {
      onLogin(lowerUsername, 'employee');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
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

              <Button type="submit" className="w-full">
                <LogIn className="size-4 mr-2" />
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>💡 Credenciales de prueba:</p>
          <div className="text-xs mt-2 space-y-1">
            <p>Usuario: <span className="font-mono bg-white px-2 py-0.5 rounded">usser / 1234</span></p>
            <p>Coordinador: <span className="font-mono bg-white px-2 py-0.5 rounded">admin / 1234</span></p>
            <p>Empleados: <span className="font-mono bg-white px-2 py-0.5 rounded">andrea / luis / sergio</span> (contraseña: 1234)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
