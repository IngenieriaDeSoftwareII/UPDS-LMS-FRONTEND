import { useCourses } from "@/hooks/useCourses";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function CourseCatalog() {
  const { data: courses, isLoading: loading } = useCourses();
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-6">Cargando Cursos</div>;
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Catálogo de Cursos
      </h1>

      <p className="text-gray-500">
        Explora los cursos disponibles
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {(courses || []).map((course) => (
          <Card
            key={course.id}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/student/courses/${course.id}`)}
          >
            <img
              src={course.imagenUrl || ''}
              alt={course.titulo}
              className="h-40 w-full object-cover rounded-t-lg"
            />

            <CardContent className="space-y-2 p-4">

              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                {course.nivel}
              </span>

              <h2 className="font-semibold text-lg">
                {course.titulo}
              </h2>

              <p className="text-xs text-gray-400">
                ⏱ {course.duracionTotalMin ? Math.floor(course.duracionTotalMin / 60) : 0}h
              </p>

            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  );
}