import type { CourseDto } from './course';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  catalogId: string;
  courses?: CourseDto[];
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description: string;
  catalogId: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {oryDto> {
  id: string;
}
