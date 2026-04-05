import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

import { useVideoContents } from '@/hooks/useVideoContents'
import { useLessons } from '@/hooks/useLessons'
import { useModules } from '@/hooks/useModules'
import { useCoursesPrueba } from '@/hooks/useCoursesPrueba'

export function VideosPage() {
  const navigate = useNavigate()

  const { useVideosList, useDeleteVideo } = useVideoContents()
  const { useLessonsList } = useLessons()

  const { data = [] } = useVideosList()
  const { data: lessons = [] } = useLessonsList()
  const { data: modules = [] } = useModules()
  const { data: courses = [] } = useCoursesPrueba()

  const { mutate: deleteVideo } = useDeleteVideo()
    console.log('VIDEOS 👉', data)
  const lessonsMap = Object.fromEntries(lessons.map(l => [l.id, l]))
  const modulesMap = Object.fromEntries(modules.map(m => [m.id, m]))
  const coursesMap = Object.fromEntries(courses.map(c => [c.id, c]))

  return (
    <div className="space-y-6">

      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Videos</h2>

        <Button onClick={() => navigate('/admin/videos/upload')}>
          + Subir Video
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No hay videos</TableCell>
                </TableRow>
              )}
                
              {data.map((v: any) => {
                const lesson = lessonsMap[v.content?.lessonId]
                const module = lesson ? modulesMap[lesson.moduleId] : null
                const course = module ? coursesMap[module.cursoId] : null
                console.log('VIDEO ITEM 👉', v)
                return (
                  <TableRow key={v.contentId}>
                    <TableCell>{v.contentId}</TableCell>

                    <TableCell>
                      {course?.titulo || '—'} / {module?.titulo || '—'} / {lesson?.title || '—'}
                    </TableCell>

                    <TableCell>
                    {!v.urlVideo ? (
                        <span className="text-red-500 text-sm">
                        Sin video ❌
                        </span>
                    ) : (
                        <video
                        key={v.urlVideo}
                        src={v.urlVideo}
                        controls
                        className="w-48 rounded border"
                        onError={() => console.log('❌ Error cargando video:', v.urlVideo)}
                        />
                    )}
                    </TableCell>

                    <TableCell>{v.duracionSeg}s</TableCell>
                    <TableCell>{v.content?.order}</TableCell>

                    <TableCell className="flex gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/admin/videos/edit/${v.contentId}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteVideo(v.contentId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>

                  </TableRow>
                )
              })}
            </TableBody>

          </Table>
        </CardContent>
      </Card>
    </div>
  )
}