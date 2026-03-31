import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

import { PageHeader } from '@/components/common/PageHeader'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'

import {
  useModules,
  useCreateModule,
  useDeleteModule,
  useUpdateModule
} from '@/hooks/useModules'

import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function TeacherModulesPage() {
  const navigate = useNavigate()

  const { data: modules, isLoading, error } = useModules()
  const { data: courses = [], isLoading: loadingCourses } = useCoursesPrueba()

  const createModule = useCreateModule()
  const updateModule = useUpdateModule()
  const deleteModule = useDeleteModule()

  // 🔹 modal state
  const [open, setOpen] = useState(false)

  // 🔹 form state
  const [titulo, setTitulo] = useState('')
  const [cursoId, setCursoId] = useState<number | ''>('')

  const [editingModule, setEditingModule] = useState<any | null>(null)
  const isEditing = !!editingModule

  // 🔹 abrir crear
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

  // 🔹 reset
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

    const payload = {
      cursoId: Number(cursoId),
      titulo,
      orden: 1
    }

    if (isEditing) {
      updateModule.mutate(
        {
          id: editingModule.id,
          data: {
            ...payload,
            id: editingModule.id
          }
        },
        {
          onSuccess: resetForm
        }
      )
    } else {
      createModule.mutate(payload, {
        onSuccess: resetForm
      })
    }
  }

  // 🔹 delete
  const handleDelete = (id: number) => {
    deleteModule.mutate(id)
  }

  // 🔹 loading
  if (isLoading || loadingCourses) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  // 🔹 error
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar módulos ❌
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

      {/* LISTA */}
      {modules?.length === 0 ? (
        <p className="text-gray-500">No hay módulos</p>
      ) : (
        modules?.map((module) => {
          const curso = courses.find(c => c.id === module.cursoId)

          return (
            <Card
              key={module.id}
              className="cursor-pointer hover:shadow-md transition"
              onClick={() =>
                navigate(`/teacher/modules/${module.id}/lessons`)
              }
            >
              <CardHeader className="flex justify-between items-center">

                <div>
                  <CardTitle>{module.titulo}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {curso?.titulo || 'Sin curso'}
                  </p>
                </div>

                {/* ACTIONS */}
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* EDIT */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(module)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  {/* DELETE */}
                  <ConfirmDeleteButton
                    onConfirm={() => handleDelete(module.id)}
                  />
                </div>

              </CardHeader>
            </Card>
          )
        })
      )}

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
              <label className="text-sm font-medium">Curso</label>
              <select
                className="w-full border rounded p-2"
                value={cursoId}
                onChange={(e) =>
                  setCursoId(Number(e.target.value))
                }
              >
                <option value="">Seleccione un curso</option>

                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* TÍTULO */}
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>

            <Button onClick={handleSubmit}>
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  )
}