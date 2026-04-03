import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
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

  const [open, setOpen] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [cursoId, setCursoId] = useState<number | ''>('')

  const [editingModule, setEditingModule] = useState<any | null>(null)
  const isEditing = !!editingModule

  const handleOpen = () => {
    setEditingModule(null)
    setTitulo('')
    setCursoId('')
    setOpen(true)
  }

  const handleEdit = (module: any) => {
    setEditingModule(module)
    setTitulo(module.titulo)
    setCursoId(module.cursoId)
    setOpen(true)
  }

  const resetForm = () => {
    setTitulo('')
    setCursoId('')
    setEditingModule(null)
    setOpen(false)
  }

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

  const handleDelete = (id: number) => {
    deleteModule.mutate(id)
  }

  if (isLoading || loadingCourses) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar módulos ❌
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4">

      {/* HEADER */}
      <PageHeader
        title="Módulos"
        buttonText="Nuevo Módulo"
        icon={<PlusCircle className="w-4 h-4 mr-2" />}
        onClick={handleOpen}
      />

      {/* LISTA */}
      {modules?.length === 0 ? (
        <div className="text-center text-gray-500 py-10 border rounded-lg">
          No hay módulos creados
        </div>
      ) : (
        <div className="grid gap-4">

          {modules?.map((module) => {
            const curso = courses.find(c => c.id === module.cursoId)

            return (
              <Card
                key={module.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border"
                onClick={() =>
                  navigate(`/teacher/modules/${module.id}/lessons`)
                }
              >
                <CardHeader className="flex flex-row justify-between items-center">

                  {/* INFO */}
                  <div className="space-y-1">
                    <CardTitle className="text-lg group-hover:text-primary transition">
                      {module.titulo}
                    </CardTitle>

                    <p className="text-sm text-gray-500">
                      {curso?.titulo || 'Sin curso'}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div
                    className="flex gap-2 opacity-80 group-hover:opacity-100 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(module)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <ConfirmDeleteButton
                      onConfirm={() => handleDelete(module.id)}
                    />
                  </div>

                </CardHeader>
              </Card>
            )
          })}

        </div>
      )}

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">

          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditing ? 'Editar Módulo' : 'Nuevo Módulo'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">

            {/* CURSO */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Curso</label>
              <select
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
            <div className="space-y-1">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Ej: Introducción al curso"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

          </div>

          <DialogFooter className="mt-4">
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