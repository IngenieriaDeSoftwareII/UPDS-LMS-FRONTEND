import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, ServerCrash, Search, Users, Briefcase, Clock, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useTeachers, useCreateTeacher, useUpdateTeacher } from '@/hooks/useTeachers'
import { useUsers } from '@/hooks/useUsers'
import type { Teacher } from '@/types/teacher'

import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Validación ──────────────────────────────────────────────────────────────

const teacherSchema = z.object({
  usuarioId: z.string().min(1, 'Requerido'),
  especialidad: z.string().min(1, 'Requerido').max(100),
  anios_experiencia: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  biografia: z.string().optional(),
})

type FormValues = z.infer<typeof teacherSchema>

// ─── Formulario reutilizable ──────────────────────────────────────────────────

function TeacherForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
  onCancel: () => void
}) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(teacherSchema) as any,
    defaultValues,
  })

  const { data: users, isLoading: isLoadingUsers } = useUsers()
  
  const userOptions = useMemo(() => {
    return users?.map(u => ({
      value: String(u.id),
      label: u.fullName
    })) || []
  }, [users])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="usuarioId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Usuario</FieldLabel>
                <Combobox
                  options={userOptions}
                  value={field.value}
                  onChange={(val) => field.onChange(val ? String(val) : '')}
                  placeholder={isLoadingUsers ? "Cargando..." : "Seleccionar usuario..."}
                  searchPlaceholder="Buscar usuario..."
                  emptyText="No se encontraron usuarios"
                  disabled={isLoadingUsers}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="anios_experiencia"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Años de Experiencia</FieldLabel>
                <Input type="number" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="especialidad"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Especialidad</FieldLabel>
              <Input {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="biografia"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Biografía</FieldLabel>
              <Input {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

// ─── Modal para Crear ─────────────────────────────────────────────────────────

function CreateTeacherDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void }) {
  const { mutate, isPending } = useCreateTeacher()

  const handleSubmit = (values: FormValues) => {
    mutate(values as any, {
      onSuccess: () => {
        toast.success('Docente creado exitosamente')
        onOpenChange(false)
        onSuccess?.()
      },
      onError: err => toast.error(getApiErrorMessage(err, 'Error al crear')),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Docente</DialogTitle>
          <DialogDescription>
            Completa la información del docente.
          </DialogDescription>
        </DialogHeader>
        <TeacherForm
          defaultValues={{ usuarioId: '', especialidad: '', anios_experiencia: 0, biografia: '' }}
          onSubmit={handleSubmit}
          isPending={isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal para Editar ────────────────────────────────────────────────────────

function EditTeacherDialog({ teacher, open, onOpenChange, onSuccess }: { teacher: Teacher; open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void }) {
  const { mutate, isPending } = useUpdateTeacher()

  const handleSubmit = (values: FormValues) => {
    mutate(
      { id: teacher.id, data: values as any },
      {
        onSuccess: () => {
          toast.success('Docente actualizado exitosamente')
          onOpenChange(false)
          onSuccess?.()
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Docente</DialogTitle>
          <DialogDescription>Modifica los datos del docente.</DialogDescription>
        </DialogHeader>
        <TeacherForm
          defaultValues={{
            usuarioId: teacher.usuarioId,
            especialidad: teacher.especialidad,
            anios_experiencia: teacher.anios_experiencia,
            biografia: teacher.biografia ?? '',
          }}
          onSubmit={handleSubmit}
          isPending={isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export function TeachersPage() {
  const { data: teachers, isLoading, isError, error, refetch } = useTeachers()
  const { data: users } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para diálogos
  const [createOpen, setCreateOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)

  const filtered = useMemo(() => {
    if (!teachers) return []
    if (!searchTerm) return teachers
    const term = searchTerm.toLowerCase()
    return teachers.filter(
      t => t.especialidad.toLowerCase().includes(term) || 
           t.usuarioId.toString().includes(term) ||
           (t.biografia?.toLowerCase().includes(term))
    )
  }, [teachers, searchTerm])

  // Estadísticas
  const totalTeachers = teachers?.length ?? 0
  const totalExperience = teachers?.reduce((acc, t) => acc + (t.anios_experiencia || 0), 0) ?? 0
  const avgExperience = totalTeachers > 0 ? Math.round(totalExperience / totalTeachers) : 0
  const uniqueSpecialties = useMemo(() => {
    const specialties = new Set(teachers?.map(t => t.especialidad))
    return specialties.size
  }, [teachers])

  const handleRefresh = () => {
    refetch()
  }

  // Obtener nombre del usuario por ID
  const getUserName = (usuarioId: string) => {
    const user = users?.find(u => String(u.id) === String(usuarioId))
    return user?.fullName || `ID: ${usuarioId}`
  }

  return (
    <div className="space-y-6">

      {/* Header - Mismo estilo que las otras páginas */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Administración</p>
            <h1 className="text-2xl font-bold">Docentes</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de docentes, especialidades y asignación a cursos.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por especialidad, nombre o biografía..."
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nuevo Docente
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total docentes</p>
          <div className="mt-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalTeachers}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Especialidades</p>
          <div className="mt-2 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{uniqueSpecialties}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Experiencia total</p>
          <div className="mt-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalExperience} años</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Promedio experiencia</p>
          <div className="mt-2 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{avgExperience} años</p>
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <CreateTeacherDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={handleRefresh}
      />
      
      <EditTeacherDialog 
        teacher={editTeacher!} 
        open={!!editTeacher} 
        onOpenChange={(open) => !open && setEditTeacher(null)}
        onSuccess={handleRefresh}
      />

      {/* Tabla mejorada */}
      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="text-lg">Docentes registrados</CardTitle>
          <CardDescription>
            {filtered.length} resultado(s) sobre {totalTeachers} docentes con {uniqueSpecialties} especialidades diferentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6">
              <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error al cargar registros</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  {getApiErrorMessage(error, 'Error al cargar')}
                  <Button variant="link" onClick={() => refetch()} className="px-2">
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-48">Docente</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Experiencia</TableHead>
                    <TableHead className="min-w-48">Biografía</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No se encontraron docentes para el criterio de búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(teacher => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {getUserName(teacher.usuarioId)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {teacher.usuarioId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                            {teacher.especialidad}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-slate-700 dark:text-slate-300">
                              {teacher.anios_experiencia} {teacher.anios_experiencia === 1 ? 'año' : 'años'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">
                          {teacher.biografia?.trim() ? (
                            <p className="line-clamp-2">{teacher.biografia}</p>
                          ) : (
                            <span className="text-muted-foreground italic">Sin biografía</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditTeacher(teacher)}
                              title="Editar docente"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}