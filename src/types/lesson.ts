import type { ContentDto } from "@/hooks/useContents";
import type { getHomeWorkDto } from "./homeWork";
export type LessonWithContentsDto = {
    id: number;
    moduleId: number;
    title: string;
    description: string;
    order: number;
    entityStatus: number;
    createdAt: string;
    updatedAt: string;
    contents: ContentDto[];
    homeworks: getHomeWorkDto[];
}