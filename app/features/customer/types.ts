import type { AuthProvider } from '../auth/types';
export type { AuthProvider } from '../auth/types';
export interface CustomerAccount {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  roles: string[];
}
export interface CustomerSession {
  provider: AuthProvider;
  account: CustomerAccount;
  expiresAt: string;
  idleExpiresAt: string;
}
export interface CustomerSessionResponse {
  provider: AuthProvider;
  session: CustomerSession | null;
  csrfToken: string;
  message?: string;
}
export interface CustomerAuthAdapter {
  session(): Promise<CustomerSessionResponse>;
  login(email: string, password: string, csrf: string): Promise<CustomerSessionResponse>;
  register(email: string, password: string, csrf: string): Promise<CustomerSessionResponse>;
  logout(csrf: string): Promise<void>;
}
