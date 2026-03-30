import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, GraduationCap, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api.error'

import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from '@/hooks/useTeachers'
import { useUsers } from '@/hooks/useUsers'
import type { TeacherDto } from '@/types/teacher'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'

const teacherSchema = z.object({
  userId: z.string().min(1, 'Requerido'),
  specialty: z.string().min(1, 'Requerido').max(100),
  biography: z.string().min(1, 'Requerido').max(1000),
})
type FormValues = z.infer<typeof teacherSchema>

function TeacherForm({ defaultValues, onSubmit, isPending, onCancel }: { defaultValues: Partial<FormValues>, onSubmit: (v: FormValues) => void, isPending: boolean, onCancel: () => void }) {
  const { data: users, isLoading: loadingUsers } = useUsers()
  
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { userId: '', specialty: '', biography: '', ...defaultValues },
  })

  // Filtramos solo usuarios que sean "Docente" (o dejamos todos si no es estricto, pero usaremos el rol para dar mejor contexto si es posible, o todos)
  const userOptions = useMemo(
    () =>
      (users ?? []).map(u => ({
        value: u.id,
        label: `${u.fullName} (${u.email}) - ${u.role}`,
      })),
    [users],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller name="userId" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Usuario Asociado</FieldLabel>
            <Combobox
              options={userOptions}
              value={field.value || null}
              onChange={(val) => field.onChange(val as string)}
              placeholder="Seleccionar usuario..."
              searchPlaceholder="Buscar por nombre o email..."
              disabled={loadingUsers}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller name="specialty" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="specialty">Especialidad</FieldLabel>
            <Input id="specialty" placeholder="Ej. Ingeniería de Software" {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller name="biography" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="biography">Biografía</FieldLabel>
            <Textarea id="biography" placeholder="Breve descripción del docente..." className="resize-none" {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</Button>
      </DialogFooter>
    </form>
  )
}

export function TeachersPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState<TeacherDto | null>(null)
  const [search, setSearch] = useState('')

  const { data: teachers, isLoading, error } = useTeachers()

  const filteredTeachers = useMemo(() => {
    if (!teachers) return []
    const q = search.trim().toLowerCase()
    if (!q) return teachers
    return teachers.filter(t => t.specialty.toLowerCase().includes(q) || t.userId.toLowerCase().includes(q))
  }, [teachers, search])

  const { mutate: createTeacher, isPending: isCreating } = useCreateTeacher()
  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateTeacher()
  const { mutate: deleteTeacher } = useDeleteTeacher()

  const handleCreate = (values: FormValues) => {
    createTeacher(values, {
      onSuccess: () => { setCreateOpen(false); toast.success('Docente registrado exitosamente') },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo registrar')),
    })
  }

  const handleUpdate = (values: FormValues) => {
    if (!editTeacher) return
    updateTeacher({ id: editTeacher.id, data: { ...values, id: editTeacher.id } }, {
      onSuccess: () => { setEditTeacher(null); toast.success('Docente actualizado correctamente') },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar')),
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este docente?')) return
    deleteTeacher(id, {
      onSuccess: () => toast.success('Docente eliminado correctamente'),
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar')),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><GraduationCap className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Docentes</h1>
            <p className="text-sm text-muted-foreground">{filteredTeachers.length} {search ? 'resultado(s)' : 'registros'}</p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Nuevo Docente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Docente</DialogTitle></DialogHeader>
            <TeacherForm defaultValues={{}} onSubmit={handleCreate} isPending={isCreating} onCancel={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editTeacher} onOpenChange={(open) => !open && setEditTeacher(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Docente</DialogTitle></DialogHeader>
          {editTeacher && <TeacherForm defaultValues={{ userId: editTeacher.userId, specialty: editTeacher.specialty, biography: editTeacher.biography }} onSubmit={handleUpdate} isPending={isUpdating} onCancel={() => setEditTeacher(null)} />}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Listado</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar docente..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>ID Usuario</TableHead><TableHead>Especialidad</TableHead><TableHead className="w-[100px] text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell><Skeleton className="h-5 w-32" /></TableCell><TableCell><Skeleton className="h-5 w-32" /></TableCell><TableCell><Skeleton className="h-8 w-16 float-right" /></TableCell></TableRow>)
              : error ? <TableRow><TableCell colSpan={3} className="text-center text-red-500 py-6">Error al cargar datos.</TableCell></TableRow>
              : filteredTeachers.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Cero resultados.</TableCell></TableRow>
              : filteredTeachers.map(teacher => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.userId}</TableCell>
                  <TableCell>{teacher.specialty}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditTeacher(teacher)}><Pencil className="w-4 h-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}