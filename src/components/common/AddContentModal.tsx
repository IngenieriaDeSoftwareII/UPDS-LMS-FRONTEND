import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onClose: () => void
  lessonId: number
  onSelect: (type: 'document' | 'homework') => void
}

export function AddContentModal({ open, onClose, lessonId, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar contenido</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={() => onSelect('document')}>
            📄 Documento
          </Button>

          <Button onClick={() => onSelect('homework')}>
            📘 Tarea
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}