import { Article, FullArticle } from './types';

const API_BASE = '/api';

export async function fetchNews(): Promise<Article[]> {
  const response = await fetch(`${API_BASE}/news`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }

  const data = await response.json();
  return data.articles || [];
}

export async function fetchArticleById(id: number): Promise<FullArticle> {
  const response = await fetch(`${API_BASE}/news/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }

  const data = await response.json();
  return data.article;
}

export async function triggerScrape(): Promise<void> {
  const response = await fetch(`${API_BASE}/scrape`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to trigger scrape');
  }
}

export async function fetchTTS(articleId: number): Promise<Blob> {
  const response = await fetch(`${API_BASE}/news/${articleId}/tts`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch TTS audio');
  }

  return await response.blob();
}
