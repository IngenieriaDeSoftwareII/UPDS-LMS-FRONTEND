import http from '@/lib/http'
import { createService } from './base.service';
import type { Category, CategoryCreateDTO, CategoryUpdateDTO } from '@/types/category';

const baseService = createService<CategoryCreateDTO, CategoryUpdateDTO, Category>('/categories')

export const categoryService = {
	...baseService,
	update: (id: number, data: CategoryUpdateDTO) =>
		http.put<Category>(`/categories/${id}`, data).then(r => r.data),
}
