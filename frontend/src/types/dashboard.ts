export interface ChartData {
  name: string;
  value: number;
}

export interface Reclamation {
  id: number;
  created_at: string;
  type: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  date_debut: string;
  date_fin: string;
  region_id: number;
  user_id: number;
}