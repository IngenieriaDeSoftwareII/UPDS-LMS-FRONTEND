import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/services/teacher.service';
import type { TeacherCreateDTO, TeacherUpdateDTO } from '@/types/teacher';

export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: () => teacherService.getAll(),
  });
}

export function useTeacherById(id: number) {
  return useQuery({
    queryKey: ['teachers', id],
    queryFn: () => teacherService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TeacherCreateDTO) => teacherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TeacherUpdateDTO }) => teacherService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teachers', variables.id] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}
