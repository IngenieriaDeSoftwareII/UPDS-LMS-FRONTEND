import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer } from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { useAdminCoursesReport } from '@/hooks/useReports'
import { reportsService } from '@/services/reports.service'
import { downloadBlob, filenameFromContentDisposition } from '@/lib/download'
import { ArrowLineShape } from '@/components/charts/ArrowLineShape'

function monthLabel(year: number, month: number) {
  const mm = String(month).padStart(2, '0')
  return `${year}-${mm}`
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']

export function AdminCourseReportsPage() {
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const [sortColumn, setSortColumn] = useState<string>('totalEnrollments')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading, error } = useAdminCoursesReport({
    from: from || undefined,
    to: to || undefined,
  })

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    try {
      setIsExporting(true)
      const res = await reportsService.exportAdminCourses(format, { from: from || undefined, to: to || undefined })
      const cd = res.headers?.['content-disposition'] as string | undefined
      const name = filenameFromContentDisposition(cd) ?? `admin-courses.${format}`
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

  const sortedCourses = useMemo(() => {
    if (!data?.courses) return []
    return [...data.courses].sort((a, b) => {
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
  }, [data?.courses, sortColumn, sortDirection])

  const chartData = useMemo(() => {
    return (
      data?.enrollmentsByMonth?.map(m => ({
        name: monthLabel(m.year, m.month),
        enrollments: m.count,
      })) ?? []
    )
  }, [data])

  const pieData = useMemo(() => {
    if (!data?.courses.length) return []
    const totalEnrollments = data.courses.reduce((sum, c) => sum + c.totalEnrollments, 0)
    const totalCancellations = data.courses.reduce((sum, c) => sum + c.totalCancellations, 0)
    const totalCompletions = data.courses.reduce((sum, c) => sum + c.totalCompletions, 0)
    const active = totalEnrollments - totalCancellations - totalCompletions
    return [
      { name: 'Activos', value: active },
      { name: 'Cancelados', value: totalCancellations },
      { name: 'Completados', value: totalCompletions },
    ].filter(d => d.value > 0)
  }, [data])

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Reportes • Cursos</h1>
          <p className="text-muted-foreground text-sm">Métricas de inscripciones, cancelaciones y finalizaciones.</p>
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
            <CardTitle className="text-sm">Total Cursos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data?.courses.length ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Inscripciones</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data?.courses.reduce((sum, c) => sum + c.totalEnrollments, 0) ?? '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Cancelaciones</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data?.courses.reduce((sum, c) => sum + c.totalCancellations, 0) ?? '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tasa Global de Terminación</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data ? (() => {
              const totalCompletions = data.courses.reduce((sum, c) => sum + c.totalCompletions, 0)
              const totalEnrollments = data.courses.reduce((sum, c) => sum + c.totalEnrollments, 0)
              const totalCancellations = data.courses.reduce((sum, c) => sum + c.totalCancellations, 0)
              const effectiveEnrollments = totalEnrollments - totalCancellations
              return effectiveEnrollments > 0 ? `${(totalCompletions / effectiveEnrollments * 100).toFixed(1)}%` : '0.0%'
            })() : '—'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscripciones por mes</CardTitle>
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
                      markerId="enrollments-arrow-admin-courses"
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
          <CardTitle>Distribución de estado de inscripciones</CardTitle>
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
                Activos: { label: 'Activos', color: 'var(--chart-1)' },
                Cancelados: { label: 'Cancelados', color: 'var(--chart-2)' },
                Completados: { label: 'Completados', color: 'var(--chart-3)' },
              }}
            >
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} estudiantes`, '']} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle por curso</CardTitle>
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
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('title')}>Curso</TableHead>
                    <TableHead>Docente</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalEnrollments')}>Inscritos</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalCancellations')}>Cancelados</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalCompletions')}>Terminados</TableHead>
                    <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('completionRate')}>Tasa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCourses?.map(c => (
                    <TableRow key={c.courseId}>
                      <TableCell>{c.courseId}</TableCell>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{c.teacherName ?? '-'}</TableCell>
                      <TableCell className="text-right">{c.totalEnrollments}</TableCell>
                      <TableCell className="text-right">{c.totalCancellations}</TableCell>
                      <TableCell className="text-right">{c.totalCompletions}</TableCell>
                      <TableCell className="text-right">{c.completionRate.toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                  {!sortedCourses?.length && (
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

