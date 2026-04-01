import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { useAdminTeachersReport } from '@/hooks/useReports'
import { reportsService } from '@/services/reports.service'
import { downloadBlob, filenameFromContentDisposition } from '@/lib/download'

export function AdminTeacherReportsPage() {
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const [sortColumn, setSortColumn] = useState<string>('totalEnrollments')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading, error } = useAdminTeachersReport({
    from: from || undefined,
    to: to || undefined,
  })

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    try {
      setIsExporting(true)
      const res = await reportsService.exportAdminTeachers(format, { from: from || undefined, to: to || undefined })
      const cd = res.headers?.['content-disposition'] as string | undefined
      const name = filenameFromContentDisposition(cd) ?? `admin-teachers.${format}`
      downloadBlob(res.data, name)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const sortedTeachers = useMemo(() => {
    if (!data?.teachers) return []
    return [...data.teachers].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof typeof a]
      let bVal: any = b[sortColumn as keyof typeof b]
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data?.teachers, sortColumn, sortDirection])

  const coursesUploadedByMonth = useMemo(() => {
    const courses = data?.teachers?.flatMap(t => t.courses) ?? []
    if (!courses.length) return []

    const bucket = new Map<string, { year: number; month: number; count: number }>()
    for (const c of courses) {
      if (c.createdAt) {
        const date = new Date(c.createdAt)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const key = `${year}-${String(month).padStart(2, '0')}`
        const prev = bucket.get(key)
        if (!prev) {
          bucket.set(key, { year, month, count: 1 })
        } else {
          prev.count += 1
        }
      }
    }

    return Array.from(bucket.entries())
      .map(([key, v]) => ({
        name: key,
        coursesUploaded: v.count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const enrollmentsByTeacher = useMemo(() => {
    return (
      data?.teachers?.map(t => ({
        name: t.teacherName.length > 15 ? t.teacherName.substring(0, 15) + '...' : t.teacherName,
        enrollments: t.totalEnrollments,
      })) ?? []
    )
  }, [data])

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Reportes • Docentes</h1>
          <p className="text-muted-foreground text-sm">Resumen por docente y promedio mensual de inscripciones.</p>
        </div>

        <div className="flex gap-2 items-end flex-wrap">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Desde</div>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Hasta</div>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={isExporting} onClick={() => handleExport('xlsx')}>
              Exportar Excel
            </Button>
            <Button variant="secondary" disabled={isExporting} onClick={() => handleExport('pdf')}>
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Docentes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data?.teachers.length ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Cursos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data?.teachers.reduce((sum, t) => sum + t.totalCourses, 0) ?? '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Inscripciones</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data?.teachers.reduce((sum, t) => sum + t.totalEnrollments, 0) ?? '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tasa Global de Terminación</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data ? (() => {
              const totalCompletions = data.teachers.reduce((sum, t) => sum + t.totalCompletions, 0)
              const totalEnrollments = data.teachers.reduce((sum, t) => sum + t.totalEnrollments, 0)
              const totalCancellations = data.teachers.reduce((sum, t) => sum + t.totalCancellations, 0)
              const effectiveEnrollments = totalEnrollments - totalCancellations
              return effectiveEnrollments > 0 ? `${(totalCompletions / effectiveEnrollments * 100).toFixed(1)}%` : '0.0%'
            })() : '—'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cursos subidos por mes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : error ? (
            <div className="text-sm text-destructive">No se pudo cargar el reporte.</div>
          ) : (
            <ChartContainer
              className="h-100"
              config={{
                coursesUploaded: { label: 'Cursos Subidos', color: 'var(--chart-2)' },
              }}
            >
              <BarChart data={coursesUploadedByMonth} margin={{ left: 20, right: 24, top: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
                <XAxis dataKey="name" label={{ value: 'Mes', position: 'insideBottom', offset: -5 }} />
                <YAxis allowDecimals={false} label={{ value: 'Número de Cursos', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} cursos`, 'Cursos Subidos']} />
                <Bar dataKey="coursesUploaded" fill="var(--color-coursesUploaded)" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inscripciones por docente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : error ? (
            <div className="text-sm text-destructive">No se pudo cargar el reporte.</div>
          ) : (
            <ChartContainer
              className="h-100"
              config={{
                enrollments: { label: 'Inscripciones', color: 'var(--chart-1)' },
              }}
            >
              <BarChart data={enrollmentsByTeacher} margin={{ left: 20, right: 24, top: 10, bottom: 80 }}>
                <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} label={{ value: 'Número de Inscripciones', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} inscripciones`, 'Inscripciones']} />
                <Bar dataKey="enrollments" fill="var(--color-enrollments)" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen por docente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : error ? (
            <div className="text-sm text-destructive">No se pudo cargar el reporte.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('teacherName')}>Docente</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalCourses')}>Cursos</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalEnrollments')}>Inscritos</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalCancellations')}>Cancelados</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalCompletions')}>Terminados</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('completionRate')}>Tasa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTeachers?.map(t => (
                    <TableRow key={t.teacherId}>
                      <TableCell>{t.teacherId}</TableCell>
                      <TableCell className="font-medium">{t.teacherName}</TableCell>
                      <TableCell className="text-right">{t.totalCourses}</TableCell>
                      <TableCell className="text-right">{t.totalEnrollments}</TableCell>
                      <TableCell className="text-right">{t.totalCancellations}</TableCell>
                      <TableCell className="text-right">{t.totalCompletions}</TableCell>
                      <TableCell className="text-right">{t.completionRate.toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                  {!sortedTeachers?.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Sin datos para el rango seleccionado.
                      </TableCell>
                    </TableRow>
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

