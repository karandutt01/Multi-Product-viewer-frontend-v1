export interface AuthState {
  token?: string | null;
  uid?: string | number | null;
  expiresIn?: number | null;
}