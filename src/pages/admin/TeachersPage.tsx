import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, ServerCrash, Search } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useTeachers, useCreateTeacher, useUpdateTeacher } from '@/hooks/useTeachers'
import { useUsers } from '@/hooks/useUsers'
import type { Teacher } from '@/types/teacher'

import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
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
  usuario_id: z.coerce.number().min(1, 'Requerido'),
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
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
}) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(teacherSchema) as any,
    defaultValues,
  })

  const { data: users, isLoading: isLoadingUsers } = useUsers()
  
  const userOptions = useMemo(() => {
    return users?.map(u => ({
      value: Number(u.id),
      label: u.fullName
    })) || []
  }, [users])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="usuario_id"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Usuario</FieldLabel>
              <Combobox
                options={userOptions}
                value={field.value}
                onChange={(val) => field.onChange(val ? Number(val) : 0)}
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

// ─── Modal para Crear ─────────────────────────────────────────────────────────

function CreateTeacherDialog() {
  const { mutate, isPending } = useCreateTeacher()
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: FormValues) => {
    mutate(values as any, {
      onSuccess: () => {
        toast.success('Docente creado exitosamente')
        setOpen(false)
      },
      onError: err => toast.error(getApiErrorMessage(err, 'Error al crear')),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Docente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Docente</DialogTitle>
          <DialogDescription>
            Ingresa la información básica del docente.
          </DialogDescription>
        </DialogHeader>
        <TeacherForm
          defaultValues={{ usuario_id: 0, especialidad: '', anios_experiencia: 0, biografia: '' }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal para Editar ────────────────────────────────────────────────────────

function EditTeacherDialog({ teacher }: { teacher: Teacher }) {
  const { mutate, isPending } = useUpdateTeacher()
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: FormValues) => {
    mutate(
      { id: teacher.id, data: values as any },
      {
        onSuccess: () => {
          toast.success('Docente actualizado exitosamente')
          setOpen(false)
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Docente</DialogTitle>
          <DialogDescription>Modifica los datos del docente.</DialogDescription>
        </DialogHeader>
        <TeacherForm
          defaultValues={{
            usuario_id: teacher.usuario_id,
            especialidad: teacher.especialidad,
            anios_experiencia: teacher.anios_experiencia,
            biografia: teacher.biografia ?? '',
          }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export function TeachersPage() {
  const { data: teachers, isLoading, isError, error, refetch } = useTeachers()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    if (!teachers) return []
    if (!searchTerm) return teachers
    const term = searchTerm.toLowerCase()
    return teachers.filter(
      t => t.especialidad.toLowerCase().includes(term) || t.usuario_id.toString().includes(term)
    )
  }, [teachers, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Docentes</h2>
          <p className="text-muted-foreground">Administra los docentes de los cursos.</p>
        </div>
        <CreateTeacherDialog />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-xl">Listado</CardTitle>
            <CardDescription>Visualiza los docentes registrados.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar docente o ID..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isError ? (
            <Alert variant="destructive" className="mb-4">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error al cargar registros</AlertTitle>
              <AlertDescription>
                {getApiErrorMessage(error, 'Error al cargar')}
                <Button variant="link" onClick={() => refetch()} className="px-2">
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID Usuario</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Años Exp.</TableHead>
                    <TableHead>Biografía</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron docentes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(teacher => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium text-center">{teacher.usuario_id}</TableCell>
                        <TableCell>{teacher.especialidad}</TableCell>
                        <TableCell>{teacher.anios_experiencia}</TableCell>
                        <TableCell className="max-w-72 truncate">{teacher.biografia || '-'}</TableCell>
                        <TableCell className="text-right">
                          <EditTeacherDialog teacher={teacher} />
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