import { useEffect, useState } from "react";
import type { Course } from "@/types/course";
import { getCoursesMock } from "@/services/course.service";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoursesMock().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  return {
    courses,
    loading,
  };
}