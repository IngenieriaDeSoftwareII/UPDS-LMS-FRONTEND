import { useCourses } from "@/hooks/useCourses";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryCoursesCell({ categoryId }: { categoryId: number }) {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  const categoryCourses = (courses || []).filter(c => c.categoriaId === categoryId);

  return (
    <span>
      {categoryCourses.length > 0 ? categoryCourses.map((c: any) => c.titulo).join(', ') : '-'}
    </span>
  );
}