import { useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Pencil, ServerCrash, Search } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api.error'

import { useCategories, useCreateCategory, useUpdateCategory } from '@/hooks/useCategories'
import type { Category } from '@/types/category'

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

const categorySchema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100),
  descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof categorySchema>

// ─── Formulario reutilizable ──────────────────────────────────────────────────

function CategoryForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  isPending: boolean
}) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="nombre"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre de la Categoría</FieldLabel>
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

function CreateCategoryDialog() {
  const { mutate, isPending } = useCreateCategory()
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess: () => {
        toast.success('Categoría creada exitosamente')
        setOpen(false)
      },
      onError: err => toast.error(getApiErrorMessage(err, 'Error al crear la categoría')),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Nueva Categoría
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Categoría</DialogTitle>
          <DialogDescription>
            Ingresa la información básica de la categoría.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          defaultValues={{ nombre: '', descripcion: '' }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal para Editar ────────────────────────────────────────────────────────

function EditCategoryDialog({ category }: { category: Category }) {
  const { mutate, isPending } = useUpdateCategory()
  const [open, setOpen] = useState(false)

  const handleSubmit = (values: FormValues) => {
    mutate(
      { id: category.id, data: values },
      {
        onSuccess: () => {
          toast.success('Categoría actualizada')
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
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>Modifica los datos de la categoría.</DialogDescription>
        </DialogHeader>
        <CategoryForm
          defaultValues={{
            nombre: category.nombre,
            descripcion: category.descripcion ?? '',
          }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export function CategoriesPage() {
  const { data: categories, isLoading, isError, error, refetch } = useCategories()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    if (!categories) return []
    if (!searchTerm) return categories
    const term = searchTerm.toLowerCase()
    return categories.filter(c => c.nombre.toLowerCase().includes(term))
  }, [categories, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
          <p className="text-muted-foreground">Administra las categorías de cursos.</p>
        </div>
        <CreateCategoryDialog />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-xl">Listado</CardTitle>
            <CardDescription>Visualiza las categorías registradas.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar categoría..."
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
                {getApiErrorMessage(error, 'Error al cargar categorías')}
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
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No se encontraron categorías.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(category => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.nombre}</TableCell>
                        <TableCell>{category.descripcion || '-'}</TableCell>
                        <TableCell className="text-right">
                          <EditCategoryDialog category={category} />
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
