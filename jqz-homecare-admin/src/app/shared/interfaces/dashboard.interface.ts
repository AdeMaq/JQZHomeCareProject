export interface DashboardStat {
  title: string;
  value: string | number;
  icon: string;
  color: string;

  trend?: string;
  trendPositive?: boolean;
}

export interface RecentVisit {
  patient: string;

  therapist: string;

  date: string;

  status: string;
}
