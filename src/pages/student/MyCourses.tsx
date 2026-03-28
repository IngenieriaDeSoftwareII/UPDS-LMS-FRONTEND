import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { inscriptionService } from '@/services/inscriptionService'
import type { MyCourseInscriptionDto } from '@/services/inscriptionService'

export function MyCourses() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const usuarioId = Number(searchParams.get('usuarioId') ?? 1)
  const [inscriptions, setInscriptions] = useState<MyCourseInscriptionDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInscriptions = async () => {
      try {
        const safeUsuarioId =
          Number.isFinite(usuarioId) && usuarioId > 0 ? usuarioId : 1
        setLoading(true)
        const data = await inscriptionService.getMyCourses(safeUsuarioId)
        setInscriptions(data)
      } catch (error) {
        console.error('Error al cargar:', error)
        setInscriptions([])
      } finally {
        setLoading(false)
      }
    }

    fetchInscriptions()
  }, [usuarioId])

  const handleCancel = async (inscription: MyCourseInscriptionDto) => {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas cancelar esta inscripción? Esta acción no se puede deshacer.'
    )
    if (!confirmacion) return

    const cursoId = inscription.curso?.id
    if (!cursoId) {
      alert('No se pudo cancelar: curso no disponible.')
      return
    }

    try {
      await inscriptionService.cancel({ usuarioId, cursoId })
      setInscriptions(prev => prev.filter(ins => ins.id !== inscription.id))
      alert('Inscripción cancelada.')
    } catch (error) {
      console.error('Error al cancelar:', error)
      alert('Hubo un error al procesar la cancelación.')
    }
  }

  if (loading) return <div className="p-6">Cargando inscripciones...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mis Cursos</h1>

      {inscriptions.length === 0 ? (
        <p>No tienes cursos inscritos.</p>
      ) : (
        <ul className="space-y-4">
          {inscriptions.map(ins => (
            <li key={ins.id} className="border border-gray-300 rounded p-4 space-y-3">
              <div className="flex gap-4 items-start">
                {ins.curso.imagenUrl ? (
                  <img
                    src={ins.curso.imagenUrl}
                    alt={ins.curso.titulo}
                    className="w-20 h-20 object-cover rounded border"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-20 h-20 rounded border bg-gray-50" />
                )}

                <div className="flex-1">
                  <div className="font-semibold text-lg">{ins.curso.titulo}</div>
                  <div className="text-sm text-gray-600">Estado: {ins.estado}</div>
                </div>
              </div>

              {ins.curso.descripcion ? (
                <div className="text-sm text-gray-700">{ins.curso.descripcion}</div>
              ) : null}

              <div className="text-sm text-gray-600">
                <div>Nivel: {ins.curso.nivel}</div>
                {ins.curso.duracionTotalMin != null ? (
                  <div>Duración total: {ins.curso.duracionTotalMin} min</div>
                ) : null}
                {ins.curso.maxEstudiantes != null ? (
                  <div>Máx. estudiantes: {ins.curso.maxEstudiantes}</div>
                ) : null}
                <div>Fecha de creación: {ins.createdAt}</div>
                {ins.fechaCompletado != null ? (
                  <div>Fecha completado: {ins.fechaCompletado}</div>
                ) : (
                  <div>Fecha completado: Pendiente</div>
                )}
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => handleCancel(ins)}
                >
                  Cancelar inscripción
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}