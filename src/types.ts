export interface Article {
  id: number;
  headline: string;
  summary: string;
  sourceUrl: string;
  timestamp: number;
  credibilityScore: number;
  createdAt: number;
  metadata?: {
    source: string;
    originalTitle: string;
  };
}

export interface FullArticle extends Article {
  fullText: string;
}
