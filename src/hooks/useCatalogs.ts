import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import type { CatalogCreateDTO, CatalogUpdateDTO } from '@/types/catalog';

export function useCatalogs() {
  return useQuery({
    queryKey: ['catalogs'],
    queryFn: () => catalogService.getAll(),
  });
}

export function useCatalogById(id: number) {
  return useQuery({
    queryKey: ['catalogs', id],
    queryFn: () => catalogService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CatalogCreateDTO) => catalogService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    },
  });
}

export function useUpdateCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CatalogUpdateDTO }) => catalogService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['catalogs', variables.id] });
    },
  });
}

export function useDeleteCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => catalogService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    },
  });
}
