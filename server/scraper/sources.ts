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
  url: 'https://feeds.reuters.com/reuters/topNews',
  type: 'rss',
},
  {
  name: 'Associated Press',
  url: 'https://feeds.apnews.com/rss/apnews/topnews',
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
  // Government Sources
{
  name: 'USA Today',
  url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories',
  type: 'rss',
},
{
  name: 'World Health Organization',
  url: 'https://www.who.int/rss-feeds/news-english.xml',
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
  {
  name: 'Euronews',
  url: 'https://www.euronews.com/rss?level=theme&name=news',
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
