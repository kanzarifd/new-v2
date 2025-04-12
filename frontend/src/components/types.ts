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
  role: string;
  regionId?: number;
}

export interface Reclam {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  regionId: number;
}
