export type AuthRole = 'admin' | 'service' | 'writer' | 'reader';

export type AuthContext = {
  sub?: string;
  email?: string;
  role: AuthRole;
  iss?: string;
  aud?: string;
  tokenType: 'service' | 'main';
};
