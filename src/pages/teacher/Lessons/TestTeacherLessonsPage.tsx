import { useNavigate } from 'react-router-dom'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Course = {
  id: number
  titulo: string
  nivel?: string
}

export function TestTeacherLessonsPage() {
  const navigate = useNavigate()

  const { data: courses = [], isLoading, isError } = useCoursesPrueba()

  if (isLoading) {
    return <div className="p-6">Cargando cursos...</div>
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">
        Error cargando cursos ❌
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay cursos para probar
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">
        Página de Prueba - TeacherLessons
      </h1>

      <div className="grid gap-4">
        {courses.map((course: Course) => {
          if (!course?.id) return null

          return (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>
                  {course.titulo || 'Sin título'}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Nivel: {course.nivel || '—'}
                </span>

                <Button
                  onClick={() =>
                    navigate(`/teacher/lessons/${course.id}`)
                  }
                >
                  Entrar
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}