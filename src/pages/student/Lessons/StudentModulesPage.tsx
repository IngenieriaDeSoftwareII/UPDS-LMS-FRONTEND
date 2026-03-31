import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { useModules } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function StudentModulesPage() {
  const navigate = useNavigate()

  const { data: modules, isLoading, error } = useModules()
  const { data: courses = [], isLoading: loadingCourses } = useCoursesPrueba()

  // 🔥 ordenar módulos por orden
  const sortedModules = modules
    ?.sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))

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
    <div className="space-y-6 p-6">

      <h1 className="text-2xl font-bold">
        Módulos del curso
      </h1>

      {sortedModules?.length === 0 ? (
        <p className="text-gray-500">No hay módulos disponibles</p>
      ) : (
        sortedModules?.map((module) => {
          const curso = courses.find(c => c.id === module.cursoId)

          return (
            <Card
              key={module.id}
              className="cursor-pointer hover:shadow-md transition"
              onClick={() =>
                navigate(`/student/modules/${module.id}/lessons`)
              }
            >
              <CardHeader>

                <div>
                  <CardTitle>{module.titulo}</CardTitle>

                  <p className="text-sm text-gray-500">
                    {curso?.titulo || 'Sin curso'}
                  </p>
                </div>

              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-400">
                  Orden: {module.orden}
                </p>
              </CardContent>

            </Card>
          )
        })
      )}

    </div>
  )
}