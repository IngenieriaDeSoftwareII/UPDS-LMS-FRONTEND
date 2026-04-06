import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PlusCircle,
  Pencil,
  Trash2,
  BookOpen,
  ImageOff,
  Loader2,
  FileText,
  ClipboardList,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient, useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useLessons } from '@/hooks/useLessons'
import { useModuleByCourseId } from '@/hooks/useModules'
import { useCourseById } from '@/hooks/useCourses'
import { useDocumentContents } from '@/hooks/useDocumentContents'
import { useImageContents } from '@/hooks/useImageContents'
import { useHomeWork } from '@/hooks/useHomeWork'
import { useVideoContents } from '@/hooks/useVideoContents'

import { LessonFormDialog } from '@/components/common/LessonFormDialog'
import { AddContentModal } from '@/components/common/AddContentModal'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'
import http from '@/lib/http'
import { getErrorMessage } from '@/lib/api.error'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5024/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

interface TeacherLessonsPageProps {
  courseId?: number
}

export function TeacherLessonsPage({ courseId: propCourseId }: TeacherLessonsPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id: paramId } = useParams()
  const courseId = propCourseId ?? Number(paramId)

  //HOOKS DE DATOS
  const courseQuery = useCourseById(courseId)
  const { data: modules, isLoading: loadingModules } = useModuleByCourseId(courseId)
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const { useVideosList } = useVideoContents()
  const { data: allVideos = [] } = useVideosList()

  // Inicializar modulo seleccionado
  useEffect(() => {
    if (modules && modules.length > 0 && selectedModuleId === null) {
      setSelectedModuleId(modules[0].id)
    }
  }, [modules, selectedModuleId])

  const { useLessonByCourseAndModule, useDeleteLesson } = useLessons()
  const {
    data: lessonsWithContents,
    isLoading: loadingLessons,
    isError: errorLessons
  } = useLessonByCourseAndModule(courseId, selectedModuleId ?? 0)

  // Fetch imágenes del curso para mostrarlas inline
  const { data: allImages } = useQuery({
    queryKey: ['imagesByCourse', courseId],
    queryFn: () => http.get(`/ImageContents/GetByCourse/${courseId}`).then(res => res.data),
    enabled: !!courseId
  })

  const deleteLesson = useDeleteLesson()
  const { useDeleteDocument } = useDocumentContents()
  const deleteDocument = useDeleteDocument()
  const { useDeleteImage } = useImageContents()
  const deleteImage = useDeleteImage()
  const { remove: deleteHomework } = useHomeWork()
  const { useDeleteVideo } = useVideoContents()
  const deleteVideo = useDeleteVideo()

  // ESTADO DE MODALES
  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  // LÓGICA DE HERRO IMAGE 
  const resolveImageUrl = (course: any) => {
    const raw = course?.imagen_url || course?.imagenUrl
    if (!raw) return ''
    if (/^https?:\/\//i.test(raw)) return raw
    return `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`
  }
  const heroImage = useMemo(() => resolveImageUrl(courseQuery.data), [courseQuery.data])
  const [brokenHero, setBrokenHero] = useState(false)

  // MANEJADORES
  const handleOpenDoc = async (id: number) => {
    try {
      const res = await http.get(`/DocumentContents/GetSasUrl/${id}`)
      window.open(res.data.url, '_blank')
    } catch {
      toast.error('Error al abrir el documento')
    }
  }

  const handleOpenImage = async (id: number) => {
    try {
      const match = allImages?.find((i: any) => i.contentId === id)
      if (match && match.imageUrl) window.open(match.imageUrl, '_blank')
      else {
        const res = await http.get(`/ImageContents/GetByCourse/${courseId}`)
        const img = res.data.find((i: any) => i.contentId === id)
        if (img && img.imageUrl) {
          window.open(img.imageUrl, '_blank')
        } else {
          toast.error('Imagen no encontrada')
        }
      }
    } catch {
      toast.error('Error al abrir la imagen')
    }
  }

  const handleDeleteContent = (
    type: 'document' | 'image' | 'homework' | 'video',
    id: number
  ) => {
    if (!confirm(`¿Estás seguro de eliminar este ${type}?`)) return

    const mutation =
      type === 'document'
        ? deleteDocument
        : type === 'image'
          ? deleteImage
          : type === 'video'
            ? deleteVideo
            : deleteHomework

    mutation.mutate(id, {
      onSuccess: () => {
        const labels = {
          document: 'Documento',
          image: 'Imagen',
          video: 'Video',
          homework: 'Tarea'
        }

        toast.success(`${labels[type]} eliminado`)

        // KEY CORRECTA
        queryClient.invalidateQueries({
          queryKey: ['lessonsByCourseAndModule', courseId, selectedModuleId]
        })

        queryClient.invalidateQueries({
          queryKey: ['imagesByCourse', courseId]
        })

        queryClient.invalidateQueries({
          queryKey: ['videos']
        })
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, 'Error al eliminar'))
    })
  }

  const handleSelectContentType = (
    type: 'document' | 'image' | 'homework' | 'video'
  ) => {
    if (!selectedLessonId) return

    if (type === 'homework') {
      navigate(`/teacher/homework/create?lessonId=${selectedLessonId}&courseId=${courseId}`)
      return
    }

    if (type === 'video') {
      navigate(`/teacher/videos/create?lessonId=${selectedLessonId}&courseId=${courseId}`)
      return
    }

    const path = type === 'document' ? 'documents' : 'images'
    navigate(`/teacher/${path}/upload?lessonId=${selectedLessonId}&courseId=${courseId}`)
  }

  //RENDERIZADO
  if (!courseId || isNaN(courseId)) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>ID de curso inválido</AlertTitle>
          <AlertDescription>No se pudo determinar el curso del cual gestionar lecciones.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (courseQuery.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  const course = courseQuery.data

  return (
    <div className="space-y-6 p-6">
      {/* HEADER / BACK NAV */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/teacher/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cursos
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Gestión de Contenidos</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <Card className="overflow-hidden border border-border shadow-sm">
        <div className="relative h-48 w-full bg-muted/60 md:h-56">
          {heroImage && !brokenHero ? (
            <img
              src={heroImage}
              alt={course?.titulo}
              className="h-full w-full object-cover"
              onError={() => setBrokenHero(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-8 w-8" /> Sin imagen de curso
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="mb-2 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                {course?.nivel ?? 'Nivel no definido'}
              </span>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                {course?.titulo ?? 'Cargando curso...'}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingLesson(null)
                  setLessonModalOpen(true)
                }}
                className="gap-2 shadow-lg"
              >
                <PlusCircle className="h-4 w-4" /> Nueva Lección
              </Button>
            </div>
          </div>
        </div>

        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Programa del Curso</CardTitle>
              <CardDescription>
                Administra los módulos, lecciones y recursos didácticos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* MÓDULOS SELECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold flex items-center gap-2">
                Seleccionar Módulo:
                {loadingModules && <Loader2 className="h-3 w-3 animate-spin" />}
              </label>
            </div>

            <div className="flex gap-2">
              <select
                className="flex-1 border rounded-lg p-2.5 bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition"
                value={selectedModuleId ?? ''}
                onChange={(e) => setSelectedModuleId(Number(e.target.value))}
              >
                {modules?.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.titulo}
                  </option>
                ))}
                {(!modules || modules.length === 0) && !loadingModules && (
                  <option value="">No hay módulos creados</option>
                )}
              </select>

              {/*  EDITAR */}
              <Button
                variant="outline"
                size="icon"
                disabled={!selectedModuleId}
                onClick={() => navigate(`/teacher/modules/edit/${selectedModuleId}`)}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              {/*  CREAR */}
              <Button
                variant="default"
                size="icon"
                onClick={() => navigate(`/teacher/modules/create?courseId=${courseId}`)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* LECCIONES LIST */}
          <div className="space-y-4">
            {loadingLessons ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : errorLessons ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No se pudieron cargar las lecciones del módulo.</AlertDescription>
              </Alert>
            ) : !selectedModuleId ? (
              <div className="text-center py-10 border-2 border-dashed rounded-xl border-border/40">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Selecciona un módulo para gestionar sus lecciones</p>
              </div>
            ) : !lessonsWithContents || lessonsWithContents.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-xl border-border/40">
                <p className="text-sm text-muted-foreground mb-4">Este módulo no tiene lecciones aún</p>
                <Button variant="outline" size="sm" onClick={() => { setEditingLesson(null); setLessonModalOpen(true); }}>
                  Crear primera lección
                </Button>
              </div>
            ) : (
              <ul className="space-y-6">
                {lessonsWithContents.map((lesson) => {
                  const contenidos = [
                    ...(lesson.contents || []).map((c: any) => {
                      const typeLower = c.type?.toLowerCase?.() || ''

                      //  BUSCAR EL VIDEO REAL EN allVideos
                      const videoMatch = allVideos.find(
                        (v: any) => v.content?.id === c.id
                      )

                      const videoUrl = videoMatch?.videoUrl || null
                      const isVideo = !!videoMatch

                      const isImage =
                        !isVideo &&
                        (typeLower.includes('image') ||
                          typeLower.includes('imagen') ||
                          c.type === '2')

                      let resolvedUrl = null

                      // 🖼️ IMAGEN
                      if (isImage && allImages) {
                        const match = allImages.find((i: any) => i.contentId === c.id)
                        resolvedUrl = match?.imageUrl
                      }

                      // 🎬 VIDEO
                      if (isVideo) {
                        resolvedUrl = videoUrl
                      }

                      return {
                        type: isVideo ? 'video' : isImage ? 'image' : 'document',

                        id: c.id, //  ESTE es el contentId (NO TOCAR)

                        videoId: videoMatch?.contentId, // AGREGA ESTA LÍNEA

                        title:
                          c.title ||
                          (isImage ? 'Imagen' : isVideo ? 'Video' : 'Documento'),

                        order: c.order || 0,
                        url: resolvedUrl
                      }
                    }),

                    ...(lesson.homeworks || []).map((hw: any) => ({
                      type: 'homework',
                      id: hw.id,
                      title: hw.titulo,
                      order: 999,
                      url: null
                    }))
                  ].sort((a, b) => a.order - b.order)

                  return (
                    <li
                      key={lesson.id}
                      className="bg-card/50 rounded-lg p-4 transition hover:bg-muted/40"
                    >
                      {/* HEADER */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-muted-foreground mt-1">
                            #{lesson.order}
                          </span>

                          <div>
                            <h3 className="font-semibold text-base">
                              {lesson.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {lesson.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedLessonId(lesson.id)
                              setContentModalOpen(true)
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingLesson(lesson)
                              setLessonModalOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <ConfirmDeleteButton
                            onConfirm={() => deleteLesson.mutate(lesson.id)}
                          />
                        </div>
                      </div>

                      {/* CONTENTS */}
                      {contenidos.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          Sin contenidos
                        </p>
                      ) : (
                        <div className="divide-y divide-border/40">
                          {contenidos.map((item) => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="py-2 px-2 rounded-md transition hover:bg-muted/30"
                            >

                              {/* 🎬 VIDEO */}
                              {item.type === 'video' && item.url ? (
                                <div className="flex flex-col gap-2">

                                  {/* SOLO VIDEO */}
                                  {item.url ? (
                                    <video
                                      key={item.url}
                                      src={item.url}
                                      controls
                                      className="w-full max-w-md rounded-lg shadow-sm"
                                      onError={() => console.log('❌ Error cargando video:', item.url)}
                                    />
                                  ) : (
                                    <span className="text-xs text-red-500">
                                      Video no disponible ❌
                                    </span>
                                  )}

                                  {/* ACCIONES */}
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        navigate(`/teacher/videos/edit/${item.id}`)
                                      }
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>

                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        handleDeleteContent(
                                          item.type as any,
                                          item.type === 'video' ? item.id : item.id
                                        )
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                /* RESTO */
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">

                                    {/* DOCUMENTO */}
                                    {item.type === 'document' && (
                                      <>
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <span
                                          className="text-sm cursor-pointer hover:underline"
                                          onClick={() => handleOpenDoc(item.id)}
                                        >
                                          {item.title}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                          Documento
                                        </span>
                                      </>
                                    )}

                                    {/* TAREA */}
                                    {item.type === 'homework' && (
                                      <>
                                        <ClipboardList className="w-4 h-4 text-orange-500" />
                                        <span
                                          className="text-sm cursor-pointer hover:underline"
                                          onClick={() => navigate(`/teacher/homework/submissions/${item.id}`)}
                                        >
                                          {item.title}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-50 text-orange-700">
                                          Tarea
                                        </span>
                                      </>
                                    )}

                                    {/* IMAGEN */}
                                    {item.type === 'image' && (
                                      <>
                                        {item.url ? (
                                          <img
                                            src={item.url}
                                            className="w-16 h-12 object-cover rounded-md cursor-pointer"
                                            onClick={() => handleOpenImage(item.id)}
                                          />
                                        ) : (
                                          <ImageOff className="w-4 h-4 text-muted-foreground" />
                                        )}
                                        <span className="text-sm">{item.title}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                          Imagen
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  {/* ACCIONES */}
                                  <div className="flex gap-1 opacity-70 hover:opacity-100 transition">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        if (item.type === 'homework') {
                                          navigate(`/teacher/homework/edit/${item.id}?courseId=${courseId}`)
                                          return
                                        }

                                        if (item.type === 'video') {
                                          navigate(`/teacher/videos/edit/${item.id}?courseId=${courseId}`)
                                          return
                                        }

                                        const path =
                                          item.type === 'document'
                                            ? 'documents'
                                            : 'images'

                                        navigate(`/teacher/${path}/edit/${item.id}?courseId=${courseId}`)
                                      }}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>

                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        handleDeleteContent(item.type as any, item.id)
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MODALES */}
      <LessonFormDialog
        open={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        lesson={editingLesson}
        modules={modules}
      />

      <AddContentModal
        open={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        lessonId={selectedLessonId!}
        onSelect={handleSelectContentType}
      />
    </div>
  )
}