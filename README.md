# UPDS LMS Frontend

Frontend de un sistema LMS (Learning Management System) construido con React 19, TypeScript y Vite.

---

## Stack principal

| Herramienta | Versión | Rol |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5.9 | Tipado estático |
| Vite | 8 | Bundler / Dev server |
| React Router v7 | — | Navegación y rutas |
| Zustand | 5 | Estado global (auth) |
| Axios | 1.x | Cliente HTTP |
| TanStack Query | 5 | Estado del servidor / caché |
| React Hook Form + Zod | — | Formularios y validación |
| shadcn/ui + Tailwind v4 | — | Componentes UI |
| Recharts | — | Gráficas en dashboards |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/         # Layout, Sidebar, Navbar (estructura visual global)
│   └── ui/             # Componentes shadcn/ui (button, input, card, dialog…)
├── hooks/              # Custom hooks por recurso (usan TanStack Query)
├── lib/
│   ├── http.ts         # Instancia Axios configurada con interceptor de token
│   └── utils.ts        # Helper cn() para clases Tailwind
├── pages/
│   ├── Login.tsx
│   ├── admin/          # Páginas exclusivas del rol admin
│   ├── teacher/        # Páginas exclusivas del rol teacher
│   └── student/        # Páginas exclusivas del rol student
├── routes/
│   ├── AppRoutes.tsx   # Árbol de rutas principal
│   ├── ProtectedRoute  # Guarda de autenticación y roles
│   ├── PublicRoute     # Redirige al dashboard si ya está autenticado
│   ├── AdminRoutes
│   ├── TeacherRoutes
│   └── StudentRoutes
├── services/           # Funciones puras que llaman a la API (usan http.ts)
├── store/              # Stores Zustand (solo estado, sin lógica HTTP)
├── types/              # Interfaces y tipos globales (User, DTOs, etc.)
├── App.tsx
└── main.tsx            # Entry point, monta QueryClientProvider
```

### ¿Qué va en cada carpeta?

| Carpeta | Qué debe contener |
|---|---|
| `components/ui/` | Solo primitivos reutilizables sin lógica de negocio |
| `components/layout/` | Componentes estructurales que envuelven páginas |
| `hooks/` | Un archivo por recurso: `usePersons.ts`, `useCourses.ts`, etc. Usan TanStack Query |
| `services/` | Un archivo por recurso: `person.service.ts`, `course.service.ts`. Solo llamadas HTTP |
| `store/` | Un store Zustand por dominio de estado global (`auth.store.ts`). Solo estado, sin fetches |
| `pages/<rol>/` | Una página por vista. Orquestan hooks, formularios y componentes |
| `routes/` | Solo configuración de rutas. Sin lógica de negocio |
| `types/` | Interfaces TypeScript compartidas entre capas |
| `lib/` | Configuración de librerías externas (Axios, utils) |

---

## Zustand — Estado global

**Archivo:** `src/store/auth.store.ts`

Maneja exclusivamente el estado de autenticación. Se persiste en `localStorage`. El store **no hace llamadas HTTP** — eso es responsabilidad de los hooks.

```ts
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  setAuth(user: User, token: string): void
  logout(): void
  hasRole(roles: UserRole[]): boolean
}
```

**Reglas de uso:**
- En componentes React: `const { user } = useAuthStore()`
- Fuera de componentes (ej. interceptor Axios): `useAuthStore.getState().token`
- Agregar un store nuevo solo si el estado es verdaderamente global; preferir estado local o TanStack Query.

---

## Axios — Cliente HTTP

**Archivo:** `src/lib/http.ts`

```ts
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inyecta el token automáticamente en cada request
http.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

**Cómo se usa en los servicios:**

```ts
// src/services/person.service.ts
export const personService = {
  getAll: () => http.get<PersonDto[]>('/persons').then(r => r.data),
  create: (data: CreatePersonDto) => http.post<PersonDto>('/persons', data).then(r => r.data),
}
```

**Pendiente:** Agregar un response interceptor para manejar errores globales (401 → logout, 500 → toast de error).

---

## TanStack Query — Estado del servidor

**Setup:** `src/main.tsx` monta `<QueryClientProvider client={queryClient}>`.

**Convención:** Un archivo por recurso en `src/hooks/`, con todas las operaciones agrupadas.

```ts
// src/hooks/usePersons.ts

// Query (lectura)
export const usePersons = () =>
  useQuery({ queryKey: ['persons'], queryFn: personService.getAll })

// Mutation (escritura) — invalida la caché al completar
export const useCreatePerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: personService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['persons'] }),
  })
}
```

**Patrones a seguir:**
- `queryKey` siempre como array: `['courses']`, `['courses', id]`
- Invalidar la query correcta en `onSuccess` de cada mutación
- Extraer loading/error del hook y mostrarlo en UI (`isLoading`, `isError`)

---

## Formularios — React Hook Form + Zod

Usar `Controller` de react-hook-form junto con los componentes `Field` de shadcn:

```tsx
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'

const schema = z.object({ name: z.string().min(2) })

const { control, handleSubmit } = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
})

// En JSX
<Controller name="name" control={control} render={({ field, fieldState }) => (
  <Field data-invalid={fieldState.invalid}>
    <FieldLabel>Nombre</FieldLabel>
    <Input {...field} />
    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
  </Field>
)} />
```

---

## Routing y roles

Tres tipos de rutas:

| Componente | Qué hace |
|---|---|
| `PublicRoute` | Redirige al dashboard del rol si ya está autenticado |
| `ProtectedRoute` | Exige `isAuthenticated`; acepta `allowedRoles` opcional |
| `*Routes` (Admin/Teacher/Student) | Definen las subrutas de cada rol |

**Redirección por rol:**
```
admin   → /admin/dashboard
teacher → /teacher/dashboard
student → /student/dashboard
```

---

## Variables de entorno

Copiar `.env.example` a `.env` antes de iniciar:

```bash
VITE_API_URL=http://localhost:5024/api
```

Si no se define `VITE_API_URL`, se usa `http://localhost:5024/api` por defecto.

---

## Comandos

```bash
npm install       # Instalar dependencias
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run lint      # ESLint
```
