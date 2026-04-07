import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Monitor, Moon, Search, Settings, Sun, User, ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/useAuth';

interface NavbarProps {
  sidebarCollapsed: boolean;
  onToggle: () => void;
}

const themeIcons = { light: Sun, dark: Moon, system: Monitor };

export function Navbar({ sidebarCollapsed, onToggle }: NavbarProps) {
  const { role, profile } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const ThemeIcon = themeIcons[theme];

  // TODO: reemplazar con useNotifications() cuando el servicio esté listo
  const unreadCount = 0;


  return (
    <header className={cn(
      "fixed top-0 right-0 h-16 bg-background border-b z-30 transition-all duration-300",
      sidebarCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-64"
    )}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Hamburger - mobile only */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggle}>
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search - hidden on mobile */}
        <div className="hidden md:flex items-center flex-1 max-w-md lg:ml-0 ml-12">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar cursos, lecciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Mobile title */}
        <div className="md:hidden ml-12">
          <span className="font-bold text-lg">EduVirtual</span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b">
                <h4 className="font-semibold">Notificaciones</h4>
              </div>
              <div className="p-4 text-center text-muted-foreground">
                No hay notificaciones
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ThemeIcon className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="w-4 h-4 mr-2" /> Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="w-4 h-4 mr-2" /> Oscuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="w-4 h-4 mr-2" /> Auto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.firstName ?? role}`}
                  alt={profile?.firstName ?? role ?? 'Usuario'}
                  className="w-8 h-8 rounded-full bg-muted"
                />
                <span className="hidden sm:inline font-medium text-sm">
                  {profile ? `${profile.firstName} ${profile.lastName}` : role}
                </span>
                <ChevronDown className="w-4 h-4 hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{profile ? `${profile.firstName} ${profile.lastName}` : role}</span>
                  {profile && (
                    <span className="text-xs text-muted-foreground font-normal">{profile.email}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
