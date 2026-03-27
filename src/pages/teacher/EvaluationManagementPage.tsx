import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardList, PlusCircle, Trash2 } from 'lucide-react'
import { useAddEvaluationQuestion, useCreateEvaluation, getApiErrorMessages } from '@/hooks/useEvaluations'
import type { AddAnswerOptionDto, AddEvaluationQuestionDto, CreateEvaluationDto } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const optionalPositiveNumber = z.preprocess(
  value => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce.number().positive().optional()
)

const optionalPositiveInt = z.preprocess(
  value => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().positive().optional()
)

const createSchema = z.object({
  cursoId: z.coerce.number().int().positive('Curso obligatorio'),
  titulo: z.string().min(1, 'Título obligatorio'),
  descripcion: z.string().optional(),
  tipo: z.string().min(1, 'Tipo obligatorio'),
  puntajeMaximo: optionalPositiveNumber,
  puntajeMinimoAprobacion: optionalPositiveNumber,
  intentosPermitidos: z.coerce.number().int().min(1, 'Intentos debe ser mayor a 0'),
  tiempoLimiteMax: optionalPositiveInt,
})

const questionSchema = z.object({
  enunciado: z.string().min(1, 'Enunciado obligatorio'),
  tipo: z.string().min(1, 'Tipo obligatorio'),
  puntos: z.coerce.number().int().min(1, 'Puntos debe ser mayor a 0'),
  orden: z.coerce.number().int().min(1, 'Orden debe ser mayor a 0'),
  opcionA: z.string().min(1, 'Texto obligatorio'),
  opcionB: z.string().min(1, 'Texto obligatorio'),
  opcionC: z.string().optional(),
  opcionD: z.string().optional(),
  correcta: z.enum(['A', 'B', 'C', 'D']),
})

type CreateFormValues = z.infer<typeof createSchema>
type QuestionFormValues = z.infer<typeof questionSchema>

const buildOptions = (values: QuestionFormValues): AddAnswerOptionDto[] => {
  const options = [
    { key: 'A', text: values.opcionA },
    { key: 'B', text: values.opcionB },
    { key: 'C', text: values.opcionC?.trim() ?? '' },
    { key: 'D', text: values.opcionD?.trim() ?? '' },
  ].filter(option => option.text.length > 0)

  return options.map((option, idx) => ({
    texto: option.text,
    esCorrecta: values.correcta === option.key,
    orden: idx + 1,
  }))
}

export function EvaluationManagementPage() {
  const [evaluationId, setEvaluationId] = useState<number | null>(null)
  const [savedQuestions, setSavedQuestions] = useState<AddEvaluationQuestionDto[]>([])
  const [backendErrors, setBackendErrors] = useState<string[]>([])

  const createEvaluation = useCreateEvaluation()
  const addQuestion = useAddEvaluationQuestion()

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { tipo: 'multiple_opcion', intentosPermitidos: 1 },
  })

  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: { tipo: 'opcion_unica', puntos: 1, orden: 1, correcta: 'A' },
  })

  const onCreateEvaluation = (values: CreateFormValues) => {
    setBackendErrors([])
    const payload: CreateEvaluationDto = {
      cursoId: values.cursoId,
      titulo: values.titulo,
      descripcion: values.descripcion?.trim() || undefined,
      tipo: values.tipo,
      puntajeMaximo: values.puntajeMaximo,
      puntajeMinimoAprobacion: values.puntajeMinimoAprobacion,
      intentosPermitidos: values.intentosPermitidos,
      tiempoLimiteMax: values.tiempoLimiteMax,
    }

    createEvaluation.mutate(payload, {
      onSuccess: response => {
        setEvaluationId(response.id)
      },
      onError: error => setBackendErrors(getApiErrorMessages(error)),
    })
  }

  const onAddQuestion = (values: QuestionFormValues) => {
    if (!evaluationId) return
    setBackendErrors([])

    const opciones = buildOptions(values)
    if (opciones.length < 2) {
      setBackendErrors(['Debes enviar al menos 2 opciones.'])
      return
    }
    if (opciones.filter(option => option.esCorrecta).length !== 1) {
      setBackendErrors(['Debe existir exactamente 1 opción correcta.'])
      return
    }

    const payload: AddEvaluationQuestionDto = {
      evaluacionId: evaluationId,
      enunciado: values.enunciado,
      tipo: values.tipo,
      puntos: values.puntos,
      orden: values.orden,
      opciones,
    }

    addQuestion.mutate(payload, {
      onSuccess: () => {
        setSavedQuestions(prev => [...prev, payload])
        questionForm.reset({ tipo: 'opcion_unica', puntos: 1, orden: savedQuestions.length + 2, correcta: 'A' })
      },
      onError: error => setBackendErrors(getApiErrorMessages(error)),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evaluación final</h1>
          <p className="text-sm text-muted-foreground">Crea la evaluación, agrega preguntas y publícala en tu curso.</p>
        </div>
      </div>

      {backendErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo completar la acción</AlertTitle>
          <AlertDescription>{backendErrors.join(' ')}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Paso 1 - Crear evaluación</CardTitle>
          <CardDescription>Completa los datos obligatorios para generar el ID de evaluación.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createForm.handleSubmit(onCreateEvaluation)} className="space-y-4">
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="cursoId"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Curso ID</FieldLabel>
                      <Input type="number" {...field} />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="titulo"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Título</FieldLabel>
                      <Input placeholder="Evaluación final" {...field} />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="tipo"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Tipo</FieldLabel>
                      <Input placeholder="multiple_opcion" {...field} />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller name="puntajeMaximo" control={createForm.control} render={({ field }) => <Input type="number" placeholder="Puntaje máximo" {...field} />} />
                <Controller name="puntajeMinimoAprobacion" control={createForm.control} render={({ field }) => <Input type="number" placeholder="Puntaje mínimo aprobación" {...field} />} />
                <Controller
                  name="intentosPermitidos"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Intentos permitidos</FieldLabel>
                      <Input type="number" {...field} />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller name="tiempoLimiteMax" control={createForm.control} render={({ field }) => <Input type="number" placeholder="Tiempo límite (min)" {...field} />} />
                <Controller name="descripcion" control={createForm.control} render={({ field }) => <Input placeholder="Descripción (opcional)" {...field} />} />
              </div>
            </FieldGroup>
            <Button type="submit" disabled={createEvaluation.isPending}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {createEvaluation.isPending ? 'Creando...' : 'Crear evaluación'}
            </Button>
            {evaluationId && <Badge>Evaluación creada con ID: {evaluationId}</Badge>}
          </form>
        </CardContent>
      </Card>

      <Card className={!evaluationId ? 'opacity-60' : ''}>
        <CardHeader>
          <CardTitle>Paso 2 - Agregar preguntas</CardTitle>
          <CardDescription>Debes agregar al menos 2 opciones y exactamente 1 correcta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={questionForm.handleSubmit(onAddQuestion)} className="space-y-4">
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Controller name="enunciado" control={questionForm.control} render={({ field, fieldState }) => (
                  <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
                    <FieldLabel>Enunciado</FieldLabel>
                    <Input {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )} />
                <Controller name="tipo" control={questionForm.control} render={({ field }) => <Input placeholder="opcion_unica" {...field} />} />
                <Controller name="puntos" control={questionForm.control} render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Puntos</FieldLabel>
                    <Input type="number" {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Controller name="orden" control={questionForm.control} render={({ field }) => <Input type="number" placeholder="Orden" {...field} />} />
                <Controller
                  name="correcta"
                  control={questionForm.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Respuesta correcta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller name="opcionA" control={questionForm.control} render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Opción A</FieldLabel>
                    <Input {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )} />
                <Controller name="opcionB" control={questionForm.control} render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Opción B</FieldLabel>
                    <Input {...field} />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller name="opcionC" control={questionForm.control} render={({ field }) => <Input placeholder="Opción C (opcional)" {...field} />} />
                <Controller name="opcionD" control={questionForm.control} render={({ field }) => <Input placeholder="Opción D (opcional)" {...field} />} />
              </div>
            </FieldGroup>

            <Button type="submit" disabled={!evaluationId || addQuestion.isPending}>
              {addQuestion.isPending ? 'Agregando...' : 'Agregar pregunta'}
            </Button>
          </form>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Preguntas agregadas</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Enunciado</TableHead>
                  <TableHead>Puntos</TableHead>
                  <TableHead>Opciones</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Aún no agregaste preguntas.</TableCell>
                  </TableRow>
                ) : (
                  savedQuestions.map((question, index) => (
                    <TableRow key={`${question.orden}-${index}`}>
                      <TableCell>{question.orden}</TableCell>
                      <TableCell>{question.enunciado}</TableCell>
                      <TableCell>{question.puntos}</TableCell>
                      <TableCell>{question.opciones.length}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSavedQuestions(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
