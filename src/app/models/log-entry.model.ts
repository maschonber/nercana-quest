// Model for a log entry in Nercana
export interface LogEntry {
  message: string;
  timestamp: Date;
  success: boolean;
}
