import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { homeWorkService } from '@/services/homeWork.service'


export const useHomeWork = () => {
    const queryClient = useQueryClient()

    const getAll = useQuery({
        queryKey: ['homeworks'],
        queryFn: () => homeWorkService.getAll(),
    })

    const create = useMutation({
        mutationFn: (data: FormData) => homeWorkService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworks'] })
        },
    })

    const update = useMutation({
        mutationFn: ({ id, data }: { id: number; data: FormData }) => homeWorkService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworks'] })
        },
    })

    const remove = useMutation({
        mutationFn: (id: number) => homeWorkService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworks'] })
        },
    })

    const getUrl = useMutation({
        mutationFn: (id: number) => homeWorkService.getUrl(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['homeworks'] })
        },
    })

    return {
        getAll,
        create,
        update,
        remove,
        getUrl,
    }
}