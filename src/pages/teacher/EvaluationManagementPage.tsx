import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardList, PlusCircle, Trash2, ArrowRight } from 'lucide-react'
import { useAddEvaluationQuestion, useCreateEvaluation, useEvaluationByCourseId, getApiErrorMessages } from '@/hooks/useEvaluations'
import { useCoursesWithoutEvaluation } from '@/hooks/useCoursesWithoutEvaluation'
import { evaluationService } from '@/services/evaluation.service'
import type { AddAnswerOptionDto, AddEvaluationQuestionDto, CreateEvaluationDto } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const navigate = useNavigate()
  const { courseId: courseIdParam } = useParams<{ courseId?: string }>()
  const [evaluationId, setEvaluationId] = useState<number | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(courseIdParam ? parseInt(courseIdParam) : null)
  const [savedQuestions, setSavedQuestions] = useState<AddEvaluationQuestionDto[]>([])
  const [backendErrors, setBackendErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('datos')
  const [isEdit, setIsEdit] = useState(false)
  const [evaluationIdToEdit, setEvaluationIdToEdit] = useState<number | undefined>(undefined)
  const [isUpdating, setIsUpdating] = useState(false)

  const coursesWithoutEvaluationQuery = useCoursesWithoutEvaluation()
  const createEvaluation = useCreateEvaluation()
  const addQuestion = useAddEvaluationQuestion()

  const evaluationQuery = useEvaluationByCourseId(courseIdParam ? (selectedCourseId || undefined) : undefined)

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema) as Resolver<CreateFormValues>,
    defaultValues: { 
      cursoId: parseInt(courseIdParam || '0'),
      titulo: '', 
      descripcion: '', 
      tipo: 'multiple_opcion', 
      intentosPermitidos: 1,
      puntajeMaximo: undefined,
      puntajeMinimoAprobacion: undefined,
      tiempoLimiteMax: undefined,
    },
    mode: 'onChange',
  })

  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema) as Resolver<QuestionFormValues>,
    defaultValues: { 
      enunciado: '',
      tipo: 'opcion_unica', 
      puntos: 1, 
      orden: 1, 
      correcta: 'A', 
      opcionA: '',
      opcionB: '',
      opcionC: '', 
      opcionD: '' 
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!courseIdParam) {
      return
    }

    if (!evaluationQuery.data || isEdit) {
      return
    }

    const data = evaluationQuery.data
    
    setIsEdit(true)
    setEvaluationIdToEdit(data.id)
    setEvaluationId(data.id)
    
    createForm.reset({
      cursoId: data.cursoId,
      titulo: data.titulo,
      descripcion: data.descripcion ?? '',
      tipo: data.tipo,
      puntajeMaximo: data.puntajeMaximo,
      puntajeMinimoAprobacion: data.puntajeMinimoAprobacion,
      intentosPermitidos: data.intentosPermitidos,
      tiempoLimiteMax: data.tiempoLimiteMax,
    })
    
    if (data.preguntas && data.preguntas.length > 0) {
      const questionsFormatted = data.preguntas.map((pregunta: any) => ({
        evaluacionId: data.id,
        enunciado: pregunta.enunciado,
        tipo: pregunta.tipo,
        puntos: pregunta.puntos,
        orden: pregunta.orden,
        opciones: pregunta.opciones.map((opt: any) => ({
          texto: opt.texto,
          esCorrecta: opt.esCorrecta,
          orden: opt.orden,
        })),
      }))
      setSavedQuestions(questionsFormatted)
    } else {
      setSavedQuestions([])
    }
    
    setActiveTab('datos')
  }, [courseIdParam])

  const onCreateEvaluation = async (values: CreateFormValues) => {
    setBackendErrors([])
    const payload: CreateEvaluationDto = {
      id: isEdit ? evaluationIdToEdit : undefined,
      cursoId: selectedCourseId || values.cursoId,
      titulo: values.titulo,
      descripcion: values.descripcion?.trim() || undefined,
      tipo: values.tipo,
      puntajeMaximo: values.puntajeMaximo,
      puntajeMinimoAprobacion: values.puntajeMinimoAprobacion,
      intentosPermitidos: values.intentosPermitidos,
      tiempoLimiteMax: values.tiempoLimiteMax,
    }

    if (isEdit && evaluationIdToEdit) {
      setIsUpdating(true)
      try {
        await evaluationService.deleteQuestions(evaluationIdToEdit)
        
        await evaluationService.update(evaluationIdToEdit, payload)
        
        for (const question of savedQuestions) {
          await evaluationService.addQuestion(question)
        }
        
        navigate('/teacher/my-evaluations')
      } catch (error) {
        setBackendErrors(getApiErrorMessages(error))
        setIsUpdating(false)
      }
    } else {
      createEvaluation.mutate(payload, {
        onSuccess: response => {
          setEvaluationId(response.id)
          setActiveTab('preguntas')
        },
        onError: error => setBackendErrors(getApiErrorMessages(error)),
      })
    }
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
        questionForm.reset({ tipo: 'opcion_unica', puntos: 1, orden: savedQuestions.length + 2, correcta: 'A', opcionC: '', opcionD: '' })
      },
      onError: error => setBackendErrors(getApiErrorMessages(error)),
    })
  }

  const handleFinalizeEvaluation = () => {
    setBackendErrors([])

    if (isEdit) {
      const values = createForm.getValues()
      onCreateEvaluation(values)
      return
    }

    if (!evaluationId) {
      setBackendErrors(['Debes crear la evaluación antes de finalizar.'])
      return
    }

    if (savedQuestions.length === 0) {
      setBackendErrors(['Debes agregar al menos una pregunta antes de finalizar.'])
      return
    }

    navigate('/teacher/my-evaluations')
  }

  const handleSelectCourse = (cursoId: number, courseName: string) => {
    setSelectedCourseId(cursoId)
    createForm.setValue('cursoId', cursoId)
    createForm.setValue('titulo', `Evaluación: ${courseName}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Editar evaluación' : 'Crear evaluaciones'}</h1>
          <p className="text-sm text-muted-foreground">{isEdit ? 'Modifica los detalles de tu evaluación.' : 'Crea evaluaciones para tus cursos de forma rápida y sencilla.'}</p>
        </div>
      </div>

      {backendErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Error al procesar</AlertTitle>
          <AlertDescription>{backendErrors.join(' ')}</AlertDescription>
        </Alert>
      )}

      {/* Selección de Curso */}
      {!selectedCourseId && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1 - Selecciona un curso</CardTitle>
            <CardDescription>Elige el curso para el cual deseas crear la evaluación.</CardDescription>
          </CardHeader>
          <CardContent>
            {coursesWithoutEvaluationQuery.isLoading ? (
              <p className="text-center text-muted-foreground py-8">Cargando tus cursos...</p>
            ) : coursesWithoutEvaluationQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Error al cargar cursos</AlertTitle>
                <AlertDescription>No se pudieron cargar tus cursos. Intenta nuevamente.</AlertDescription>
              </Alert>
            ) : (coursesWithoutEvaluationQuery.data?.length ?? 0) === 0 ? (
              <Alert>
                <AlertTitle>Sin cursos</AlertTitle>
                <AlertDescription>No tienes cursos para crear evaluaciones.</AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {coursesWithoutEvaluationQuery.data?.map(course => (
                  <Card
                    key={course.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                    onClick={() => handleSelectCourse(course.id, course.titulo)}
                  >
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-base">
                        {course.titulo}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {course.descripcion || 'Sin descripción'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button type="button" className="w-full">
                        Seleccionar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Datos y Preguntas */}
      {selectedCourseId && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedCourseId(null)
              createForm.reset()
              setEvaluationId(null)
              setSavedQuestions([])
            }}
          >
            ← Cambiar curso
          </Button>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="datos">
                Paso 1: Datos
                {evaluationId && <Badge variant="default" className="ml-2">✓</Badge>}
              </TabsTrigger>
              <TabsTrigger value="preguntas">
                Paso 2: Preguntas
                {(savedQuestions.length ?? 0) > 0 && <Badge variant="default" className="ml-2">{savedQuestions.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="resumen">
                Paso 3: Resumen
              </TabsTrigger>
            </TabsList>

            {/* Tab: Datos */}
            <TabsContent value="datos">
              <Card>
                <CardHeader>
                  <CardTitle>Configurar evaluación</CardTitle>
                  <CardDescription>Define los parámetros principales de tu evaluación.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createForm.handleSubmit(onCreateEvaluation)} className="space-y-6">
                    <FieldGroup>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                          name="titulo"
                          control={createForm.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>Título de la evaluación</FieldLabel>
                              <Input placeholder="Evaluación final" {...field} />
                              {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          name="tipo"
                          control={createForm.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Tipo</FieldLabel>
                              <Input placeholder="multiple_opcion" {...field} disabled />
                            </Field>
                          )}
                        />
                      </div>

                      <Controller
                        name="descripcion"
                        control={createForm.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>Descripción (opcional)</FieldLabel>
                            <Input placeholder="Instrucciones adicionales..." {...field} />
                          </Field>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Controller
                          name="puntajeMaximo"
                          control={createForm.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Puntaje máximo</FieldLabel>
                              <Input type="number" step="0.5" placeholder="20" value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} />
                            </Field>
                          )}
                        />
                        <Controller
                          name="puntajeMinimoAprobacion"
                          control={createForm.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Puntaje mínimo (aprobar)</FieldLabel>
                              <Input type="number" step="0.5" placeholder="12" value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} />
                            </Field>
                          )}
                        />
                        <Controller
                          name="tiempoLimiteMax"
                          control={createForm.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Tiempo límite (minutos)</FieldLabel>
                              <Input type="number" placeholder="60" value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} />
                            </Field>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </FieldGroup>

                    {!isEdit && (
                      <Button type="submit" disabled={createEvaluation.isPending} className="w-full">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        {createEvaluation.isPending ? 'Creando...' : 'Crear evaluación'}
                      </Button>
                    )}

                    {!isEdit && evaluationId && (
                      <Alert>
                        <AlertTitle>✓ Evaluación creada</AlertTitle>
                        <AlertDescription>ID: {evaluationId}</AlertDescription>
                      </Alert>
                    )}

                    {(evaluationId || isEdit) && (
                      <Button type="button" onClick={() => setActiveTab('preguntas')} className="w-full">
                        {isEdit ? 'Ver preguntas' : 'Siguiente: Agregar preguntas'}
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Preguntas */}
            <TabsContent value="preguntas">
              <Card>
                <CardHeader>
                  <CardTitle>Agregar preguntas</CardTitle>
                  <CardDescription>Crea preguntas de opción múltiple para tu evaluación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={questionForm.handleSubmit(onAddQuestion)} className="space-y-4">
                    <FieldGroup>
                      <Controller
                        name="enunciado"
                        control={questionForm.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Enunciado de la pregunta</FieldLabel>
                            <Input placeholder="¿Cuál es..." {...field} />
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Controller
                          name="puntos"
                          control={questionForm.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>Puntos</FieldLabel>
                              <Input type="number" {...field} />
                              {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          name="orden"
                          control={questionForm.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Orden</FieldLabel>
                              <Input type="number" {...field} />
                            </Field>
                          )}
                        />
                        <Controller
                          name="correcta"
                          control={questionForm.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Respuesta correcta</FieldLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="C">C</SelectItem>
                                  <SelectItem value="D">D</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                          )}
                        />
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium">Opciones de respuesta</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Controller
                            name="opcionA"
                            control={questionForm.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Opción A</FieldLabel>
                                <Input {...field} />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />
                          <Controller
                            name="opcionB"
                            control={questionForm.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Opción B</FieldLabel>
                                <Input {...field} />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />
                          <Controller
                            name="opcionC"
                            control={questionForm.control}
                            render={({ field }) => (
                              <Field>
                                <FieldLabel>Opción C (opcional)</FieldLabel>
                                <Input {...field} />
                              </Field>
                            )}
                          />
                          <Controller
                            name="opcionD"
                            control={questionForm.control}
                            render={({ field }) => (
                              <Field>
                                <FieldLabel>Opción D (opcional)</FieldLabel>
                                <Input {...field} />
                              </Field>
                            )}
                          />
                        </div>
                      </div>
                    </FieldGroup>

                    <Button type="submit" disabled={!evaluationId || addQuestion.isPending} className="w-full">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      {addQuestion.isPending ? 'Agregando...' : 'Agregar pregunta'}
                    </Button>
                  </form>

                  {/* Preguntas Guardadas */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Preguntas agregadas ({savedQuestions.length})</h3>
                    {savedQuestions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aún no has agregado preguntas.</p>
                    ) : (
                      <div className="space-y-3">
                        {savedQuestions.map((question, index) => (
                          <Card key={`question-saved-${index}`}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">
                                    P{index + 1}. {question.enunciado}
                                  </CardTitle>
                                  <CardDescription>
                                    {question.puntos} punto(s) · {question.opciones.length} opciones
                                  </CardDescription>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSavedQuestions(prev => prev.filter((_, i) => i !== index))}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {savedQuestions.length > 0 && (
                <Button type="button" onClick={() => setActiveTab('resumen')} className="w-full">
                  Siguiente: Ver resumen
                </Button>
              )}
            </TabsContent>

            {/* Tab: Resumen */}
            <TabsContent value="resumen">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de tu evaluación</CardTitle>
                  <CardDescription>Revisa las preguntas y detalles antes de finalizar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="font-semibold">{evaluationId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total de preguntas</p>
                        <p className="font-semibold">{savedQuestions.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Puntaje total</p>
                        <p className="font-semibold">
                          {savedQuestions.reduce((sum, q) => sum  + q.puntos, 0)} pts
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preguntas</h3>
                    {savedQuestions.map((question, index) => (
                      <Card key={`question-resumen-${index}`}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {index + 1}. {question.enunciado}
                          </CardTitle>
                          <CardDescription>{question.puntos} punto(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {question.opciones.map((option, optIndex) => (
                              <div key={`option-resumen-${index}-${optIndex}`} className={`p-2 rounded ${option.esCorrecta ? 'bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-900/50' : 'bg-gray-50 dark:bg-slate-950'}`}>
                                <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option.texto}
                                {option.esCorrecta && <span className="ml-2 text-green-600 font-semibold">(Correcta)</span>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    type="button"
                    onClick={handleFinalizeEvaluation}
                    disabled={isEdit ? isUpdating : createEvaluation.isPending}
                  >
                    {isEdit ? (isUpdating ? 'Actualizando...' : 'Actualizar evaluación') : (createEvaluation.isPending ? 'Finalizando...' : 'Finalizar evaluación')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
