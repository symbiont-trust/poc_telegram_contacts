export interface User {
  id: number;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface VerifySignatureRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: VerifySignatureRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}