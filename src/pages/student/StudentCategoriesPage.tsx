import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookMarked, FolderTree, Search, ServerCrash, Sparkles } from 'lucide-react'

import { getApiErrorMessage } from '@/lib/api.error'
import { useCategories } from '@/hooks/useCategories'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function StudentCategoriesPage() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading, isError, error, refetch } = useCategories()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return categories
    return categories.filter(category => category.nombre.toLowerCase().includes(term) || category.descripcion?.toLowerCase().includes(term))
  }, [categories, searchTerm])

  const withDescription = useMemo(() => categories.filter(category => !!category.descripcion).length, [categories])

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_28%)] text-amber-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_24%),linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(15,23,42,1)_100%)] dark:text-amber-100">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-4xl border border-border/70 bg-card/85 p-5 shadow-lg shadow-black/5 backdrop-blur dark:border-amber-400/20 dark:bg-slate-900/85 dark:text-slate-100">
        <div className="flex items-center gap-4">
          <div className="rounded-3xl bg-amber-500/10 p-4 text-amber-600 dark:border dark:border-amber-400/20 dark:bg-amber-400/15 dark:text-amber-200">
            <FolderTree className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">Pestaña activa</p>
            <h1 className="text-3xl font-semibold text-amber-900 dark:text-amber-100 md:text-4xl">Categorías</h1>
            <p className="text-base text-amber-800 dark:text-amber-200">Explora temas antes de entrar al curso</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="h-11 gap-2 px-5 text-base bg-amber-400 text-slate-950 hover:bg-amber-300 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200">
            <FolderTree className="h-4 w-4" /> Categorías
          </Button>
          <Button variant="outline" className="h-11 gap-2 px-5 text-base border-sky-500/30 text-sky-800 hover:bg-sky-50 dark:border-sky-400/30 dark:text-sky-200 dark:hover:bg-sky-950/60" onClick={() => navigate('/student/courses-list')}>
            <BookMarked className="h-4 w-4" /> Cursos
          </Button>
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5 rounded-4xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-black/5 lg:sticky lg:top-6 lg:h-fit dark:border-amber-400/20 dark:bg-slate-900/85 dark:shadow-black/30">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">Resumen</p>
            <h2 className="text-3xl font-semibold text-amber-900 dark:text-amber-100">Navegación temática</h2>
            <p className="text-base leading-7 text-amber-800 dark:text-amber-200">
              Esta pantalla funciona como un mapa: eliges una categoría y luego entras a sus cursos.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-3xl border border-border bg-muted/40 p-5 dark:border-amber-400/15 dark:bg-amber-400/8">
              <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Categorías</p>
              <p className="mt-2 text-4xl font-semibold text-amber-900 dark:text-amber-200">{categories.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/40 p-5 dark:border-sky-400/15 dark:bg-sky-400/8">
              <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Con descripción</p>
              <p className="mt-2 text-4xl font-semibold text-amber-900 dark:text-amber-200">{withDescription}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/40 p-5 dark:border-emerald-400/15 dark:bg-emerald-400/8">
              <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Visibles</p>
              <p className="mt-2 text-4xl font-semibold text-amber-900 dark:text-amber-200">{filtered.length}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-500/15 bg-amber-500/8 p-5 dark:border-amber-300/20 dark:bg-amber-400/10">
            <div className="flex items-center gap-2 text-base font-medium text-amber-800 dark:text-amber-200">
              <Sparkles className="h-4 w-4" /> Vista actual
            </div>
            <p className="mt-2 text-base leading-7 text-amber-800 dark:text-amber-200">
              La categoría activa está resaltada por la pestaña superior, no por el contenido de las tarjetas.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground dark:text-slate-400" />
            <Input
              placeholder="Buscar categorías..."
              className="h-12 pl-9 text-base dark:border-amber-400/20 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </aside>

        <Card className="overflow-hidden border border-border/70 shadow-lg shadow-black/5 dark:border-amber-400/20 dark:bg-slate-900/85 dark:shadow-black/30">
          <CardHeader className="border-b border-border/70 bg-linear-to-r from-amber-50 via-background to-background pb-4 dark:border-amber-400/20 dark:from-amber-950/35 dark:via-slate-900 dark:to-slate-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-3xl text-amber-900 dark:text-amber-100">Categorías disponibles</CardTitle>
                <CardDescription className="text-base text-amber-800 dark:text-amber-200">Selecciona una categoría para abrir sus cursos.</CardDescription>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground dark:border-amber-400/20 dark:bg-slate-950/80 dark:text-slate-300">
                <Sparkles className="h-4 w-4" /> Datos en solo lectura
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 dark:bg-slate-900/70">
            {isError ? (
            <Alert variant="destructive" className="mb-4">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error al cargar registros</AlertTitle>
              <AlertDescription className="flex items-center gap-2">
                {getApiErrorMessage(error, 'Error al cargar las categorías')}
                <Button variant="link" size="sm" onClick={() => refetch()}>Reintentar</Button>
              </AlertDescription>
            </Alert>
            ) : isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 p-10 text-center text-muted-foreground dark:border-amber-400/20 dark:bg-slate-950/60 dark:text-slate-300">
                <div className="mb-3 rounded-full bg-amber-500/10 p-4 text-amber-700 dark:border dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                  <FolderTree className="h-6 w-6" />
                </div>
                No se encontraron categorías con ese criterio.
              </div>
            ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filtered.map((category, index) => (
                <Card
                  key={category.id}
                  className={`group overflow-hidden border border-border/70 bg-linear-to-br ${index % 2 === 0 ? 'from-amber-50 via-card to-card dark:from-amber-950/35 dark:via-slate-900 dark:to-slate-950' : 'from-sky-50 via-card to-card dark:from-sky-950/35 dark:via-slate-900 dark:to-slate-950'} shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-amber-400/20 dark:shadow-black/30`}
                >
                  <CardContent className="grid gap-5 p-6 sm:grid-cols-[112px_minmax(0,1fr)]">
                    <div className="flex items-center justify-center rounded-3xl border border-border bg-background p-6 text-amber-600 shadow-inner dark:border-amber-400/20 dark:bg-slate-950/80 dark:text-amber-200">
                      <FolderTree className="h-12 w-12" />
                    </div>
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground dark:border-amber-400/20 dark:bg-slate-950/80 dark:text-slate-300">
                          Categoría {String(category.id).padStart(2, '0')}
                        </span>
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
                          Ruta temática
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-3xl font-semibold leading-tight text-amber-900 dark:text-amber-100">{category.nombre}</h3>
                        <p className="line-clamp-3 text-base leading-7 text-amber-800 dark:text-amber-200">
                          {category.descripcion || 'Sin descripción'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-amber-700 dark:text-amber-300">ID: {category.id}</p>
                        <Button variant="outline" className="h-11 gap-2 px-5 text-base border-amber-500/25 text-amber-800 hover:bg-amber-50 dark:border-amber-400/25 dark:text-amber-200 dark:hover:bg-amber-400/10">
                          Ver cursos <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}