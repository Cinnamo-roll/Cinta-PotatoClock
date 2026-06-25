export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiErrorPayload {
  message: string;
  code?: number;
}
