import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  open:       boolean
  onUnlocked: () => void
  onLogout:   () => void
}

export function SessionLockModal({ open, onUnlocked, onLogout }: Props) {
  const { profile, setAuth, logout } = useAuthStore()
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.email) return
    setLoading(true)
    setError('')
    try {
      const data = await authService.login({ Email: profile.email, Password: password })
      setAuth(data)
      setPassword('')
      onUnlocked()
    } catch {
      setError('Contraseña incorrecta. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    setPassword('')
    setError('')
    logout()
    onLogout()
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm [&>button:last-of-type]:hidden" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Sesión bloqueada</DialogTitle>
          <DialogDescription>
            Tu sesión se bloqueó por inactividad. Ingresa tu contraseña para continuar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUnlock} className="space-y-4">
          <Input
            value={profile?.email ?? ''}
            disabled
            className="text-muted-foreground"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={handleLogout}>
              Cerrar sesión
            </Button>
            <Button type="submit" disabled={loading || !password}>
              {loading ? 'Verificando...' : 'Desbloquear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
