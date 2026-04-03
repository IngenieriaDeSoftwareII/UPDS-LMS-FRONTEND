export interface ModuleDto {
  id: number
  cursoId: number
  titulo: string
  descripcion?: string
  orden: number
}

export interface CreateModuleDto {
  cursoId: number
  titulo: string
  descripcion?: string
  orden: number
}

export interface UpdateModuleDto extends CreateModuleDto {
  id: number
}