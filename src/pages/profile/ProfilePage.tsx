import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserCircle, ServerCrash } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { DEPARTAMENTOS } from '@/types/person'
import type { Gender, ProfileDto } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Validación ───────────────────────────────────────────────────────────────

const profileSchema = z.object({
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

type FormValues = z.infer<typeof profileSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleLabel: Record<string, string> = {
  Admin: 'Administrador',
  Docente: 'Docente',
  Estudiante: 'Estudiante',
}

const roleVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  Admin: 'default',
  Docente: 'secondary',
  Estudiante: 'outline',
}

// ─── Formulario (se monta solo cuando profile ya está disponible) ──────────────

function ProfileForm({
  profile,
  onSubmit,
  isPending,
}: {
  profile: ProfileDto
  onSubmit: (values: FormValues) => void
  isPending: boolean
}) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      motherLastName: profile.motherLastName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      nationalId: profile.nationalId,
      nationalIdExpedition: profile.nationalIdExpedition as typeof DEPARTAMENTOS[number],
      phoneNumber: profile.phoneNumber ?? '',
      address: profile.address ?? '',
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
                defaultValue={String(field.value)}
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
              <FieldLabel htmlFor="phoneNumber">
                Teléfono <span className="text-muted-foreground">(opcional)</span>
              </FieldLabel>
              <Input id="phoneNumber" placeholder="70000000" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )} />
        </div>

        <Controller name="address" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="address">
              Dirección <span className="text-muted-foreground">(opcional)</span>
            </FieldLabel>
            <Input id="address" placeholder="Av. ejemplo #123" {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
      </FieldGroup>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const handleSubmit = (values: FormValues) => {
    updateProfile(values, {
      onSuccess: () => toast.success('Perfil actualizado correctamente'),
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar el perfil')),
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <UserCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Consulta y actualiza tus datos personales
          </p>
        </div>
      </div>

      {/* Info de cuenta (solo lectura) */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 flex gap-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ) : profile && (
        <Card>
          <CardContent className="pt-6 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Correo</p>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Rol</p>
              <Badge variant={roleVariant[profile.role] ?? 'outline'}>
                {roleLabel[profile.role] ?? profile.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario de datos personales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos personales</CardTitle>
          <CardDescription>Modifica los campos que deseas actualizar.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <ServerCrash />
              <AlertTitle>Error al cargar el perfil</AlertTitle>
              <AlertDescription>
                No se pudo obtener la información. Verifica la conexión con el servidor.
              </AlertDescription>
            </Alert>
          ) : isLoading || !profile ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <ProfileForm
              profile={profile}
              onSubmit={handleSubmit}
              isPending={isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
