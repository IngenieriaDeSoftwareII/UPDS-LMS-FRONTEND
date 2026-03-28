import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { inscriptionService } from "@/services/inscriptionService"
import type { Course } from "@/types/course"

const mockCourses: Course[] = [
  {
    id: 1,
    titulo: "React desde cero",
    descripcion: "Aprende React moderno con hooks",
    nivel: "Intermedio",
    imagen_url:
      "https://edteam-media.s3.amazonaws.com/courses/original/ff432ae3-00a6-4102-b6a4-aa7194564967.png",
    publicado: true,
    duracion_total_min: 1200,
    max_estudiantes: 50,
    entity_status: 1,
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  },
  {
    id: 2,
    titulo: "SQL Server Profesional",
    nivel: "Básico",
    imagen_url: "https://edteam-media.s3.amazonaws.com/courses/original/ee2d8a6e-b1df-4f4d-8fca-47d0ffe135dc.jpeg",
    publicado: true,
    duracion_total_min: 800,
    max_estudiantes: 40,
    entity_status: 1,
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  }
]

export function CourseDetail() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const course = mockCourses.find(c => c.id === Number(id))

  if (!course) {
    return <div className="p-6">Curso no encontrado</div>
  }


  const handleInscription = async () => {
    try {

      setLoading(true)
      setError(null)
      setSuccess(null)

      const usuarioId = Math.floor(Math.random() * 2) + 1
      const cursoId = Math.floor(Math.random() * 2) + 1

      await inscriptionService.create({ usuarioId, cursoId })

      setSuccess("Inscripción realizada correctamente")
      navigate(`/student/mycourses?usuarioId=${usuarioId}`)

    } catch (err: any) {
      const data = err?.response?.data
      const msg =
        Array.isArray(data) && typeof data[0] === "string"
          ? data[0]
          : err?.message || "no se pudo realizar la inscripción"

      setError(msg)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        {course.titulo}
      </h1>

      <p className="text-gray-600">
        {course.descripcion}
      </p>

      <div className="space-y-2">

        <p>
          <strong>Nivel:</strong> {course.nivel}
        </p>

        <p>
          <strong>Duración:</strong> {course.duracion_total_min} minutos
        </p>

        <p>
          <strong>Cupo máximo:</strong>{" "}
          {course.max_estudiantes ?? "Sin límite"}
        </p>

      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded">
          {success}
        </div>
      )}

      <button
        onClick={handleInscription}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Inscribiendo..." : "Inscribirme"}
      </button>

      <button
        onClick={() => navigate("/student/dashboard")}
        className="ml-3 px-4 py-2 border rounded"
      >
        Volver
      </button>

    </div>
  )
}