import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

export function CatalogCategoriesCell({ catalogId }: { catalogId: number }) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  const catalogCategories = (categories || []).filter(c => c.catalogoId === catalogId);

  return (
    <span>
      {catalogCategories.length > 0 ? catalogCategories.map((c: any) => c.nombre).join(', ') : '-'}
    </span>
  );
}