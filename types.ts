export type ProcessStatus = 'pending' | 'in-progress' | 'completed' | 'error' | 'success';

export type EtlStep = 'extract' | 'transform' | 'review' | 'load';

export interface NewsArticle {
  title: string;
  link: string;
  isoDate: string;
  snippet?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
}

export interface Schedule {
  cron: string;
  isEnabled: boolean;
}

export interface DbData {
  newsSources: NewsSource[];
  schedule: Schedule;
}

// --- Refactoring Types ---

/**
 * Represents the data structure for the 'transform' step of the ETL process.
 */
export interface TransformData {
  description: string;
  // A simplified representation of the FunctionCall from @google/genai
  functionCall: {
    name: string;
    args: { [key: string]: any };
  };
}

/**
 * Represents the complete data object for the ETL process managed in the frontend.
 */
export interface EtlData {
  extract: {
    news: {
      title: string;
      url: string;
      snippet: string;
    }[];
  } | null;
  transform: TransformData | null;
  summary: string;
  load: string; // Holds the final success/error message from postToSlack
}
