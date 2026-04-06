import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, FolderOpen, Search, ServerCrash } from 'lucide-react'

import { useCourses } from '@/hooks/useCourses'
import { useCategories } from '@/hooks/useCategories'
import { getApiErrorMessage } from '@/lib/api.error'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function CourseCatalog() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')

  const { data: courses = [], isLoading: loadingCourses, isError: errorCourses, error: coursesError } = useCourses()
  const { data: categories = [], isLoading: loadingCategories, isError: errorCategories, error: categoriesError } = useCategories()

  const selectedCategoryId = Number(params.get('categoria') || 0) || null
  const isLoading = loadingCourses || loadingCategories
  const isError = errorCourses || errorCategories
  const selectedCategory = useMemo(
    () => categories.find(category => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  )

  const publishedCourses = useMemo(() => courses.filter(course => course.publicado), [courses])

  const categoryCards = useMemo(() => {
    return categories
      .map(category => ({
        ...category,
        cursos: publishedCourses.filter(course => course.categoriaId === category.id),
      }))
      .filter(category => category.cursos.length > 0)
  }, [categories, publishedCourses])

  const globalSearchedCourses = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return []

    return publishedCourses.filter(course => {
      const categoryName = categories.find(category => category.id === course.categoriaId)?.nombre ?? ''
      return (
        (course.titulo ?? '').toLowerCase().includes(term) ||
        (course.descripcion ?? '').toLowerCase().includes(term) ||
        categoryName.toLowerCase().includes(term)
      )
    })
  }, [publishedCourses, categories, search])

  const selectedCategoryCourses = useMemo(() => {
    if (!selectedCategoryId) return []
    const term = search.trim().toLowerCase()
    const list = publishedCourses.filter(course => course.categoriaId === selectedCategoryId)
    if (!term) return list
    return list.filter(course => (course.titulo ?? '').toLowerCase().includes(term) || (course.descripcion ?? '').toLowerCase().includes(term))
  }, [publishedCourses, selectedCategoryId, search])

  const backToCategories = () => {
    const next = new URLSearchParams(params)
    next.delete('categoria')
    setParams(next)
    setSearch('')
  }

  const openCategory = (categoryId: number) => {
    const next = new URLSearchParams(params)
    next.set('categoria', String(categoryId))
    setParams(next)
    setSearch('')
  }

  return (
    <div className="space-y-6 p-6">
      <div
        className={`rounded-2xl border p-4 shadow-sm md:p-5 ${
          selectedCategoryId
            ? 'border-sky-200 bg-linear-to-r from-sky-50 to-white dark:border-sky-900/50 dark:from-sky-950/40 dark:to-background'
            : 'border-amber-200 bg-linear-to-r from-amber-50 to-white dark:border-amber-900/50 dark:from-amber-950/30 dark:to-background'
        }`}
      >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-2xl border p-3 shadow-inner ${
              selectedCategoryId
                ? 'border-sky-300/60 bg-sky-100 text-sky-700 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                : 'border-amber-300/60 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            }`}
          >
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {selectedCategoryId ? 'Ruta de aprendizaje' : 'Catalogo'}
            </p>
            <h1 className="text-2xl font-bold">{selectedCategoryId ? 'Cursos por categoria' : 'Categorias de cursos'}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedCategoryId ? 'Selecciona un curso para ver detalle e inscribirte.' : 'Primero selecciona una categoria para ver sus cursos.'}
            </p>
            {selectedCategoryId && selectedCategory && (
              <p className="mt-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                Categoria activa: {selectedCategory.nombre}
              </p>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {selectedCategoryId && (
            <Button variant="outline" onClick={backToCategories}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          )}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar curso..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      </div>

      <Card
        className={`border shadow-sm ${
          selectedCategoryId
            ? 'border-sky-200/70 bg-card dark:border-sky-900/40'
            : 'border-amber-200/70 bg-card dark:border-amber-900/40'
        }`}
      >
        <CardHeader
          className={`border-b ${
            selectedCategoryId
              ? 'border-sky-200/70 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-950/20'
              : 'border-amber-200/70 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20'
          }`}
        >
          <CardTitle className="text-lg">
            {selectedCategoryId
              ? 'Cursos disponibles'
              : search.trim()
                ? 'Resultados de cursos'
                : 'Categorias disponibles'}
          </CardTitle>
          <CardDescription>
            {selectedCategoryId
              ? 'Haz clic en un curso para continuar con la inscripcion.'
              : search.trim()
                ? 'Estos cursos coinciden con tu busqueda, sin necesidad de entrar categoria por categoria.'
                : 'Ingresa a una categoria para ver sus cursos.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isError ? (
            <Alert variant="destructive">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error al cargar datos</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-2">
                {getApiErrorMessage(coursesError ?? categoriesError, 'No se pudo cargar la informacion')}
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-2xl" />
              ))}
            </div>
          ) : selectedCategoryId ? (
            selectedCategoryCourses.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Sin cursos en esta categoria</CardTitle>
                  <CardDescription>No se encontraron cursos para el criterio actual.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={backToCategories}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a categorias
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedCategoryCourses.map(course => (
                  <Card
                    key={course.id}
                    className="cursor-pointer border border-sky-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-sky-900/50 dark:bg-slate-950/30"
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                  >
                    <CardContent className="space-y-3 p-4">
                      <p className="line-clamp-2 text-lg font-semibold">{course.titulo}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{course.descripcion || 'Sin descripcion'}</p>
                      <Button className="w-full">Ver curso e inscribirme</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : search.trim() ? (
            globalSearchedCourses.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Sin cursos encontrados</CardTitle>
                  <CardDescription>No hay cursos que coincidan con la busqueda actual.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Limpiar busqueda
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {globalSearchedCourses.map(course => {
                  const categoryName = categories.find(category => category.id === course.categoriaId)?.nombre

                  return (
                    <Card
                      key={course.id}
                      className="cursor-pointer border border-sky-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-sky-900/50 dark:bg-slate-950/30"
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                    >
                      <CardContent className="space-y-3 p-4">
                        <p className="line-clamp-2 text-lg font-semibold">{course.titulo}</p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{course.descripcion || 'Sin descripcion'}</p>
                        {categoryName && (
                          <p className="text-xs text-sky-700 dark:text-sky-300">Categoria: {categoryName}</p>
                        )}
                        <Button className="w-full">Ver curso e inscribirme</Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          ) : (
            categoryCards.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Sin categorias disponibles</CardTitle>
                  <CardDescription>No hay categorias con cursos publicados para mostrar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setSearch('')}>
                    Limpiar busqueda
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryCards.map(category => (
                  <Card key={category.id} className="border border-amber-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900/50 dark:bg-slate-950/20">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <p className="line-clamp-2 text-lg font-semibold">{category.nombre}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          <FolderOpen className="h-3 w-3" /> {category.cursos.length}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{category.descripcion || 'Sin descripcion'}</p>
                      <Button className="w-full" onClick={() => openCategory(category.id)}>
                        Ver cursos de esta categoria
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
