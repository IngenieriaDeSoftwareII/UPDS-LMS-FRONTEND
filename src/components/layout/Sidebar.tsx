import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog,
  Menu, ChevronLeft, X, ClipboardList,
  BarChart3, BookOpenCheck, GraduationCap,
  BookOpen, Tags, Library, LibraryBig
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Admin routes
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
  { label: 'Personas', path: '/admin/persons', icon: Users, roles: ['Admin'] },
  { label: 'Usuarios', path: '/admin/users', icon: UserCog, roles: ['Admin'] },
  { label: 'Reportes (Cursos)', path: '/admin/reports/courses', icon: BarChart3, roles: ['Admin'] },
  { label: 'Reportes (Docentes)', path: '/admin/reports/teachers', icon: BarChart3, roles: ['Admin'] },
  { label: 'Cursos', path: '/admin/courses', icon: BookOpen, roles: ['Admin'] },
  { label: 'Categorías', path: '/admin/categories', icon: Tags, roles: ['Admin'] },
  { label: 'Catálogos', path: '/admin/catalogs', icon: LibraryBig, roles: ['Admin'] },

  // Docente (rutas bajo /teacher/*)
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, roles: ['Docente'] },
  { label: 'Mis Cursos', path: '/teacher/courses', icon: BookOpen, roles: ['Docente'] },
  { label: 'Evaluaciones', path: '/teacher/evaluations', icon: ClipboardList, roles: ['Docente'] },
  { label: 'Notas', path: '/teacher/evaluations/grades', icon: BarChart3, roles: ['Docente'] },
  { label: 'Reportes', path: '/teacher/reports', icon: BarChart3, roles: ['Docente'] },

  // Estudiante (rutas bajo /student/*)
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard, roles: ['Estudiante'] },
  { label: 'Catálogo de Cursos', path: '/student/courses', icon: Library, roles: ['Estudiante'] },
  { label: 'Mis Cursos', path: '/student/mycourses', icon: BookOpen, roles: ['Estudiante'] },
  { label: 'Evaluaciones', path: '/student/evaluations', icon: BookOpenCheck, roles: ['Estudiante'] },
  { label: 'Mis notas', path: '/student/evaluations/my-grades', icon: GraduationCap, roles: ['Estudiante'] },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { role } = useAuthStore();

  const filteredNavItems = navItems.filter(item => role && item.roles.includes(role));

  const handleNavClick = () => {
    if (window.innerWidth < 1024) onToggle();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity duration-300",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={onToggle}
      />

      <div className={cn(
        "flex flex-col fixed left-0 top-0 h-screen z-40 bg-secondary text-secondary-foreground transition-all duration-300",
        // Mobile: slide in/out as drawer (always full width)
        // Desktop: visible, width controlled by isCollapsed
        isCollapsed
          ? "-translate-x-full lg:translate-x-0 lg:w-20 w-64"
          : "translate-x-0 w-64"
      )}>
        <div className={cn(
          "flex items-center p-4 border-b border-border",
          isCollapsed ? "lg:justify-center justify-between" : "justify-between"
        )}>
          <h1 className={cn("text-lg font-bold", isCollapsed && "lg:hidden")}>EduVirtual</h1>
          {/* Mobile: X to close drawer */}
          <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>
          {/* Desktop: collapse/expand toggle */}
          <Button variant="ghost" size="icon" onClick={onToggle} className="hidden lg:flex">
            {isCollapsed ? <Menu /> : <ChevronLeft />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 p-2">
            {filteredNavItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 p-3 rounded-md transition-all duration-200",
                      isCollapsed && "lg:justify-center",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {<span className={cn(isCollapsed && "lg:hidden")}>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
