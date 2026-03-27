import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services/profile.service'
import { useAuthStore } from '@/store/auth.store'
import type { UpdateProfileDto } from '@/types/profile'


export const useProfile = () => {
  const { isAuthenticated, setProfile } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profile = await profileService.getMe()
      setProfile(profile)
      return profile
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => profileService.updateMe(data),
    onSuccess: async () => {
      // Refetch para que el store también se actualice vía useProfile
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
