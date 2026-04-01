import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/course.service';
import type { CourseCreateDTO, CourseUpdateDTO } from '@/types/course';

// Obtiene TODOS los cursos (para ADMIN)
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getAll(),
  });
}

// NUEVO: Obtiene cursos asignados a un docente específico
export function useTeacherCourses(teacherId: number | undefined) {
  return useQuery({
    queryKey: ['teacher-courses', teacherId],
    queryFn: () => {
      if (!teacherId) return Promise.resolve([]);
      return courseService.getCoursesByTeacher(teacherId);
    },
    enabled: !!teacherId, // Solo ejecuta si tenemos teacherId
  });
}

export function useCourseById(id: number) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => courseService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseCreateDTO) => courseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourseUpdateDTO }) => courseService.update(id, data),
    onSuccess: (data, variables) => {
      // Invalida ambas queries para mantener consistencia
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    },
  });
}