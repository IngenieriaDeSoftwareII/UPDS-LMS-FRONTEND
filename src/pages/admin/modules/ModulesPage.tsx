import { useState } from 'react'
import { PlusCircle, Pencil } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'

import {
  useModules,
  useCreateModule,
  useDeleteModule,
  useUpdateModule,
} from '@/hooks/useModules'

// ✅ cursos reales desde backend nuevo
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export default function ModulesPage() {
  const { data, isLoading } = useModules()
  const { data: courses = [], isLoading: loading } = useCoursesPrueba()

  const createModule = useCreateModule()
  const updateModule = useUpdateModule()
  const deleteModule = useDeleteModule()

  const [open, setOpen] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [orden, setOrden] = useState<number>(1)
  const [cursoId, setCursoId] = useState<number | ''>('')

  const [editingModule, setEditingModule] = useState<any | null>(null)
  const isEditing = !!editingModule

  // abrir modal crear
  const handleOpen = () => {
    setEditingModule(null)
    setTitulo('')
    setOrden(1)
    setCursoId('')
    setOpen(true)
  }

  // editar
  const handleEdit = (module: any) => {
    setEditingModule(module)
    setTitulo(module.titulo)
    setOrden(module.orden || 1)
    setCursoId(module.cursoId)
    setOpen(true)
  }

  // reset form
  const resetForm = () => {
    setTitulo('')
    setOrden(1)
    setCursoId('')
    setEditingModule(null)
    setOpen(false)
  }

  // submit
  const handleSubmit = () => {
    if (!cursoId) {
      alert('Selecciona un curso')
      return
    }

    if (!titulo.trim()) {
      alert('El título es obligatorio')
      return
    }

    if (isEditing) {
      const payload = {
        id: editingModule.id,
        cursoId: Number(cursoId),
        titulo,
        descripcion: 'Test',
        orden: Number(orden),
      }

      updateModule.mutate(
        {
          id: editingModule.id,
          data: payload,
        },
        {
          onSuccess: resetForm,
        }
      )
    } else {
      const payload = {
        cursoId: Number(cursoId),
        titulo,
        descripcion: 'Test',
        orden: Number(orden),
      }

      createModule.mutate(payload, {
        onSuccess: resetForm,
      })
    }
  }

  // delete
  const handleDelete = (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este módulo?')) {
      deleteModule.mutate(id)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <PageHeader
        title="Módulos"
        buttonText="Nuevo Módulo"
        icon={<PlusCircle className="w-4 h-4 mr-2" />}
        onClick={handleOpen}
      />

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Módulo' : 'Nuevo Módulo'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">

            {/* CURSO */}
            <div>
              <label>Curso</label>
              <select
                className="w-full border rounded p-2"
                value={cursoId}
                onChange={e => setCursoId(Number(e.target.value))}
              >
                <option value="">Seleccione un curso</option>

                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* TITULO */}
            <div>
              <label>Título</label>
              <Input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
              />
            </div>
            {/* ORDEN */}
            <div>
              <label>Orden</label>
              <Input
                type="number"
                min={1}
                value={orden}
                onChange={e => setOrden(Number(e.target.value))}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>

              <Button onClick={handleSubmit}>
                {isEditing ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de módulos</CardTitle>
        </CardHeader>

        <CardContent>
          <DataTable
            header={
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            }
          >
            {data?.map(m => {
              const curso = courses.find(c => c.id === m.cursoId)

              return (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{curso?.titulo ?? 'N/A'}</TableCell>
                  <TableCell>{m.titulo}</TableCell>
                  <TableCell>{m.orden}</TableCell>

                  <TableCell className="flex gap-2">

                    {/* EDIT */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(m)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    {/* DELETE */}
                    <ConfirmDeleteButton
                      onConfirm={() => handleDelete(m.id)}
                    />
                  </TableCell>

                </TableRow>
              )
            })}
          </DataTable>
        </CardContent>
      </Card>
    </div>
  )
}