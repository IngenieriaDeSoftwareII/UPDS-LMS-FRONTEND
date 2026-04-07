import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, KeyRound, Sun, Moon, Monitor, Eye, EyeOff, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { getApiErrorMessage } from '@/lib/api.error'
import { useChangePassword } from '@/hooks/useChangePassword'
import { useTheme } from '@/components/theme-provider'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Validación ───────────────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    CurrentPassword: z.string().min(1, 'Requerido'),
    NewPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
    ConfirmNewPassword: z.string().min(1, 'Requerido'),
  })
  .refine(data => data.NewPassword === data.ConfirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['ConfirmNewPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

// ─── Requisitos de contraseña ─────────────────────────────────────────────────

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Una letra mayúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Una letra minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Un número', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Un carácter especial', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

function PasswordRequirements({ value }: { value: string }) {
  if (!value) return null
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
      {passwordRules.map(({ label, test }) => {
        const met = test(value)
        return (
          <li key={label} className={cn('flex items-center gap-1.5 text-xs', met ? 'text-green-600' : 'text-muted-foreground')}>
            <Check className={cn('w-3 h-3 shrink-0', met ? 'opacity-100' : 'opacity-0')} />
            {label}
          </li>
        )
      })}
    </ul>
  )
}

// ─── Toggle de visibilidad ────────────────────────────────────────────────────

function PasswordInput({ id, autoComplete, field }: {
  id: string
  autoComplete: string
  field: React.InputHTMLAttributes<HTMLInputElement>
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input id={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} className="pr-10" {...field} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ─── Sección: Cambiar contraseña ──────────────────────────────────────────────

function ChangePasswordSection() {
  const { mutate: changePassword, isPending } = useChangePassword()

  const { control, handleSubmit, reset } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      CurrentPassword: '',
      NewPassword: '',
      ConfirmNewPassword: '',
    },
  })

  const newPassword = useWatch({ control, name: 'NewPassword' })

  const onSubmit = (values: ChangePasswordForm) => {
    changePassword(values, {
      onSuccess: () => {
        toast.success('Contraseña actualizada exitosamente')
        reset()
      },
      onError: (err) =>
        toast.error(getApiErrorMessage(err, 'No se pudo actualizar la contraseña')),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Cambiar contraseña</CardTitle>
        </div>
        <CardDescription>
          Ingresa tu contraseña actual y elige una nueva segura.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="CurrentPassword"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="CurrentPassword">Contraseña actual</FieldLabel>
                  <PasswordInput id="CurrentPassword" autoComplete="current-password" field={field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="NewPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="NewPassword">Nueva contraseña</FieldLabel>
                    <PasswordInput id="NewPassword" autoComplete="new-password" field={field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="ConfirmNewPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ConfirmNewPassword">Confirmar contraseña</FieldLabel>
                    <PasswordInput id="ConfirmNewPassword" autoComplete="new-password" field={field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <PasswordRequirements value={newPassword} />
          </FieldGroup>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Actualizar contraseña'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Sección: Apariencia ──────────────────────────────────────────────────────

const themeOptions = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const

function AppearanceSection() {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Apariencia</CardTitle>
        </div>
        <CardDescription>
          Selecciona el tema visual de la aplicación.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="flex justify-center gap-3">
          {themeOptions.map(({ value, label, icon: Icon }) => {
            const active = theme === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 w-28 transition-colors cursor-pointer',
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40'
                )}
              >
                {active && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </span>
                )}
                <Icon className={cn('w-5 h-5', active ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('text-sm font-medium', active ? 'text-primary' : 'text-muted-foreground')}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu cuenta y preferencias de la aplicación
          </p>
        </div>
      </div>

      <ChangePasswordSection />
      <AppearanceSection />
    </div>
  )
}
