import type { User } from '../../types_that_will_used';

// Re-export API types from main types file
export type {
  Login,
  Logout,
  Registration,
  GetAccountInfo,
  UpdateAccount,
  SsoLogin,
} from '../../types_that_will_used';

// ============================================================================
// State Types
// ============================================================================

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Payload Types
// ============================================================================

export interface SetCredentialsPayload {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface SetTokenPayload {
  token: string;
  refreshToken?: string;
}

export interface SetAuthErrorPayload {
  error: string;
}
