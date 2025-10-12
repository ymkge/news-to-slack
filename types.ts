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