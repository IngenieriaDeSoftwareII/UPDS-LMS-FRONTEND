import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, Layers, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api.error'

import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { useCatalogs } from '@/hooks/useCatalogs'
import type { CategoryDto } from '@/types/category'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const categorySchema = z.object({
  name: z.string().min(1, 'Requerido').max(100),
  slug: z.string().min(1, 'Requerido').max(100),
  description: z.string().min(1, 'Requerido').max(500),
  catalogId: z.string().min(1, 'Requerido'),
})
type FormValues = z.infer<typeof categorySchema>

function CategoryForm({ defaultValues, onSubmit, isPending, onCancel }: { defaultValues: Partial<FormValues>, onSubmit: (v: FormValues) => void, isPending: boolean, onCancel: () => void }) {
  const { data: catalogs = [], isLoading: isLoadingCatalogs } = useCatalogs()
  
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '', catalogId: '', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller name="name" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Input id="name" placeholder="Desarrollo Web..." {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller name="slug" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input id="slug" placeholder="desarrollo-web" {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller name="description" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Descripción</FieldLabel>
            <Input id="description" placeholder="Categoría para..." {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller name="catalogId" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Catálogo</FieldLabel>
            <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined} disabled={isLoadingCatalogs}>
              <SelectTrigger><SelectValue placeholder="Seleccione un catálogo" /></SelectTrigger>
              <SelectContent>
                {catalogs.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</Button>
      </DialogFooter>
    </form>
  )
}

export function CategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<CategoryDto | null>(null)
  const [search, setSearch] = useState('')

  const { data: categories, isLoading, error } = useCategories()
  const { data: catalogs = [] } = useCatalogs() // Para mostrar el nombre del catálogo en la tabla

  const filteredCategories = useMemo(() => {
    if (!categories) return []
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
  }, [categories, search])

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutate: deleteCategory } = useDeleteCategory()

  const handleCreate = (values: FormValues) => {
    createCategory(values, {
      onSuccess: () => { setCreateOpen(false); toast.success('Categoría registrada exitosamente') },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo registrar')),
    })
  }

  const handleUpdate = (values: FormValues) => {
    if (!editCategory) return
    updateCategory({ id: editCategory.id, data: { ...values } }, {
      onSuccess: () => { setEditCategory(null); toast.success('Categoría actualizada correctamente') },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar')),
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return
    deleteCategory(id, {
      onSuccess: () => toast.success('Categoría eliminada correctamente'),
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar')),
    })
  }

  const getCatalogName = (catalogId: string) => catalogs.find(c => c.id === catalogId)?.name || catalogId

  return (
    <div className="space-y-6 rounded-2xl border bg-background/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl border border-primary/20 bg-primary/10 shadow-inner text-primary">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Módulos</p>
            <h1 className="text-2xl font-bold">Categorías</h1>
            <p className="text-sm text-muted-foreground">{filteredCategories.length} {search ? 'resultado(s)' : 'registros'} • {categories?.length ?? 0} totales</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar categoría..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20"><PlusCircle className="w-4 h-4" /> Nueva Categoría</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] border border-border bg-card">
              <DialogHeader><DialogTitle>Nueva Categoría</DialogTitle></DialogHeader>
              <CategoryForm defaultValues={{}} onSubmit={handleCreate} isPending={isCreating} onCancel={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent className="sm:max-w-[640px] border border-border bg-card">
          <DialogHeader><DialogTitle>Editar Categoría</DialogTitle></DialogHeader>
          {editCategory && <CategoryForm defaultValues={{ name: editCategory.name, slug: editCategory.slug, description: editCategory.description, catalogId: editCategory.catalogId }} onSubmit={handleUpdate} isPending={isUpdating} onCancel={() => setEditCategory(null)} />}
        </DialogContent>
      </Dialog>

      <Card className="border border-border bg-card">
        <CardHeader className="pb-3 border-b border-border bg-muted/40 backdrop-blur rounded-t-xl">
          <CardTitle className="text-base font-semibold">Categorías</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-400">Error al cargar datos.</p>
          ) : filteredCategories.length === 0 ? (
            <p className="text-center text-slate-400">Cero resultados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category: any) => (
                  <div key={category.id} className="group rounded-2xl border border-border bg-card/70 p-4 space-y-3 shadow-xl shadow-black/5 dark:shadow-black/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{getCatalogName(category.catalogId)}</p>
                        <h3 className="text-lg font-semibold leading-tight">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">Slug: {category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" onClick={() => setEditCategory(category)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}