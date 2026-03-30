import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";
import type { CreateCourseDto, UpdateCourseDto } from "@/types/course";

const COURSE_KEYS = {
  all: ["courses"] as const,
  detail: (id: string) => [...COURSE_KEYS.all, id] as const,
};

export const useCourses = () => {
  return useQuery({
    queryKey: COURSE_KEYS.all,
    queryFn: courseService.getAll,
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: COURSE_KEYS.detail(id),
    queryFn: () => courseService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseDto) => courseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.all });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) => 
      courseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.id) });
    },
  });
};

export const usePublishCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) =>
      courseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.all });
    },
  });
};