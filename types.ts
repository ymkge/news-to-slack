
export type ProcessStatus = 'pending' | 'in-progress' | 'completed' | 'error';

export type EtlStep = 'extract' | 'transform' | 'load';

export interface NewsArticle {
  title: string;
  url: string;
  snippet: string;
}

export interface MockApiResponse {
  news: NewsArticle[];
}
