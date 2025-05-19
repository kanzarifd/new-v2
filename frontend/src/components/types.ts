export interface Region {
  id: number;
  name: string;
  date_debut: string;
  date_fin: string;
}

export interface RegionFormData {
  name: string;
  date_debut: string;
  date_fin: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  full_name: string;
  number: string;
  bank_account_number: string;
  bank_account_balance?: number;
  createdAt: string;
  updatedAt: string;
  /** ISO timestamp when user was last updated */
  role: string;
  regionId?: number;
}

export interface Reclam {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  date_debut: string;
  date_fin: string;
  /** Optional IDs for compatibility */
  regionId?: number;
  userId?: number;
  /** Nested objects from API */
  user?: { id: number; name: string };
  region?: { id: number; name: string };
  attachment?: string;
  currentAgency?: string;
}