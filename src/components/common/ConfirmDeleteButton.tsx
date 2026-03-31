import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Props {
  onConfirm: () => void
}

export function ConfirmDeleteButton({ onConfirm }: Props) {
  const handleClick = () => {
    if (confirm('¿Seguro que deseas eliminar?')) {
      onConfirm()
    }
  }

  return (
    <Button variant="destructive" onClick={handleClick}>
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}