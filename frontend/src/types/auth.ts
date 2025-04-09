export type UserRole = 'admin' | 'user' | 'agent';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  full_name?: string;
  number?: string;
}
