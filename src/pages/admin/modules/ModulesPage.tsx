import { useState } from 'react'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'

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
  DialogDescription,
} from '@/components/ui/dialog'
import {
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'

import {
  useModules,
  useCreateModule,
  useDeleteModule,
  useUpdateModule,
} from '@/hooks/useModules'

// cursos reales desde backend 
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export default function ModulesPage() {
  const { data, isLoading } = useModules()
  const { data: courses = [], isLoading: loading } = useCoursesPrueba()

  const createModule = useCreateModule()
  const updateModule = useUpdateModule()
  const deleteModule = useDeleteModule()

  const [open, setOpen] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [cursoId, setCursoId] = useState<number | ''>('')

  const [editingModule, setEditingModule] = useState<any | null>(null)
  const isEditing = !!editingModule

  // 🔹 abrir modal crear
  const handleOpen = () => {
    setEditingModule(null)
    setTitulo('')
    setCursoId('')
    setOpen(true)
  }

  // 🔹 editar
  const handleEdit = (module: any) => {
    setEditingModule(module)
    setTitulo(module.titulo)
    setCursoId(module.cursoId)
    setOpen(true)
  }

  // 🔹 reset form
  const resetForm = () => {
    setTitulo('')
    setCursoId('')
    setEditingModule(null)
    setOpen(false)
  }

  // 🔹 submit
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
        id: editingModule.id, // ✅ FIX TypeScript
        cursoId: Number(cursoId),
        titulo,
        descripcion: 'Test',
        orden: 1,
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
        orden: 1,
      }

      createModule.mutate(payload, {
        onSuccess: resetForm,
      })
    }
  }

  // 🔹 delete
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
            <DialogDescription>
              {isEditing ? 'Modifica los campos del módulo seleccionado.' : 'Completa los campos para crear un nuevo módulo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">

            {/* CURSO */}
            <div>
              <label className="text-sm font-medium mb-1 block">Curso</label>
              <Select
                value={cursoId ? cursoId.toString() : ""}
                onValueChange={(value) => setCursoId(Number(value))}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Seleccione un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.titulo} (ID: {c.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TITULO */}
            <div>
              <label>Título</label>
              <Input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
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
                  <TableCell>
                    {curso ? `${curso.titulo} (ID: ${curso.id})` : 'N/A'}
                  </TableCell>
                  <TableCell>{m.titulo}</TableCell>
                  <TableCell>{m.orden}</TableCell>
                  {/* Botones */}
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(m)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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