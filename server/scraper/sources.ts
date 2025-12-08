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
{
  name: 'Deutsche Welle (DW)',
  url: 'https://rss.dw.com/rdf/rss-en-top',
  type: 'rss',
},
{
  name: 'France 24',
  url: 'https://www.france24.com/en/rss',
  type: 'rss',
},
{
  name: 'CBC News',
  url: 'https://www.cbc.ca/cmlink/rss-topstories',
  type: 'rss',
},
{
  name: 'Sky News',
  url: 'https://feeds.skynews.com/feeds/rss/world.xml',
  type: 'rss',
},
{
  name: 'Japan Times',
  url: 'https://www.japantimes.co.jp/feed/topstories',
  type: 'rss',
},
{
  name: 'South China Morning Post',
  url: 'https://www.scmp.com/rss/91/feed',
  type: 'rss',
},
{
  name: 'The Telegraph',
  url: 'https://www.telegraph.co.uk/news/rss.xml',
  type: 'rss',
},
{
  name: 'The Independent',
  url: 'https://www.independent.co.uk/news/rss',
  type: 'rss',
},
{
  name: 'Times of India',
  url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
  type: 'rss',
},
{
  name: 'Hindustan Times',
  url: 'https://www.hindustantimes.com/rss/topnews/rssfeed.xml',
  type: 'rss',
},
{
  name: 'Sydney Morning Herald',
  url: 'https://www.smh.com.au/rss/feed.xml',
  type: 'rss',
},
{
  name: 'The Globe and Mail',
  url: 'https://www.theglobeandmail.com/?service=rss',
  type: 'rss',
},
{
  name: 'RTÉ News (Ireland)',
  url: 'https://www.rte.ie/news/rss/news-headlines.xml',
  type: 'rss',
},
{
  name: 'New York Times – World',
  url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  type: 'rss',
},
{
  name: 'New York Times – Top Stories',
  url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  type: 'rss',
},
{
  name: 'Washington Post',
  url: 'https://feeds.washingtonpost.com/rss/world',
  type: 'rss',
},
{
  name: 'Los Angeles Times',
  url: 'https://www.latimes.com/world-nation/rss2.0.xml',
  type: 'rss',
},
{
  name: 'PBS NewsHour',
  url: 'https://www.pbs.org/newshour/feeds/rss/headlines',
  type: 'rss',
},
{
  name: 'Vox News',
  url: 'https://www.vox.com/rss/index.xml',
  type: 'rss',
},
{
  name: 'Politico',
  url: 'https://www.politico.com/rss/politics.xml',
  type: 'rss',
},
{
  name: 'The Hill',
  url: 'https://thehill.com/feed/',
  type: 'rss',
},
{
  name: 'CBS News',
  url: 'https://www.cbsnews.com/latest/rss/main',
  type: 'rss',
},
{
  name: 'NBC News',
  url: 'https://feeds.nbcnews.com/nbcnews/public/news',
  type: 'rss',
},
{
  name: 'Fox News – World',
  url: 'http://feeds.foxnews.com/foxnews/world',
  type: 'rss',
},
{
  name: 'ProPublica',
  url: 'https://www.propublica.org/feeds/propublica/main',
  type: 'rss',
},
{
  name: 'The Intercept',
  url: 'https://theintercept.com/feed/?lang=en',
  type: 'rss',
},
{
  name: 'The Conversation',
  url: 'https://theconversation.com/articles.atom',
  type: 'rss',
},
{
  name: 'MIT Technology Review – All',
  url: 'https://www.technologyreview.com/topnews.rss',
  type: 'rss',
},
{
  name: 'MarketWatch',
  url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
  type: 'rss',
},
{
  name: 'Yahoo Finance – Top Stories',
  url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=yhoo&region=US&lang=en-US',
  type: 'rss',
},
{
  name: 'Forbes',
  url: 'https://www.forbes.com/business/feed/',
  type: 'rss',
},
{
  name: 'Business Insider',
  url: 'https://www.businessinsider.com/rss',
  type: 'rss',
},
{
  name: 'The Economist – Latest',
  url: 'https://www.economist.com/latest/rss.xml',
  type: 'rss',
},
{
  name: 'Investopedia',
  url: 'https://www.investopedia.com/feed.xml',
  type: 'rss',
},
{
  name: 'Nature News',
  url: 'https://www.nature.com/subjects/science/rss',
  type: 'rss',
},
{
  name: 'New Scientist',
  url: 'https://www.newscientist.com/feed/home/',
  type: 'rss',
},
{
  name: 'NASA Breaking News',
  url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
  type: 'rss',
},
{
  name: 'National Geographic',
  url: 'https://www.nationalgeographic.com/content/natgeo/en_us/index.rss',
  type: 'rss',
},
{
  name: 'Live Science',
  url: 'https://www.livescience.com/feeds/all',
  type: 'rss',
},
{
  name: 'Wired',
  url: 'https://www.wired.com/feed/rss',
  type: 'rss',
},
{
  name: 'The Verge',
  url: 'https://www.theverge.com/rss/index.xml',
  type: 'rss',
},
{
  name: 'Ars Technica',
  url: 'https://feeds.arstechnica.com/arstechnica/index',
  type: 'rss',
},
{
  name: 'Engadget',
  url: 'https://www.engadget.com/rss.xml',
  type: 'rss',
},
{
  name: 'Mashable',
  url: 'https://mashable.com/feeds/rss/all',
  type: 'rss',
},
{
  name: 'ZDNet',
  url: 'https://www.zdnet.com/news/rss.xml',
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
