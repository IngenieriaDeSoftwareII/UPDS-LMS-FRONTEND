import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog.service";
import type { CreateCatalogDto, UpdateCatalogDto } from "@/types/catalog";

const CATALOG_KEYS = {
  all: ["catalogs"] as const,
  detail: (id: string) => [...CATALOG_KEYS.all, id] as const,
};

export const useCatalogs = () => {
  return useQuery({
    queryKey: CATALOG_KEYS.all,
    queryFn: catalogService.getAll,
  });
};

export const useCatalog = (id: string) => {
  return useQuery({
    queryKey: CATALOG_KEYS.detail(id),
    queryFn: () => catalogService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCatalog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCatalogDto) => catalogService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    },
  });
};

export const useUpdateCatalog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCatalogDto }) => 
      catalogService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteCatalog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.all });
    },
  });
};
