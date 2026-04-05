import React, { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpenText, Layers3, Pencil, PlusCircle, Search, ServerCrash } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useCatalogs, useCatalogById, useCreateCatalog, useUpdateCatalog, useDeleteCatalog } from '@/hooks/useCatalogs'
import { useCategories } from '@/hooks/useCategories'
import type { Catalog } from '@/types/catalog'

import { Button } from '@/components/ui/button'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'
import { Badge } from '@/components/ui/badge'
import { MultiSelect } from '@/components/ui/multi-select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// â”€â”€â”€ ValidaciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const catalogSchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100),
  descripcion: z.string().optional(),
  categoriaIds: z.array(z.number()).optional(),
})

type FormValues = z.infer<typeof catalogSchema>

// â”€â”€â”€ Formulario reutilizable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CatalogForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
}) {
  const { data: categories = [] } = useCategories()
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues,
  })

  React.useEffect(() => {
    const valuesToReset = {
      ...defaultValues,
      categoriaIds: Array.isArray(defaultValues?.categoriaIds) ? defaultValues.categoriaIds : [],
    }
    reset(valuesToReset)
  }, [defaultValues, reset])

  const categoryOptions = React.useMemo(() => {
    return categories.map(c => ({
      label: c.nombre,
      value: String(c.id),
    }))
  }, [categories])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="nombre"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre</FieldLabel>
            <Input {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="descripcion"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>DescripciÃ³n</FieldLabel>
            <Input {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="categoriaIds"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Categoría (Opcional)</FieldLabel>
            <MultiSelect
              options={categoryOptions}
              selected={field.value ? field.value.map(String) : []}
              onChange={(val) => field.onChange(val.map(Number))} 
              placeholder="Seleccionar categoría..."
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

// â”€â”€â”€ Modal para Crear â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CreateCatalogDialog() {
  const { mutate, isPending } = useCreateCatalog()
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: FormValues) => {
    const autoType = `TIPO_${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    mutate({ ...values, tipo: autoType, valor: values.nombre }, {
      onSuccess: () => {
        toast.success('CatÃ¡logo creado exitosamente')
        setOpen(false)
      },
      onError: err => toast.error(getApiErrorMessage(err, 'Error al crear catÃ¡logo')),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo CatÃ¡logo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AÃ±adir Nuevo CatÃ¡logo</DialogTitle>
          <DialogDescription>
            Ingresa la informaciÃ³n bÃ¡sica del catÃ¡logo.
          </DialogDescription>
        </DialogHeader>
        <CatalogForm
          defaultValues={{ nombre: '', descripcion: '' }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

// â”€â”€â”€ Modal para Editar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EditCatalogDialog({ catalog }: { catalog: Catalog }) {
  const { mutate, isPending } = useUpdateCatalog()
  const [open, setOpen] = useState(false)
  const { data: catalogDetail } = useCatalogById(open ? catalog.id : 0)

  const selectedCategoryIds = useMemo(() => {
    if (Array.isArray(catalogDetail?.categoriaIds) && catalogDetail.categoriaIds.length > 0) {
      return catalogDetail.categoriaIds
    }
    if (Array.isArray(catalog.categoriaIds) && catalog.categoriaIds.length > 0) {
      return catalog.categoriaIds
    }

    const fromDetailCategories = catalogDetail?.categorias?.map(c => c.id) ?? []
    if (fromDetailCategories.length > 0) {
      return fromDetailCategories
    }

    return catalog.categorias?.map(c => c.id) ?? []
  }, [catalogDetail, catalog])

  const handleSubmit = (values: FormValues) => {
    const tipo = catalogDetail?.tipo || catalog.tipo || `TIPO_${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    const valor = catalogDetail?.valor || catalog.valor || values.nombre
    mutate(
      { id: catalog.id, data: { id: catalog.id, ...values, tipo, valor } },
      {
        onSuccess: () => {
          toast.success('CatÃ¡logo actualizado exitosamente')
          setOpen(false)
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar CatÃ¡logo</DialogTitle>
          <DialogDescription>Modifica los datos del catÃ¡logo.</DialogDescription>
        </DialogHeader>
        <CatalogForm
          defaultValues={{
            nombre: catalogDetail?.nombre ?? catalog.nombre,
            descripcion: catalogDetail?.descripcion ?? catalog.descripcion ?? '',
            categoriaIds: selectedCategoryIds,
          }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

// â”€â”€â”€ PÃ¡gina Principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DeleteCatalogButton({ catalogId }: { catalogId: number }) {
  const { mutate } = useDeleteCatalog()
  return (
    <ConfirmDeleteButton
      onConfirm={() =>
        mutate(catalogId, {
          onSuccess: () => toast.success('Catálogo desactivado'),
          onError: err => toast.error(getApiErrorMessage(err, 'Error al desactivar catálogo')),
        })
      }
    />
  )
}

function CatalogCategoryPreview({ categoryNames }: { categoryNames: string[] }) {
  if (categoryNames.length === 0) {
    return <span className="text-sm text-muted-foreground">Sin categorias asociadas</span>
  }

  const visible = categoryNames.slice(0, 3)
  const remaining = categoryNames.length - visible.length

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map(name => (
        <Badge
          key={name}
          variant="secondary"
          className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {name}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-slate-600 dark:text-slate-300">
          +{remaining} mas
        </Badge>
      )}
    </div>
  )
}

export function CatalogsPage() {
  const { data: catalogs, isLoading, isError, error, refetch } = useCatalogs()
  const { data: categories = [] } = useCategories()
  const [searchTerm, setSearchTerm] = useState('')

  const categoriesByCatalog = useMemo(() => {
    const map = new Map<number, string[]>()
    categories.forEach(category => {
      if (!category.catalogoId) return
      const existing = map.get(category.catalogoId) ?? []
      existing.push(category.nombre)
      map.set(category.catalogoId, existing)
    })
    return map
  }, [categories])

  const filtered = useMemo(() => {
    if (!catalogs) return []
    if (!searchTerm) return catalogs
    const term = searchTerm.toLowerCase()
    return catalogs.filter(
      c =>
        c.nombre.toLowerCase().includes(term) ||
        (c.descripcion ?? '').toLowerCase().includes(term)
    )
  }, [catalogs, searchTerm])

  const totalCatalogs = catalogs?.length ?? 0
  const totalCategoriesAssigned = useMemo(() => {
    return (catalogs ?? []).reduce((acc, catalog) => acc + (categoriesByCatalog.get(catalog.id)?.length ?? 0), 0)
  }, [catalogs, categoriesByCatalog])

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-linear-to-r from-slate-50 to-white shadow-sm dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">Gestion de catalogos academicos</CardTitle>
            <CardDescription className="max-w-2xl text-slate-600 dark:text-slate-300">
              Organiza la estructura institucional de catalogos y supervisa, en una sola vista, las categorias asociadas a cada registro.
            </CardDescription>
          </div>
          <CreateCatalogDialog />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Catalogos activos</p>
            <div className="mt-2 flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalCatalogs}</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Categorias vinculadas</p>
            <div className="mt-2 flex items-center gap-2">
              <BookOpenText className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalCategoriesAssigned}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Listado institucional</CardTitle>
            <CardDescription>
              Consulta catalogos, su clasificacion y las categorias que los conforman.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o descripcion"
              className="w-full pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isError ? (
            <Alert variant="destructive" className="mb-4">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error al cargar registros</AlertTitle>
              <AlertDescription>
                {getApiErrorMessage(error, 'Error al cargar')}
                <Button variant="link" onClick={() => refetch()} className="px-2">
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-48">Catalogo</TableHead>
                    <TableHead className="min-w-64">Categorias</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No se encontraron catalogos para el criterio de busqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(catalog => {
                      const categoryNames = categoriesByCatalog.get(catalog.id) ?? []

                      return (
                        <TableRow key={catalog.id}>
                          <TableCell>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{catalog.nombre}</p>
                          </TableCell>
                          <TableCell>
                            <CatalogCategoryPreview categoryNames={categoryNames} />
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">
                            {catalog.descripcion?.trim() ? catalog.descripcion : 'Sin descripcion'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <EditCatalogDialog catalog={catalog} />
                              <DeleteCatalogButton catalogId={catalog.id} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

