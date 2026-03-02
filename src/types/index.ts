export interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: number;
  hasPurchased?: boolean;
}

export interface Sale {
  id: number;
  amount: string;
  status: string;
  created_at: string;
  full_name: string;
  email: string;
}

export interface AdminStats {
  total_sales: number;
  total_revenue: number;
}

export interface AdminData {
  sales: Sale[];
  stats: AdminStats;
}
