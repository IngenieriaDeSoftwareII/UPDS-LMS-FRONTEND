import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, Users, ServerCrash, Search } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { usePersons, useCreatePerson, useUpdatePerson } from '@/hooks/usePersons'
import type { Gender, PersonDto } from '@/types/person'
import { DEPARTAMENTOS } from '@/types/person'

import { Button } from '@/components/ui/button'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Validación ──────────────────────────────────────────────────────────────

const personSchema = z.object({
  firstName: z.string().min(1, 'Requerido').max(100),
  lastName: z.string().min(1, 'Requerido').max(100),
  motherLastName: z.string().min(1, 'Requerido').max(100),
  dateOfBirth: z.string().min(1, 'Requerido').refine(val => {
    const birth = new Date(val)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (birth >= today) return false
    const age = today.getFullYear() - birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
    return age >= 16
  }, 'Debe tener al menos 16 años y ser una fecha pasada'),
  gender: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  nationalId: z.string().min(1, 'Requerido').max(20),
  nationalIdExpedition: z.enum(DEPARTAMENTOS, { message: 'Selecciona un departamento' }),
  phoneNumber: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
})

type FormValues = z.infer<typeof personSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

const genderLabel: Record<Gender, string> = {
  0: 'Masculino',
  1: 'Femenino',
  2: 'Otro',
}

const genderVariant: Record<Gender, 'default' | 'secondary' | 'outline'> = {
  0: 'default',
  1: 'secondary',
  2: 'outline',
}

// ─── Formulario reutilizable ──────────────────────────────────────────────────

function PersonForm({
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
    resolver: zodResolver(personSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      motherLastName: '',
      dateOfBirth: '',
      nationalId: '',
      phoneNumber: '',
      address: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Controller name="firstName" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
              <Input id="firstName" placeholder="Juan" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
          <Controller name="lastName" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="lastName">Primer apellido</FieldLabel>
              <Input id="lastName" placeholder="Pérez" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
          <Controller name="motherLastName" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="motherLastName">Segundo apellido</FieldLabel>
              <Input id="motherLastName" placeholder="López" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Controller name="nationalId" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="nationalId">Carnet de identidad</FieldLabel>
              <Input id="nationalId" placeholder="1234567" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
          <Controller name="nationalIdExpedition" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Expedición</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTOS.map(dep => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
          <Controller name="gender" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Género</FieldLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val) as Gender)}
                defaultValue={field.value !== undefined ? String(field.value) : undefined}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Masculino</SelectItem>
                  <SelectItem value="1">Femenino</SelectItem>
                  <SelectItem value="2">Otro</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller name="dateOfBirth" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="dateOfBirth">Fecha de nacimiento</FieldLabel>
              <Input id="dateOfBirth" type="date" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
          <Controller name="phoneNumber" control={control} render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phoneNumber">Teléfono <span className="text-muted-foreground">(opcional)</span></FieldLabel>
              <Input id="phoneNumber" placeholder="70000000" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
        </div>

        <Controller name="address" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="address">Dirección <span className="text-muted-foreground">(opcional)</span></FieldLabel>
            <Input id="address" placeholder="Av. ejemplo #123" {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PersonsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editPerson, setEditPerson] = useState<PersonDto | null>(null)
  const [search, setSearch] = useState('')

  const { data: persons, isLoading, error } = usePersons()

  const filteredPersons = useMemo(() => {
    if (!persons) return []
    const q = search.trim().toLowerCase()
    if (!q) return persons
    return persons.filter(p =>
      `${p.firstName} ${p.lastName} ${p.motherLastName}`.toLowerCase().includes(q) ||
      p.nationalId.toLowerCase().includes(q)
    )
  }, [persons, search])
  const { mutate: createPerson, isPending: isCreating } = useCreatePerson()
  const { mutate: updatePerson, isPending: isUpdating } = useUpdatePerson()

  const handleCreate = (values: FormValues) => {
    createPerson(values, {
      onSuccess: () => {
        setCreateOpen(false)
        toast.success('Persona registrada exitosamente')
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo registrar la persona')),
    })
  }

  const handleUpdate = (values: FormValues) => {
    if (!editPerson) return
    updatePerson(
      { id: editPerson.id, data: values },
      {
        onSuccess: () => {
          setEditPerson(null)
          toast.success('Datos actualizados correctamente')
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar la persona')),
      },
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Personas</h1>
            <p className="text-sm text-muted-foreground">
              {filteredPersons.length} {search ? 'resultado(s)' : 'registros en total'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o CI..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 w-56"
            />
          </div>

          {/* Dialog — Crear */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nueva Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Persona</DialogTitle>
              <DialogDescription>
                Completa los datos para registrar una nueva persona.
              </DialogDescription>
            </DialogHeader>
            <PersonForm
              defaultValues={{}}
              onSubmit={handleCreate}
              isPending={isCreating}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dialog — Editar */}
      <Dialog open={!!editPerson} onOpenChange={(open) => { if (!open) setEditPerson(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Persona</DialogTitle>
            <DialogDescription>
              Modifica los campos que deseas actualizar.
            </DialogDescription>
          </DialogHeader>
          {editPerson && (
            <PersonForm
              defaultValues={{
                firstName: editPerson.firstName,
                lastName: editPerson.lastName,
                motherLastName: editPerson.motherLastName,
                dateOfBirth: editPerson.dateOfBirth,
                gender: editPerson.gender,
                nationalId: editPerson.nationalId,
                nationalIdExpedition: editPerson.nationalIdExpedition as typeof DEPARTAMENTOS[number],
                phoneNumber: editPerson.phoneNumber ?? '',
                address: editPerson.address ?? '',
              }}
              onSubmit={handleUpdate}
              isPending={isUpdating}
              onCancel={() => setEditPerson(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Listado de personas</CardTitle>
          <CardDescription>Gestiona los registros de personas del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <ServerCrash />
              <AlertTitle>Error al cargar personas</AlertTitle>
              <AlertDescription>
                No se pudo obtener la lista. Verifica la conexión con el servidor.
              </AlertDescription>
            </Alert>
          ) : (
            <Table border={20}>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Carnet</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredPersons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      {search ? 'Sin resultados para la búsqueda.' : 'No hay personas registradas.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPersons.map(person => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">
                        {person.firstName} {person.lastName} {person.motherLastName}
                      </TableCell>
                      <TableCell>
                        {person.nationalId}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {person.nationalIdExpedition}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={genderVariant[person.gender]}>
                          {genderLabel[person.gender]}
                        </Badge>
                      </TableCell>
                      <TableCell>{person.phoneNumber ?? '—'}</TableCell>
                      <TableCell className="max-w-[160px] truncate">
                        {person.address ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => setEditPerson(person)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
