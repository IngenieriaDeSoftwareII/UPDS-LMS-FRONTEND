import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChartContainer } from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { useTeacherCourseDetailReport } from '@/hooks/useReports'
import { reportsService } from '@/services/reports.service'
import { downloadBlob, filenameFromContentDisposition } from '@/lib/download'
import { ArrowLineShape } from '@/components/charts/ArrowLineShape'

function monthLabel(year: number, month: number) {
  const mm = String(month).padStart(2, '0')
  return `${year}-${mm}`
}

export function TeacherCourseReportPage() {
  const { courseId } = useParams()
  const id = Number(courseId)
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  const { data, isLoading, error } = useTeacherCourseDetailReport(id, {
    from: from || undefined,
    to: to || undefined,
  })

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    try {
      setIsExporting(true)
      const res = await reportsService.exportTeacherCourseDetail(id, format, { from: from || undefined, to: to || undefined })
      const cd = res.headers?.['content-disposition'] as string | undefined
      const name = filenameFromContentDisposition(cd) ?? `teacher-course-${id}.${format}`
      downloadBlob(res.data, name)
    } finally {
      setIsExporting(false)
    }
  }

  const chartData = useMemo(() => {
    return (
      data?.enrollmentsByMonth?.map(m => ({
        name: monthLabel(m.year, m.month),
        enrollments: m.count,
      })) ?? []
    )
  }, [data])

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Reporte del curso</h1>
          <p className="text-muted-foreground text-sm">{data?.courseTitle ?? '—'}</p>
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
            <CardTitle className="text-sm">Inscritos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data?.totalEnrollments ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cancelados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data?.totalCancellations ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Terminados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data?.totalCompletions ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tasa</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data ? data.completionRate.toFixed(4) : '—'}</CardContent>
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
                      markerId="enrollments-arrow-teacher-course"
                    />
                  )}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

