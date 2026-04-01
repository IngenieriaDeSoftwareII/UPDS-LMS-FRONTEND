import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, ServerCrash, Search } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useCatalogs, useCreateCatalog, useUpdateCatalog } from '@/hooks/useCatalogs'
import type { Catalog } from '@/types/catalog'

import { Button } from '@/components/ui/button'
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

// ─── Validación ──────────────────────────────────────────────────────────────

const catalogSchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100),
  tipo: z.string().min(1, 'Requerido').max(50),
  valor: z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof catalogSchema>

// ─── Formulario reutilizable ──────────────────────────────────────────────────

function CatalogForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
}) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues,
  })

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

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="tipo"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Tipo</FieldLabel>
              <Input {...field} placeholder="Ej. CATEGORY, STATUS..." />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="valor"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Valor</FieldLabel>
              <Input {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="descripcion"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Descripción</FieldLabel>
            <Input {...field} />
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

// ─── Modal para Crear ─────────────────────────────────────────────────────────

function CreateCatalogDialog() {
  const { mutate, isPending } = useCreateCatalog()
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess: () => {
        toast.success('Catálogo creado exitosamente')
        setOpen(false)
      },
      onError: err => toast.error(getApiErrorMessage(err, 'Error al crear catálogo')),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Catálogo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Catálogo</DialogTitle>
          <DialogDescription>
            Ingresa la información básica del catálogo.
          </DialogDescription>
        </DialogHeader>
        <CatalogForm
          defaultValues={{ nombre: '', tipo: '', valor: '', descripcion: '' }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal para Editar ────────────────────────────────────────────────────────

function EditCatalogDialog({ catalog }: { catalog: Catalog }) {
  const { mutate, isPending } = useUpdateCatalog()
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: FormValues) => {
    mutate(
      { id: catalog.id, data: values },
      {
        onSuccess: () => {
          toast.success('Catálogo actualizado exitosamente')
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
          <DialogTitle>Editar Catálogo</DialogTitle>
          <DialogDescription>Modifica los datos del catálogo.</DialogDescription>
        </DialogHeader>
        <CatalogForm
          defaultValues={{
            nombre: catalog.nombre,
            tipo: catalog.tipo,
            valor: catalog.valor,
            descripcion: catalog.descripcion ?? '',
          }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export function CatalogsPage() {
  const { data: catalogs, isLoading, isError, error, refetch } = useCatalogs()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    if (!catalogs) return []
    if (!searchTerm) return catalogs
    const term = searchTerm.toLowerCase()
    return catalogs.filter(
      c => c.nombre.toLowerCase().includes(term) || c.tipo.toLowerCase().includes(term)
    )
  }, [catalogs, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Catálogos</h2>
          <p className="text-muted-foreground">Administra los catálogos del sistema.</p>
        </div>
        <CreateCatalogDialog />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-xl">Listado</CardTitle>
            <CardDescription>Visualiza los catálogos registrados.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar catálogo..."
              className="pl-8 w-full"
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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron catálogos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(catalog => (
                      <TableRow key={catalog.id}>
                        <TableCell className="font-medium">{catalog.nombre}</TableCell>
                        <TableCell>{catalog.tipo}</TableCell>
                        <TableCell>{catalog.valor}</TableCell>
                        <TableCell>{catalog.descripcion || '-'}</TableCell>
                        <TableCell className="text-right">
                          <EditCatalogDialog catalog={catalog} />
                        </TableCell>
                      </TableRow>
                    ))
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
