import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, Library, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api.error'
import { useCatalogs, useCreateCatalog, useUpdateCatalog, useDeleteCatalog } from '@/hooks/useCatalogs'
import type { CatalogDto } from '@/types/catalog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

const catalogSchema = z.object({
  name: z.string().min(1, 'Requerido').max(100),
  description: z.string().min(1, 'Requerido').max(500),
})
type FormValues = z.infer<typeof catalogSchema>

function CatalogForm({ defaultValues, onSubmit, isPending, onCancel }: { defaultValues: Partial<FormValues>, onSubmit: (v: FormValues) => void, isPending: boolean, onCancel: () => void }) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: { name: '', description: '', ...defaultValues },
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller name="name" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Input id="name" placeholder="Ej. Catálogo General" {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
        <Controller name="description" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Descripción</FieldLabel>
            <Input id="description" placeholder="Breve descripción..." {...field} />
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

export function CatalogsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editCatalog, setEditCatalog] = useState<CatalogDto | null>(null)
  const [search, setSearch] = useState('')

  const { data: catalogs, isLoading, error } = useCatalogs()
  const filteredCatalogs = useMemo(() => {
    if (!catalogs) return []
    const q = search.trim().toLowerCase()
    if (!q) return catalogs
    return catalogs.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  }, [catalogs, search])

  const { mutate: createCatalog, isPending: isCreating } = useCreateCatalog()
  const { mutate: updateCatalog, isPending: isUpdating } = useUpdateCatalog()
  const { mutate: deleteCatalog } = useDeleteCatalog()

  const handleCreate = (values: FormValues) => {
    createCatalog(values, {
      onSuccess: () => { setCreateOpen(false); toast.success('Catálogo registrado exitosamente') },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo registrar')),
    })
  }

  const handleUpdate = (values: FormValues) => {
    if (!editCatalog) return
    updateCatalog({ id: editCatalog.id, data: { ...values, id: editCatalog.id } }, {
      onSuccess: () => { setEditCatalog(null); toast.success('Catálogo actualizado correctamente') },
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo actualizar')),
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este catálogo?')) return
    deleteCatalog(id, {
      onSuccess: () => toast.success('Catálogo eliminado correctamente'),
      onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar')),
    })
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-background/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl border border-primary/20 bg-primary/10 shadow-inner text-primary">
            <Library className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Módulos</p>
            <h1 className="text-2xl font-bold">Catálogos</h1>
            <p className="text-sm text-muted-foreground">{filteredCatalogs.length} {search ? 'resultado(s)' : 'registros'} • {catalogs?.length ?? 0} totales</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar catálogo..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20"><PlusCircle className="w-4 h-4" /> Nuevo Catálogo</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] border border-border bg-card">
              <DialogHeader><DialogTitle>Nuevo Catálogo</DialogTitle></DialogHeader>
              <CatalogForm defaultValues={{}} onSubmit={handleCreate} isPending={isCreating} onCancel={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={!!editCatalog} onOpenChange={(open) => !open && setEditCatalog(null)}>
        <DialogContent className="sm:max-w-[640px] border border-border bg-card">
          <DialogHeader><DialogTitle>Editar Catálogo</DialogTitle></DialogHeader>
          {editCatalog && <CatalogForm defaultValues={{ name: editCatalog.name, description: editCatalog.description }} onSubmit={handleUpdate} isPending={isUpdating} onCancel={() => setEditCatalog(null)} />}
        </DialogContent>
      </Dialog>

      <Card className="border border-border bg-card">
        <CardHeader className="pb-3 border-b border-border bg-muted/40 backdrop-blur rounded-t-xl">
          <CardTitle className="text-base font-semibold">Catálogos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-400">Error al cargar datos.</p>
          ) : filteredCatalogs.length === 0 ? (
            <p className="text-center text-slate-400">Cero resultados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalogs.map((catalog: any) => (
                  <div key={catalog.id} className="group rounded-2xl border border-border bg-card/70 p-4 space-y-3 shadow-xl shadow-black/5 dark:shadow-black/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">ID {catalog.id}</p>
                        <h3 className="text-lg font-semibold leading-tight">{catalog.name}</h3>
                        <p className="text-sm text-muted-foreground">{catalog.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" onClick={() => setEditCatalog(catalog)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(catalog.id)}><Trash2 className="w-4 h-4" /></Button>
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