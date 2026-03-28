import type { Course } from "@/types/course";

export const mockCourses: Course[] = [
  {
    id: 1,
    titulo: "React desde cero",
    descripcion: "Aprende React moderno con hooks",
    nivel: "Intermedio",
    imagen_url: "https://edteam-media.s3.amazonaws.com/courses/original/ff432ae3-00a6-4102-b6a4-aa7194564967.png",
    publicado: true,
    duracion_total_min: 1200,
    max_estudiantes: 50,
    entity_status: 1,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },

  {
    id: 2,
    titulo: "SQL Server Profesional",
    descripcion: "Domina bases de datos",
    nivel: "Básico",
    imagen_url: "https://edteam-media.s3.amazonaws.com/courses/original/ee2d8a6e-b1df-4f4d-8fca-47d0ffe135dc.jpeg",
    publicado: true,
    duracion_total_min: 800,
    max_estudiantes: 40,
    entity_status: 1,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
    },
];

export const getCoursesMock = async (): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCourses), 500);
  });
};