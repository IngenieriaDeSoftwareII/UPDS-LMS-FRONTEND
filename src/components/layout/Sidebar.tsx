import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCog,
  Menu, ChevronLeft, X, BookOpen, Layers, Library, GraduationCap, ChevronDown
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  path?: string
  icon: React.ElementType
  roles: UserRole[]
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
  { label: 'Personas', path: '/admin/persons', icon: Users, roles: ['Admin'] },
  { label: 'Usuarios', path: '/admin/users', icon: UserCog, roles: ['Admin'] },

  {
    label: 'Módulos',
    icon: Library,
    roles: ['Admin'],
    children: [
      { label: 'Catálogos', path: '/admin/catalogs', icon: Library, roles: ['Admin'] },
      { label: 'Categorías', path: '/admin/categories', icon: Layers, roles: ['Admin'] },
      { label: 'Cursos', path: '/admin/courses', icon: BookOpen, roles: ['Admin'] },
    ],
  },

  { label: 'Docentes', path: '/admin/teachers', icon: GraduationCap, roles: ['Admin'] },

  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, roles: ['Docente'] },
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard, roles: ['Estudiante'] },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { role } = useAuthStore()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  const handleNavClick = () => {
    if (window.innerWidth < 1024) onToggle()
  }

  const filteredNavItems = navItems.filter(item =>
    role && item.roles.includes(role)
  )

  const renderItem = (item: NavItem) => {
    const isOpen = openMenus.includes(item.label)

    // 🔥 ITEM CON HIJOS (NAVIGA + DESPLIEGA)
    if (item.children) {
      return (
        <div key={item.label}>
          <NavLink
            to={item.path || '#'}
            onClick={() => toggleMenu(item.label)}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between p-3 rounded-md transition",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )
            }
          >
            <div className="flex items-center gap-4">
              <item.icon className="w-5 h-5" />
              {!isCollapsed && <span>{item.label}</span>}
            </div>

            {!isCollapsed && (
              <ChevronDown
                className={cn("w-4 h-4 transition", isOpen && "rotate-180")}
              />
            )}
          </NavLink>

          {isOpen && (
            <div className="ml-4 border-l pl-2">
              {item.children
                .filter(child => role && child.roles.includes(role))
                .map(child => renderItem(child))}
            </div>
          )}
        </div>
      )
    }

    // 🔥 ITEM NORMAL
    return (
      <NavLink
        key={item.path}
        to={item.path!}
        onClick={handleNavClick}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-4 p-3 rounded-md transition",
            isCollapsed && "lg:justify-center",
            isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )
        }
      >
        <item.icon className="w-5 h-5" />
        {!isCollapsed && <span>{item.label}</span>}
      </NavLink>
    )
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity duration-300",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={onToggle}
      />

      <div className={cn(
        "flex flex-col fixed left-0 top-0 h-screen z-40 bg-secondary text-secondary-foreground transition-all duration-300",
        isCollapsed
          ? "-translate-x-full lg:translate-x-0 lg:w-20 w-64"
          : "translate-x-0 w-64"
      )}>
        <div className={cn(
          "flex items-center p-4 border-b border-border",
          isCollapsed ? "lg:justify-center justify-between" : "justify-between"
        )}>
          <h1 className={cn("text-lg font-bold", isCollapsed && "lg:hidden")}>
            EduVirtual
          </h1>

          <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onToggle} className="hidden lg:flex">
            {isCollapsed ? <Menu /> : <ChevronLeft />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-2">
            {filteredNavItems.map(item => renderItem(item))}
          </div>
        </nav>
      </div>
    </>
  )
}