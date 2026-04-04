import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHomeWork } from '@/hooks/useHomeWork'
import { useLessons } from '@/hooks/useLessons'
import { useModules } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function TeacherHomeworkEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const homeworkId = Number(id)
  const isValidId = !isNaN(homeworkId)

  const { getAll, update } = useHomeWork()
  const { data: homeworks, isLoading: loadingHomeworks } = getAll
  
  // Buscar la tarea especifica
  const homework = useMemo(() => homeworks?.find(h => h.id === homeworkId), [homeworks, homeworkId])

  //  DATA
  const { useLessonsList } = useLessons()
  const { data: lessons } = useLessonsList()
  const { data: modules } = useModules()
  const { data: courses } = useCoursesPrueba()

  //  state
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaApertura, setFechaApertura] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [lessonId, setLessonId] = useState<number | undefined>()
  const [file, setFile] = useState<File | null>(null)

  // format dates to YYYY-MM-DDTHH:mm
  const formatDateTime = (dateString?: string | Date) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  // cargar datos
  useEffect(() => {
    if (homework) {
      setTitulo(homework.titulo || '')
      setDescripcion(homework.descripcion || '')
      setLessonId(homework.lessonId)
      // Ajustar fechas
      setFechaApertura(formatDateTime(homework.fechaApertura))
      setFechaEntrega(formatDateTime(homework.fechaEntrega))
      setFechaLimite(formatDateTime(homework.fechaLimite))
    }
  }, [homework])

  //  (curso/módulo)
  const selectedLesson = useMemo(() => lessons?.find(l => l.id === lessonId), [lessonId, lessons])
  const selectedModule = useMemo(() => modules?.find(m => m.id === selectedLesson?.moduleId), [selectedLesson, modules])
  const selectedCourse = useMemo(() => courses?.find(c => c.id === selectedModule?.cursoId), [selectedModule, courses])

  const goBack = () => {
    navigate('/teacher/lessons')
  }

  const handleUpdate = () => {
    if (!titulo.trim()) return alert('El título no puede estar vacío')
    if (!lessonId) return alert('Debes seleccionar una lección')
    if (!fechaApertura || !fechaEntrega || !fechaLimite) return alert('Todas las fechas son obligatorias')

    const formData = new FormData()
    formData.append('Titulo', titulo)
    formData.append('Descripcion', descripcion)
    formData.append('LessonId', String(lessonId))
    
    // El backend espera fechas en formato string estándar o similar
    formData.append('FechaApertura', new Date(fechaApertura).toISOString())
    formData.append('FechaEntrega', new Date(fechaEntrega).toISOString())
    formData.append('FechaLimite', new Date(fechaLimite).toISOString())

    if (file) {
      formData.append('File', file)
    }

    update.mutate(
      { id: homeworkId, data: formData },
      {
        onSuccess: () => {
          alert('Tarea actualizada ✅')
          goBack()
        },
        onError: (e) => {
          console.error(e)
          alert('Ocurrió un error al actualizar la tarea')
        }
      }
    )
  }

  // estados
  if (!isValidId) return <p className="p-6 text-red-500">ID inválido</p>
  if (loadingHomeworks) return <p className="p-6">Cargando...</p>
  if (!homework) return <p className="p-6 text-red-500">Error: No se encontró la tarea (puede que los datos no hayan cargado).</p>

  return (
    <div className="space-y-6 max-w-xl mx-auto p-6">
      <Button variant="outline" onClick={goBack}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Tarea</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* INFO ACTUAL */}
          <div className="text-sm bg-gray-50 p-3 rounded space-y-1">
            <p><strong>Curso:</strong> {selectedCourse?.titulo || '—'}</p>
            <p><strong>Módulo:</strong> {selectedModule?.titulo || '—'}</p>
            <p><strong>Lección:</strong> {selectedLesson?.title || '—'}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Título</label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              className="w-full border p-2 rounded text-sm min-h-[100px]"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Lección asignada</label>
            <select
              className="w-full border rounded p-2"
              value={lessonId ?? ''}
              onChange={(e) => setLessonId(Number(e.target.value))}
            >
              <option value="">Seleccionar</option>
              {lessons?.map(l => {
                const mod = modules?.find(m => m.id === l.moduleId)
                const c = courses?.find(c => c.id === mod?.cursoId)
                return (
                  <option key={l.id} value={l.id}>
                    {`Curso: ${c?.titulo || '—'} | Módulo: ${mod?.titulo || '—'} | Lección: ${l.title}`}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Apertura</label>
              <Input type="datetime-local" value={fechaApertura} onChange={(e) => setFechaApertura(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Entrega</label>
              <Input type="datetime-local" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-red-500">Fecha Límite</label>
            <Input type="datetime-local" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Reemplazar archivo adjunto</label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground mt-1">Deja vacío para conservar el archivo que la tarea ya tiene.</p>
          </div>

          <Button onClick={handleUpdate} disabled={update.isPending} className="w-full mt-4">
            {update.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
