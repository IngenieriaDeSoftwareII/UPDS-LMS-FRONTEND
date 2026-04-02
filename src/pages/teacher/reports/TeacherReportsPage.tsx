import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer } from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, BarChart } from 'recharts'
import { useTeacherCoursesReport, useTeacherSummaryReport } from '@/hooks/useReports'
import { reportsService } from '@/services/reports.service'
import { ArrowLineShape } from '@/components/charts/ArrowLineShape'
import { downloadBlob, filenameFromContentDisposition } from '@/lib/download'

function monthLabel(year: number, month: number) {
  const mm = String(month).padStart(2, '0')
  return `${year}-${mm}`
}

export function TeacherReportsPage() {
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  const range = { from: from || undefined, to: to || undefined }
  const summary = useTeacherSummaryReport(range)
  const courses = useTeacherCoursesReport(range)

  const handleExportSummary = async (format: 'xlsx' | 'pdf') => {
    try {
      setIsExporting(true)
      const res = await reportsService.exportTeacherSummary(format, range)
      const cd = res.headers?.['content-disposition'] as string | undefined
      const name = filenameFromContentDisposition(cd) ?? `teacher-summary.${format}`
      downloadBlob(res.data, name)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCourses = async (format: 'xlsx' | 'pdf') => {
    try {
      setIsExporting(true)
      const res = await reportsService.exportTeacherCourses(format, range)
      const cd = res.headers?.['content-disposition'] as string | undefined
      const name = filenameFromContentDisposition(cd) ?? `teacher-courses.${format}`
      downloadBlob(res.data, name)
    } finally {
      setIsExporting(false)
    }
  }

  const chartData = useMemo(() => {
    return (
      summary.data?.enrollmentsByMonth?.map(m => ({
        name: monthLabel(m.year, m.month),
        enrollments: m.count,
      })) ?? []
    )
  }, [summary.data])

  const barData = useMemo(() => {
    return (
      courses.data?.courses?.map(c => ({
        name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
        enrollments: c.totalEnrollments,
        completions: c.totalCompletions,
      })) ?? []
    )
  }, [courses.data])

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Reportes</h1>
          <p className="text-muted-foreground text-sm">Resumen de tus cursos y tu actividad.</p>
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
            <Button variant="secondary" disabled={isExporting} onClick={() => handleExportSummary('xlsx')}>
              Exportar resumen (Excel)
            </Button>
            <Button variant="secondary" disabled={isExporting} onClick={() => handleExportSummary('pdf')}>
              Exportar resumen (PDF)
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cursos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.data?.totalCourses ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Inscritos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.data?.totalEnrollments ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cancelados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.data?.totalCancellations ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Terminados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.data?.totalCompletions ?? '—'}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscripciones por mes</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : summary.error ? (
            <div className="text-sm text-destructive">No se pudo cargar el resumen.</div>
          ) : (
            <ChartContainer
              className="h-100"
              config={{
                enrollments: { label: 'Inscripciones', color: 'var(--chart-1)' },
              }}
            >
              <LineChart data={chartData} margin={{ left: 20, right: 24, top: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
                <XAxis dataKey="name" label={{ value: 'Mes', position: 'insideBottom', offset: -5 }} />
                <YAxis allowDecimals={false} label={{ value: 'Número de Inscripciones', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} inscripciones`, 'Inscripciones']} />
                <Line
                  type="linear"
                  dataKey="enrollments"
                  stroke="var(--color-enrollments)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  shape={p => (
                    <ArrowLineShape
                      points={p.points}
                      stroke={p.stroke}
                      strokeWidth={typeof p.strokeWidth === 'string' ? Number(p.strokeWidth) : p.strokeWidth}
                      markerId="enrollments-arrow-teacher-summary"
                    />
                  )}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inscripciones y terminaciones por curso</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : courses.error ? (
            <div className="text-sm text-destructive">No se pudo cargar tus cursos.</div>
          ) : (
            <ChartContainer
              className="h-100"
              config={{
                enrollments: { label: 'Inscripciones', color: 'var(--chart-1)' },
                completions: { label: 'Terminaciones', color: 'var(--chart-3)' },
              }}
            >
              <BarChart data={barData} margin={{ left: 20, right: 24, top: 10, bottom: 80 }}>
                <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} label={{ value: 'Número', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value, name) => [`${value}`, name === 'enrollments' ? 'Inscripciones' : 'Terminaciones']} />
                <Bar dataKey="enrollments" fill="var(--color-enrollments)" />
                <Bar dataKey="completions" fill="var(--chart-3)" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle>Por curso</CardTitle>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={isExporting} onClick={() => handleExportCourses('xlsx')}>
                Exportar cursos (Excel)
              </Button>
              <Button variant="secondary" disabled={isExporting} onClick={() => handleExportCourses('pdf')}>
                Exportar cursos (PDF)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {courses.isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : courses.error ? (
            <div className="text-sm text-destructive">No se pudo cargar tus cursos.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead className="text-right">Inscritos</TableHead>
                    <TableHead className="text-right">Cancelados</TableHead>
                    <TableHead className="text-right">Terminados</TableHead>
                    <TableHead className="text-right">Tasa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.data?.courses?.map(c => (
                    <TableRow key={c.courseId}>
                      <TableCell className="font-medium">
                        <Link className="underline underline-offset-4" to={`/teacher/reports/courses/${c.courseId}`}>
                          {c.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{c.totalEnrollments}</TableCell>
                      <TableCell className="text-right">{c.totalCancellations}</TableCell>
                      <TableCell className="text-right">{c.totalCompletions}</TableCell>
                      <TableCell className="text-right">{c.completionRate.toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                  {!courses.data?.courses?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
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

