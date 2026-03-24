export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
