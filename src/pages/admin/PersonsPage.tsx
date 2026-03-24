import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, Trash2, Users } from 'lucide-react'

import { usePersons, useCreatePerson } from '@/hooks/usePersons'
import type { Gender } from '@/types/person'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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

const formSchema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  motherLastName: z.string().min(1, 'Requerido'),
  dateOfBirth: z.string().min(1, 'Requerido'),
  gender: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  nationalId: z.string().min(1, 'Requerido'),
  nationalIdExpedition: z.string().min(1, 'Requerido'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

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

// ─── Componente ──────────────────────────────────────────────────────────────

export function PersonsPage() {
  const [open, setOpen] = useState(false)

  const { data: persons, isLoading, error } = usePersons()
  const { mutate: createPerson, isPending } = useCreatePerson()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '', lastName: '', motherLastName: '',
      dateOfBirth: '', nationalId: '', nationalIdExpedition: '',
      phoneNumber: '', address: '',
    },
  })

  const onSubmit = (values: FormValues) => {
    createPerson(values, {
      onSuccess: () => {
        reset()
        setOpen(false)
      },
    })
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
              {persons?.length ?? 0} registros en total
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
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
                      <FieldLabel htmlFor="nationalIdExpedition">Expedición</FieldLabel>
                      <Input id="nationalIdExpedition" placeholder="LP" {...field} />
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
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Listado de personas</CardTitle>
          <CardDescription>Gestiona los registros de personas del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center py-10 text-destructive text-sm">
              Error al cargar los datos. Verifica la conexión con el servidor.
            </div>
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
                ) : persons?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No hay personas registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  persons?.map(person => (
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
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" disabled title="Editar">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled title="Eliminar"
                            className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
