export interface JournalEntry {
  id: string;
  type: string;
  date: string;
  title: string;
  summary: string;
  metadata?: Record<string, unknown>;
}
