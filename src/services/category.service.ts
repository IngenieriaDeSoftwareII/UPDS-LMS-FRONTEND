import { createService } from './base.service';
import type { Category, CategoryCreateDTO, CategoryUpdateDTO } from '@/types/category';

export const categoryService = createService<CategoryCreateDTO, CategoryUpdateDTO, Category>('/categories');
