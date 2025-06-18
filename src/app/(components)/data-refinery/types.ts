export interface SpiderFile extends File {
  // Placeholder for Spider-specific parsed data structure if needed
  parsedData?: Record<string, string>[];
}

export interface GosomFile extends File {
  // Placeholder for Gosom-specific parsed data structure if needed
  parsedData?: Record<string, string>[];
}

export type LogEntry = {
  timestamp: Date;
  message: string;
  type: 'info' | 'error' | 'success';
};

export type ConsolidatedData = Record<string, string>[];

export type DataChunk = Record<string, string>[];
