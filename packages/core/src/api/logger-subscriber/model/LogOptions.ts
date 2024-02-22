export type LogContext = Partial<{
  type: string;
  tag: string;
  [key: string]: unknown;
}>;

export type LogData = Record<string, unknown>;

export type LogOptions = {
  tag?: string;
  data?: LogData;
  context?: LogContext;
  timestamp?: number;
};
