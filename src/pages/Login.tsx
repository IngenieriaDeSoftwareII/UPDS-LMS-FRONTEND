import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Lock, Mail, AlertCircle, Sun, Moon, Monitor } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiErrorMessage } from '@/lib/api.error';

type Theme = 'light' | 'dark' | 'system';

const themeConfig: Record<Theme, { next: Theme; icon: typeof Sun; label: string }> = {
  light:  { next: 'dark',   icon: Sun,     label: 'Tema claro' },
  dark:   { next: 'system', icon: Moon,    label: 'Tema oscuro' },
  system: { next: 'light',  icon: Monitor, label: 'Tema del sistema' },
};

export function Login() {
  const navigate = useNavigate()
  const { mutate: login, isPending: isLoading } = useLogin();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('rememberedEmail'));

  const currentTheme = (theme as Theme) in themeConfig ? (theme as Theme) : 'system';
  const { next, icon: ThemeIcon, label: themeLabel } = themeConfig[currentTheme];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (remember) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    login(
      { Email: email, Password: password },
      {
        onSuccess: ({ redirectTo }) => navigate(redirectTo, { replace: true }),
        onError: (err) => setError(getApiErrorMessage(err, 'Error al iniciar sesión')),
      }
    );
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Panel izquierdo — Hero Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Foto del campus */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/campus.jpg')` }}
        />

        {/* Barra superior translúcida */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/60 dark:bg-black/50 backdrop-blur-sm px-10 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-black/10 dark:bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-gray-900 dark:text-white" />
          </div>
          <span className="text-gray-900 dark:text-white font-bold text-lg">EduVirtual Pro</span>
        </div>

        {/* Degradado inferior + cita */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white/90 via-white/60 to-transparent dark:from-black/85 dark:via-black/60 dark:to-transparent pt-24 pb-12 px-10">
          <blockquote className="border-l-4 border-gray-900/40 dark:border-white/50 pl-5">
            <p className="text-gray-900 dark:text-white text-lg font-light leading-relaxed italic">
              "La educación es el arma más poderosa que puedes usar para cambiar el mundo."
            </p>
            <footer className="text-gray-600 dark:text-white/70 mt-3 text-sm font-medium">
              — Nelson Mandela
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8 relative">
        {/* Botón de tema */}
        <button
          onClick={() => setTheme(next)}
          title={themeLabel}
          className="absolute top-5 right-5 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ThemeIcon className="w-5 h-5" />
        </button>

        {/* Tarjeta del formulario */}
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8 space-y-7">
          {/* Logo móvil */}
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">EduVirtual Pro</span>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Iniciar Sesión</h1>
            <p className="text-muted-foreground text-sm mt-1">Ingresa tus credenciales para acceder</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
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

            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                className="rounded border-border accent-indigo-600"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Recordarme
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium"
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

          <p className="text-center text-xs text-muted-foreground pt-1">
            © 2024 EduVirtual Pro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
