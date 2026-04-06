import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useHomeWork } from '@/hooks/useHomeWork'

export function TeacherCreateHomeworkPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const lessonIdFromUrl = Number(params.get('lessonId'))
  const courseIdFromUrl = Number(params.get('courseId'))

  const lessonId = isNaN(lessonIdFromUrl) ? null : lessonIdFromUrl

  const { create } = useHomeWork()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaApertura, setFechaApertura] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [formato, setFormato] = useState('pdf')
  const [error, setError] = useState<string | null>(null)

  const goBack = () => {
    navigate(`/teacher/lessons/${courseIdFromUrl}`)
  }

  const handleSubmit = () => {
    setError(null)

    // 🔹 VALIDACIONES BÁSICAS
    if (!lessonId) return setError('lessonId inválido')
    if (!titulo.trim()) return setError('Título requerido')
    if (!descripcion.trim()) return setError('Descripción requerida')

    if (!fechaApertura) return setError('Fecha de apertura requerida')
    if (!fechaEntrega) return setError('Fecha de entrega requerida')
    if (!fechaLimite) return setError('Fecha límite requerida')

    const apertura = new Date(fechaApertura)
    const entrega = new Date(fechaEntrega)
    const limite = new Date(fechaLimite)

    // 🔥 VALIDACIONES DE FECHAS
    if (entrega < apertura) {
      return setError('La fecha de entrega no puede ser antes de la apertura')
    }

    if (limite < entrega) {
      return setError('La fecha límite no puede ser antes de la entrega')
    }

    if (limite < apertura) {
      return setError('La fecha límite no puede ser antes de la apertura')
    }

    // 🔹 CREAR FORM DATA
    const formData = new FormData()

    formData.append('lessonId', lessonId.toString())
    formData.append('titulo', titulo)
    formData.append('descripcion', descripcion)
    formData.append('fechaApertura', apertura.toISOString())
    formData.append('fechaEntrega', entrega.toISOString())
    formData.append('fechaLimite', limite.toISOString())
    formData.append('formato', formato)

    if (file) {
      formData.append('file', file)
      formData.append('tamanoKb', Math.round(file.size / 1024).toString())
    } else {
      formData.append('tamanoKb', '0')
    }

    // 🔹 ENVIAR
    create.mutate(formData, {
      onSuccess: () => {
        alert('Tarea creada correctamente ✅')
        goBack()
      },
      onError: () => {
        setError('Error al crear la tarea ❌')
      },
    })
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      <Button variant="outline" onClick={goBack}>
        ← Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Crear Tarea</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ERROR */}
          {error && (
            <div className="text-red-500 text-sm border border-red-300 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* TÍTULO */}
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Tarea 1"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de la tarea"
            />
          </div>

          {/* FECHAS */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm font-medium">Fecha Apertura</label>
              <Input
                type="datetime-local"
                value={fechaApertura}
                onChange={(e) => setFechaApertura(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fecha Entrega</label>
              <Input
                type="datetime-local"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fecha Límite</label>
              <Input
                type="datetime-local"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
            </div>
          </div>

          {/* FORMATO */}
          <div>
            <label className="text-sm font-medium">Formato</label>
            <Input
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
              placeholder="pdf, docx, etc"
            />
          </div>

          {/* ARCHIVO */}
          <div>
            <label className="text-sm font-medium">Archivo (opcional)</label>
            <Input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setFile(f)
              }}
            />
          </div>

          <Button onClick={handleSubmit} disabled={create.isPending}>
            {create.isPending ? 'Guardando...' : 'Crear Tarea'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}