export interface MemoryMetrics {
  used: number;           // MB
  total: number;          // MB
  usedBytes: number;
  totalBytes: number;
  error?: string;
}

export interface CPUMetrics {
  usage: number;          // Percentage (0-100+)
  threadCount: number;
  error?: string;
}

export interface BatteryMetrics {
  level: number;          // Percentage (0-100) or -1 if unknown
  state: 'unplugged' | 'charging' | 'full' | 'unknown';
  isCharging: boolean;
}

export interface DiskMetrics {
  total: number;          // GB
  free: number;           // GB
  used: number;           // GB
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  error?: string;
}

export interface SystemMetrics {
  memory: MemoryMetrics;
  cpu: CPUMetrics;
  threads: number;
  battery: BatteryMetrics;
  disk: DiskMetrics;
  timestamp: number;      // Unix timestamp
}
