export type Gender = 0 | 1 | 2  // 0 = Male, 1 = Female, 2 = Other

export interface PersonDto {
  id: number
  firstName: string
  lastName: string
  motherLastName: string
  dateOfBirth: string
  gender: Gender
  nationalId: string
  nationalIdExpedition: string
  phoneNumber: string | null
  address: string | null
  profilePictureUrl: string | null
}

export interface CreatePersonDto {
  firstName: string
  lastName: string
  motherLastName: string
  dateOfBirth: string
  gender: Gender
  nationalId: string
  nationalIdExpedition: string
  phoneNumber?: string
  address?: string
}
