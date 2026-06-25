export interface User {
  id: string;
  username: string;
  nickname: string;
  email?: string;
  avatar?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  username: string;
  nickname: string;
  email?: string;
  password: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
