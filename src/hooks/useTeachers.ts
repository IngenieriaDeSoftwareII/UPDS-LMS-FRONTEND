import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "@/services/teacher.service";
import type { CreateTeacherDto, UpdateTeacherDto } from "@/types/teacher";

const TEACHER_KEYS = {
  all: ["teachers"] as const,
  detail: (id: string) => [...TEACHER_KEYS.all, id] as const,
};

export const useTeachers = () => {
  return useQuery({
    queryKey: TEACHER_KEYS.all,
    queryFn: teacherService.getAll,
  });
};

export const useTeacher = (id: string) => {
  return useQuery({
    queryKey: TEACHER_KEYS.detail(id),
    queryFn: () => teacherService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeacherDto) => teacherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.all });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeacherDto }) => 
      teacherService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teacherService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.all });
    },
  });
};
