import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserCog, PlusCircle, Pencil, KeyRound, ShieldOff, ShieldCheck,
  ServerCrash, Search, Copy, Check,
} from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'
import { useUsers, useCreateUser, useUpdateUser, useResetPassword, useUpdateUserStatus } from '@/hooks/useUsers'
import { usePersons } from '@/hooks/usePersons'
import type { UserDto, UserRole } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Combobox } from '@/components/ui/combobox'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogMedia, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

// ─── Constantes ──────────────────────────────────────────────────────────────

const ROLES: UserRole[] = ['Admin', 'Docente', 'Estudiante']

const roleBadgeVariant: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  Admin: 'default',
  Docente: 'secondary',
  Estudiante: 'outline',
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  personId: z.number({ message: 'Selecciona una persona' }).positive('Selecciona una persona'),
  email: z.string().min(1, 'Requerido').email('Email inválido').max(256),
  role: z.enum(['Admin', 'Docente', 'Estudiante'] as const),
})

const updateUserSchema = z.object({
  email: z.string().email('Email inválido').max(256).optional().or(z.literal('')),
  role: z.enum(['Admin', 'Docente', 'Estudiante'] as const).optional(),
})

type CreateUserValues = z.infer<typeof createUserSchema>
type UpdateUserValues = z.infer<typeof updateUserSchema>

// ─── Componente: contraseña temporal copiable ─────────────────────────────────

function TempPasswordDisplay({ password }: { password: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
      <span className="flex-1 select-all">{password}</span>
      <button
        type="button"
        onClick={copy}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Copiar contraseña"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ─── Dialog: crear usuario ────────────────────────────────────────────────────

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { data: persons, isLoading: loadingPersons } = usePersons()
  const { mutate: createUser, isPending } = useCreateUser()
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  const { control, handleSubmit, reset } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', role: 'Estudiante' } as any,
  })

  const personOptions = useMemo(
    () =>
      (persons ?? []).map(p => ({
        value: p.id,
        label: `${p.firstName} ${p.lastName} ${p.motherLastName}`,
      })),
    [persons],
  )

  const handleClose = () => {
    reset({ email: '', role: 'Estudiante' } as any)
    setTempPassword(null)
    onOpenChange(false)
  }

  const onSubmit = (values: CreateUserValues) => {
    const selectedPerson = persons?.find(p => p.id === values.personId)
    const payload = {
      ...values,
      firstName: selectedPerson?.firstName || '',
      lastName: `${selectedPerson?.lastName || ''} ${selectedPerson?.motherLastName || ''}`.trim(),
    }

    createUser(payload, {
      onSuccess: (res) => {
        toast.success('Usuario registrado exitosamente')
        setTempPassword(res.data.temporaryPassword)
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo registrar el usuario')),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Asocia una persona al sistema con un rol y email.
          </DialogDescription>
        </DialogHeader>

        {tempPassword ? (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Usuario creado</AlertTitle>
              <AlertDescription>
                Comunica esta contraseña temporal al usuario. Deberá cambiarla en su primer inicio de sesión.
              </AlertDescription>
            </Alert>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Contraseña temporal</p>
              <TempPasswordDisplay password={tempPassword} />
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Controller
                name="personId"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Persona</FieldLabel>
                    <Combobox
                      options={personOptions}
                      value={field.value ?? null}
                      onChange={(val) => field.onChange(val as number | null)}
                      placeholder="Seleccionar persona..."
                      searchPlaceholder="Buscar por nombre..."
                      disabled={loadingPersons}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" placeholder="usuario@upds.edu.bo" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="role"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Rol</FieldLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creando...' : 'Crear usuario'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog: editar usuario ───────────────────────────────────────────────────

function EditUserDialog({
  user,
  onClose,
}: {
  user: UserDto | null
  onClose: () => void
}) {
  const { mutate: updateUser, isPending } = useUpdateUser()

  const { control, handleSubmit, reset } = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    values: user ? { email: user.email, role: user.role } as any : {},
  })

  const onSubmit = (values: UpdateUserValues) => {
    if (!user) return
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== '' && v !== undefined),
    ) as UpdateUserValues

    updateUser(
      { id: user.id, data: payload },
      {
        onSuccess: () => {
          toast.success('Datos actualizados correctamente')
          reset()
          onClose()
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar el usuario')),
      },
    )
  }

  return (
    <Dialog open={!!user} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Actualiza el email o rol. Los campos vacíos no se modifican.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                  <Input id="edit-email" type="email" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Rol</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── AlertDialog: resetear contraseña ────────────────────────────────────────

function ResetPasswordDialog({
  user,
  onClose,
}: {
  user: UserDto | null
  onClose: () => void
}) {
  const { mutate: resetPassword, isPending } = useResetPassword()
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  const handleConfirm = () => {
    if (!user) return
    resetPassword(user.id, {
      onSuccess: (res) => setTempPassword(res.data.temporaryPassword),
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo resetear la contraseña')),
    })
  }

  const handleClose = () => {
    setTempPassword(null)
    onClose()
  }

  if (tempPassword) {
    return (
      <Dialog open onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Contraseña restablecida</DialogTitle>
            <DialogDescription>
              Comunica esta contraseña temporal al usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nueva contraseña temporal</p>
            <TempPasswordDisplay password={tempPassword} />
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <AlertDialog open={!!user} onOpenChange={(v) => { if (!v) handleClose() }}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <KeyRound />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Resetear contraseña?</AlertDialogTitle>
          <AlertDialogDescription>
            Se generará una nueva contraseña temporal para <strong>{user?.fullName}</strong>. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Procesando...' : 'Resetear'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── AlertDialog: cambiar estado ──────────────────────────────────────────────

function ToggleStatusDialog({
  user,
  onClose,
}: {
  user: UserDto | null
  onClose: () => void
}) {
  const { mutate: updateStatus, isPending } = useUpdateUserStatus()
  const isDisabling = user?.isActive ?? false

  const handleConfirm = () => {
    if (!user) return
    updateStatus(
      { id: user.id, data: { IsActive: !user.isActive } },
      {
        onSuccess: (res) => {
          toast.success(res.message)
          onClose()
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo cambiar el estado')),
      },
    )
  }

  return (
    <AlertDialog open={!!user} onOpenChange={(v) => { if (!v) onClose() }}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            {isDisabling ? <ShieldOff /> : <ShieldCheck />}
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isDisabling ? '¿Deshabilitar cuenta?' : '¿Habilitar cuenta?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDisabling
              ? `La cuenta de ${user?.fullName} quedará bloqueada y no podrá iniciar sesión.`
              : `La cuenta de ${user?.fullName} será reactivada.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant={isDisabling ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Procesando...' : isDisabling ? 'Deshabilitar' : 'Habilitar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserDto | null>(null)
  const [resetUser, setResetUser] = useState<UserDto | null>(null)
  const [toggleUser, setToggleUser] = useState<UserDto | null>(null)

  const { data: users, isLoading, error } = useUsers()

  const filteredUsers = useMemo(() => {
    if (!users) return []
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
    )
  }, [users, search])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCog className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} {search ? 'resultado(s)' : 'usuarios registrados'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Listado de usuarios</CardTitle>
          <CardDescription>Gestiona las cuentas de acceso al sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <ServerCrash />
              <AlertTitle>Error al cargar usuarios</AlertTitle>
              <AlertDescription>
                No se pudo obtener la lista. Verifica la conexión con el servidor.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      {search ? 'Sin resultados para la búsqueda.' : 'No hay usuarios registrados.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant[user.role]}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'outline'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar email/rol"
                            onClick={() => setEditUser(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Resetear contraseña"
                            onClick={() => setResetUser(user)}
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={user.isActive ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
                            onClick={() => setToggleUser(user)}
                          >
                            {user.isActive
                              ? <ShieldOff className="w-4 h-4" />
                              : <ShieldCheck className="w-4 h-4" />}
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

      {/* Dialogs */}
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog user={editUser} onClose={() => setEditUser(null)} />
      <ResetPasswordDialog user={resetUser} onClose={() => setResetUser(null)} />
      <ToggleStatusDialog user={toggleUser} onClose={() => setToggleUser(null)} />
    </div>
  )
}
