// types/user.ts

export type UserRole = "USER" | "ADMIN"

export interface User {
  id:        string
  name:      string | null
  email:     string
  image:     string | null
  role:      UserRole
  createdAt: string
  updatedAt: string
}

export interface PublicUser {
  id:    string
  name:  string | null
  image: string | null
}

export interface AuthUser {
  id:    string
  name:  string | null
  email: string
  image: string | null
  role:  UserRole
}

export interface UpdateProfileInput {
  name?: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword:     string
}