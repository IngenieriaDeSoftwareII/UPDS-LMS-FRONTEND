import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { inscriptionService } from "@/services/inscriptionService"
import type { Course } from "@/types/course"

// MOCK TEMPORAL

const mockCourses: Course[] = [
  {
    id: 1,
    titulo: "React desde Cero",
    descripcion: "Aprende React paso a paso",
    nivel: "Básico",
    imagen_url: "https://edteam-media.s3.amazonaws.com/courses/original/ff432ae3-00a6-4102-b6a4-aa7194564967.png",
    publicado: true,
    duracion_total_min: 600,
    max_estudiantes: 30,
    entity_status: 1,
    created_at: "",
    updated_at: ""
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

      const usuarioId = 1 // luego authStore

      await inscriptionService.create({
        usuarioId,
        cursoId: course.id
      })

      setSuccess("Inscripción realizada correctamente")

      setTimeout(() => {
        navigate("/student/my-courses")
      }, 1500)

    } catch (err: any) {

      setError(
        "Lo sentimos, " +
        (err.message || "no se pudo realizar la inscripción")
      )

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