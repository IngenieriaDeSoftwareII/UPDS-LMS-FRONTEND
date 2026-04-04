import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { useCreateModule } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function TeacherCreateModulePage() {
  const navigate = useNavigate()

  const { mutate: createModule, isPending } = useCreateModule()
  const { data: courses = [] } = useCoursesPrueba()

  const [titulo, setTitulo] = useState('')
  const [cursoId, setCursoId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    setError(null)

    if (!cursoId) {
      return setError('Debes seleccionar un curso')
    }

    if (!titulo.trim()) {
      return setError('El título es obligatorio')
    }

    createModule(
      {
        cursoId: Number(cursoId),
        titulo,
        orden: 1
      },
      {
        onSuccess: () => {
          alert('Módulo creado ✅')
          navigate('/teacher/lessons')
        },
        onError: () => {
          setError('Error al crear módulo ❌')
        }
      }
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">

      <Button variant="outline" onClick={() => navigate('/teacher/lessons')}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Crear Módulo</CardTitle>
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
            {isPending ? 'Guardando...' : 'Crear módulo'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}