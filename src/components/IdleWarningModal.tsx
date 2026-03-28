import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface Props {
  open:        boolean
  secondsLeft: number
  onContinue:  () => void
  onLogoutNow: () => void
}

export function IdleWarningModal({ open, secondsLeft, onContinue, onLogoutNow }: Props) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Sigues ahí?</AlertDialogTitle>
          <AlertDialogDescription>
            Por inactividad, tu sesión se bloqueará en{' '}
            <span className="font-semibold text-destructive">{secondsLeft}s</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onLogoutNow}>Cerrar sesión</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>Seguir conectado</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
