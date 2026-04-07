import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onClose: () => void
  lessonId: number
  onSelect: (type: 'document' | 'image' | 'video' | 'homework') => void
}

export function AddContentModal({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar contenido</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={() => { onSelect('document'); onClose() }}>
            📄 Documento
          </Button>

          <Button onClick={() => { onSelect('image'); onClose() }}>
            🖼️ Imagen
          </Button>

          <Button onClick={() => { onSelect('video'); onClose() }}>
            🎬 Video
          </Button>

          <Button onClick={() => { onSelect('homework'); onClose() }}>
            📝 Tarea
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}