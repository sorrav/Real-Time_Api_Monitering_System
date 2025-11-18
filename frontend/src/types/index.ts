export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface Monitor {
  _id: string;
  userId: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  interval: number;
  timeout: number;
  isActive: boolean;
  isFavorite: boolean;
  currentStatus: 'up' | 'down' | 'unknown';
  currentLatency: number;
  lastChecked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  _id: string;
  monitorId: string;
  status: 'up' | 'down';
  statusCode: number;
  responseTime: number;
  errorMessage?: string;
  checkedAt: string;
}

export interface MonitorStats {
  uptime: string;
  averageLatency: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
}

export interface MonitorSummary {
  total: number;
  up: number;
  down: number;
  unknown: number;
  favorites: number;
}

export interface MonitorsResponse {
  success: boolean;
  count: number;
  summary: MonitorSummary;
  data: Monitor[];
}

export interface HealthRecordsResponse {
  success: boolean;
  count: number;
  timeRange: string;
  stats: MonitorStats;
  data: HealthRecord[];
}

export interface SocketHealthUpdate {
  monitorId: string;
  status: 'up' | 'down';
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

export type FilterType = 'all' | 'favorites' | 'up' | 'down' | 'high-latency';
export type SortType = 'recent' | 'status' | 'latency-asc' | 'latency-desc' | 'name-asc' | 'name-desc';
export type TimeRange = '1h' | '24h' | '7d' | '30d';