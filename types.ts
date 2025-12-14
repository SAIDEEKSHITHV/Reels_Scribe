export interface ExtractedCaption {
  id: string;
  url: string;
  originalText: string;
  timestamp: number;
}

export type HistoryItem = ExtractedCaption;

export interface FormatOptions {
  removeHashtags: boolean;
  removeMentions: boolean;
  removeBlankLines: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';