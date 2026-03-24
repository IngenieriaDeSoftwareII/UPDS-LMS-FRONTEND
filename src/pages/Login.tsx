import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Login() {
  const navigate = useNavigate();
  const { mutate: login, isPending: isLoading } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('student');

  // Credenciales predefinidas según el rol seleccionado
  const getDefaultCredentials = (role: string) => {
    switch (role) {
      case 'admin':
        return { email: 'admin@eduvirtual.com', password: 'admin123' };
      case 'teacher':
        return { email: 'profesora@eduvirtual.com', password: 'teacher123' };
      case 'student':
        return { email: 'estudiante1@eduvirtual.com', password: 'student123' };
      default:
        return { email: '', password: '' };
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const creds = getDefaultCredentials(value);
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    login(
      { email, password },
      {
        onSuccess: ({ user }) => {
          const redirects = {
            admin: '/admin/dashboard',
            teacher: '/teacher/dashboard',
            student: '/student/dashboard',
          };
          navigate(redirects[user.role]);
        },
        onError: () => setError('Error al iniciar sesión'),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">EduVirtual Pro</h1>
          <p className="text-muted-foreground mt-1">Plataforma Académica Integral</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Selecciona tu rol y accede a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="student">Estudiante</TabsTrigger>
                <TabsTrigger value="teacher">Docente</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Accede como estudiante para ver tus cursos y evaluaciones
                </p>
              </TabsContent>
              <TabsContent value="teacher">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Accede como docente para gestionar tus cursos
                </p>
              </TabsContent>
              <TabsContent value="admin">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Accede como administrador para control total
                </p>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-muted-foreground">Recordarme</span>
                </label>
                <a href="#" className="text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <a href="#" className="text-primary hover:underline font-medium">
                  Regístrate aquí
                </a>
              </p>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Credenciales de demostración:</strong><br />
                Estudiante: estudiante1@eduvirtual.com / student123<br />
                Docente: profesora@eduvirtual.com / teacher123<br />
                Admin: admin@eduvirtual.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          © 2024 EduVirtual Pro. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
