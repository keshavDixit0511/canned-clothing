export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface AuthSessionResponse {
  message: string
  token: string
  user: {
    id: string
    name: string | null
    email: string
    role: "USER" | "ADMIN"
    image: string | null
  }
}
