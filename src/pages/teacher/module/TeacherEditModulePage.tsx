import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { useModules, useUpdateModule } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function TeacherEditModulePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const moduleId = Number(id)

  const { data: modules = [] } = useModules()
  const { data: courses = [] } = useCoursesPrueba()
  const { mutate: updateModule, isPending } = useUpdateModule()

  const module = modules.find(m => m.id === moduleId)

  const [titulo, setTitulo] = useState('')
  const [cursoId, setCursoId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (module) {
      setTitulo(module.titulo)
      setCursoId(module.cursoId)
    }
  }, [module])

  const handleSubmit = () => {
    setError(null)

    if (!cursoId) {
      return setError('Debes seleccionar un curso')
    }

    if (!titulo.trim()) {
      return setError('El título es obligatorio')
    }

    updateModule(
      {
        id: moduleId,
        data: {
          id: moduleId,
          cursoId: Number(cursoId),
          titulo,
          orden: module?.orden ?? 1
        }
      },
      {
        onSuccess: () => {
          alert('Módulo actualizado ✅')
          navigate(`/teacher/lessons/${cursoId}`)
        },
        onError: () => {
          setError('Error al actualizar ❌')
        }
      }
    )
  }

  if (!module) {
    return <div className="p-6">Módulo no encontrado</div>
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">

      <Button variant="outline" onClick={() => navigate(`/teacher/lessons/${cursoId}`)}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Módulo</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {error && (
            <div className="text-red-500 text-sm border p-2 rounded">
              {error}
            </div>
          )}

          {/* CURSO */}
          <div>
            <label className="text-sm font-medium">Curso</label>
            <select
              className="w-full border rounded p-2"
              value={cursoId}
              onChange={(e) => setCursoId(Number(e.target.value))}
            >
              <option value="">Seleccionar</option>
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

          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}