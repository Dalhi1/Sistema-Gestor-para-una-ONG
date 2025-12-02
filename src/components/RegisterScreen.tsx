import { useState } from 'react';
import { Heart, UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface RegisterScreenProps {
  onRegister: (userData: {
    fullName: string;
    age: number;
    gender: string;
    username: string;
    password: string;
  }) => Promise<void>;
  onBackToLogin: () => void;
}

export function RegisterScreen({ onRegister, onBackToLogin }: RegisterScreenProps) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!fullName.trim()) {
      setError('Por favor ingresa tu nombre completo');
      return;
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      setError('Por favor ingresa una edad válida');
      return;
    }

    if (!gender) {
      setError('Por favor selecciona tu género');
      return;
    }

    if (!username.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      return;
    }

    if (username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    if (!password) {
      setError('Por favor ingresa una contraseña');
      return;
    }

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Registrar usuario
    setLoading(true);
    try {
      await onRegister({
        fullName: fullName.trim(),
        age: parseInt(age),
        gender,
        username: username.trim().toLowerCase(),
        password,
      });
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
              <Heart className="size-8 text-white" fill="white" />
            </div>
            <h1 className="text-gray-900">Charity Homework</h1>
          </div>
          <p className="text-gray-600">Únete a nuestra plataforma de causas benéficas</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Crear Cuenta
            </CardTitle>
            <CardDescription>
              Completa tus datos para registrarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ej: María García López"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Select value={gender} onValueChange={setGender} disabled={loading}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="usuario123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />
                <p className="text-xs text-gray-500">
                  Mínimo 3 caracteres, se usará para iniciar sesión
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500">
                  Mínimo 4 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onBackToLogin}
                disabled={loading}
              >
                <ArrowLeft className="size-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          Al registrarte, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}
