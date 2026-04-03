import { useMemo, useState } from 'react'
import { Layers, Search, ServerCrash, Sparkles, Tags } from 'lucide-react'

import { getApiErrorMessage } from '@/lib/api.error'
import { useCatalogs } from '@/hooks/useCatalogs'

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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function StudentCatalogsPage() {
  const { data: catalogs = [], isLoading, isError, error, refetch } = useCatalogs()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return catalogs.filter(catalog => {
      const matchesSearch = term
        ? catalog.nombre.toLowerCase().includes(term) || catalog.valor.toLowerCase().includes(term)
        : true
      const matchesType = typeFilter ? catalog.tipo === typeFilter : true
      return matchesSearch && matchesType
    })
  }, [catalogs, searchTerm, typeFilter])

  const uniqueTypes = useMemo(() => Array.from(new Set(catalogs.map(cat => cat.tipo))).sort(), [catalogs])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-inner">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Catálogos</p>
            <h1 className="text-2xl font-bold">Listado de catálogos</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} resultado(s) • {catalogs.length} totales</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o valor..."
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={typeFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(null)}
            >
              Todos
            </Button>
            {uniqueTypes.map(type => (
              <Button
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Tipos únicos</p>
            <p className="text-lg font-semibold">{uniqueTypes.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Tags className="h-5 w-5 text-sky-600 dark:text-sky-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Registros</p>
            <p className="text-lg font-semibold">{catalogs.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 shadow-inner">
          <Layers className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          <div>
            <p className="text-xs uppercase text-muted-foreground">Filtrados</p>
            <p className="text-lg font-semibold">{filtered.length}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Catálogos activos</CardTitle>
            <CardDescription>Explora los catálogos disponibles para tus procesos académicos.</CardDescription>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Datos en solo lectura
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isError ? (
            <Alert variant="destructive" className="mb-4">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error al cargar registros</AlertTitle>
              <AlertDescription className="flex items-center gap-2">
                {getApiErrorMessage(error, 'Error al cargar los catálogos')}
                <Button variant="link" size="sm" onClick={() => refetch()}>Reintentar</Button>
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              No se encontraron catálogos con ese criterio.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(catalog => (
                <Card key={`${catalog.tipo}-${catalog.id}`} className="border border-border bg-card/80 shadow-sm">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{catalog.tipo}</div>
                      <Badge variant="outline" className="text-xs font-medium">ID {catalog.id}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-semibold">{catalog.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-semibold">{catalog.valor}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {catalog.descripcion || 'Sin descripción'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
