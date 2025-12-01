export interface NewsSource {
  name: string;
  url: string;
  type: 'rss' | 'html' | 'api';
  selector?: string; // For HTML scraping
}

export const NEWS_SOURCES: NewsSource[] = [
  // RSS Feeds - Major News Outlets
  {
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    type: 'rss',
  },
  {
    name: 'Reuters',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    type: 'rss',
  },
  {
    name: 'Associated Press',
    url: 'https://apnews.com/apf-topnews',
    type: 'rss',
  },
  {
    name: 'NPR News',
    url: 'https://feeds.npr.org/1001/rss.xml',
    type: 'rss',
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    type: 'rss',
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    type: 'rss',
  },
  {
    name: 'CNN Top Stories',
    url: 'http://rss.cnn.com/rss/cnn_topstories.rss',
    type: 'rss',
  },
  {
    name: 'ABC News',
    url: 'https://abcnews.go.com/abcnews/topstories',
    type: 'rss',
  },
  
  // Government Sources
  {
    name: 'US Government News',
    url: 'https://www.usa.gov/rss/updates.xml',
    type: 'rss',
  },
  {
    name: 'World Health Organization',
    url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
    type: 'rss',
  },
  
  // Tech & Science
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'rss',
  },
  {
    name: 'Science Daily',
    url: 'https://www.sciencedaily.com/rss/all.xml',
    type: 'rss',
  },
  
  // Financial News
  {
    name: 'Bloomberg',
    url: 'https://www.bloomberg.com/feed/podcast/etf-report.xml',
    type: 'rss',
  },
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/?format=rss',
    type: 'rss',
  },
];

// Fallback sources if RSS fails
export const FALLBACK_SOURCES: NewsSource[] = [
  {
    name: 'Google News',
    url: 'https://news.google.com/rss',
    type: 'rss',
  },
];
