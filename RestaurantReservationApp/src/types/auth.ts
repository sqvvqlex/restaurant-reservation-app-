export type User = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  token: string;
  user: User;
  message?: string;
};

export type APIError = {
  message: string;
  status?: number;
}; 