export type AuthProvider = 'firebase' | 'supabase' | 'local';
export interface AdminAccount {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
  lastLoginAt: string | null;
  previousLoginAt: string | null;
  /** Optional profile data; do not collect birth dates just to authenticate. */
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  locale?: string;
  timeZone?: string;
  age?: number;
}
export interface AdminSession {
  account: AdminAccount;
  provider: AuthProvider;
  expiresAt: string;
  idleExpiresAt: string;
}
export interface SessionResponse {
  provider?: AuthProvider;
  session: AdminSession | null;
  /** Anti-CSRF token, including for the anonymous login session. Never an access token. */
  csrfToken: string;
}
export interface AdminAuthSettings {
  provider: AuthProvider;
  sessionDurationMinutes: number;
  idleTimeoutMinutes: number;
  requireVerifiedEmail: boolean;
  firebase: {
    projectId: string;
    apiKey: string;
    authDomain: string;
    credentialsConfigured: boolean;
  };
  supabase: { url: string; publishableKey: string; credentialsConfigured: boolean };
}
export interface AdminSettingsUpdate {
  settings: AdminAuthSettings;
  /** Optional replacement credentials. Never returned by a GET endpoint. */
  firebaseServiceAccount?: string;
  supabaseSecretKey?: string;
}
export interface AdminAuthAdapter {
  session(): Promise<SessionResponse>;
  login(email: string, password: string, csrf: string): Promise<SessionResponse>;
  logout(csrf: string): Promise<void>;
  resetPassword(email: string, csrf: string): Promise<void>;
  getSettings(): Promise<AdminAuthSettings>;
  saveSettings(update: AdminSettingsUpdate, csrf: string): Promise<void>;
}
