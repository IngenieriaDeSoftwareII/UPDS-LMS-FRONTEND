import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { homeWorkSubmissionService } from '@/services/homeWorkSubmission.service'
import type { gradeHomeWorkDto } from '@/types/homeworkSubmission'

export const useHomeworkSubmission = () => {
    const queryClient = useQueryClient()

    const getAll = useQuery({
        queryKey: ['homeworkSubmissions'],
        queryFn: () => homeWorkSubmissionService.getAll(),
    })

    const submit = useMutation({
        mutationFn: (data: FormData) => homeWorkSubmissionService.submit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworkSubmissions'] })
        },
    })

    const update = useMutation({
        mutationFn: ({ id, data }: { id: number, data: FormData }) => homeWorkSubmissionService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworkSubmissions'] })
        },
    })

    const remove = useMutation({
        mutationFn: (id: number) => homeWorkSubmissionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworkSubmissions'] })
        },
    })

    const grade = useMutation({
        mutationFn: (data: gradeHomeWorkDto) => homeWorkSubmissionService.grade(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworkSubmissions'] })
        },
    })

    const getUrl = useMutation({
        mutationFn: (id: number) => homeWorkSubmissionService.getUrl(id),
    })

    return {
        getAll,
        submit,
        update,
        remove,
        grade,
        getUrl,
    }
}