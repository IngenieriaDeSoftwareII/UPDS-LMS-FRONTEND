import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  BookOpenCheck,
  GraduationCap,
  Menu, ChevronLeft
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
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin'] },
  
  // Teacher routes
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, roles: ['teacher'] },
  { label: 'Evaluaciones', path: '/teacher/evaluations', icon: ClipboardList, roles: ['teacher'] },
  { label: 'Notas', path: '/teacher/evaluations/grades', icon: BarChart3, roles: ['teacher'] },
  
  // Student routes
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard, roles: ['student'] },
  { label: 'Evaluaciones', path: '/student/evaluations', icon: BookOpenCheck, roles: ['student'] },
  { label: 'Mis notas', path: '/student/evaluations/my-grades', icon: GraduationCap, roles: ['student'] },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user } = useAuthStore();

  const filteredNavItems = navItems.filter(item => user?.role && item.roles.includes(user.role));

  return (
    <div className={cn("h-full bg-secondary text-secondary-foreground flex flex-col", { "w-20": isCollapsed, "w-64": !isCollapsed })}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className={cn("text-lg font-bold", { hidden: isCollapsed })}>EduVirtual</h1>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isCollapsed ? <Menu /> : <ChevronLeft />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 p-3 rounded-md transition-all duration-200",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
