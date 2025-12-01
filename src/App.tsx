import { useState, useEffect } from 'react';
import { RefreshCw, Newspaper, AlertCircle } from 'lucide-react';
import { fetchNews, triggerScrape } from './api';
import { Article } from './types';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import Header from './components/Header';

const REFRESH_INTERVAL = 30000; // 30 seconds

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNews = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      const data = await fetchNews();
      setArticles(data);
      setError(null);
    } catch (err) {
      setError('Failed to load news. Please try again later.');
      console.error('Error loading news:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  };

  const handleManualScrape = async () => {
    try {
      setIsRefreshing(true);
      await triggerScrape();
      // Wait a bit for scraping to start, then refresh
      setTimeout(() => loadNews(), 2000);
    } catch (err) {
      console.error('Error triggering scrape:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();

    // Auto-refresh
    const interval = setInterval(() => {
      loadNews(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading breaking news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        isRefreshing={isRefreshing}
        onRefresh={() => loadNews(true)}
        onScrape={handleManualScrape}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Breaking News Yet</h2>
            <p className="text-gray-500 mb-6">
              The AI is currently gathering news from across the internet.
            </p>
            <button
              onClick={handleManualScrape}
              disabled={isRefreshing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? 'Gathering News...' : 'Gather News Now'}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              <span className="font-semibold">{articles.length}</span> breaking news articles
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticleId(article.id)}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedArticleId && (
        <ArticleModal
          articleId={selectedArticleId}
          onClose={() => setSelectedArticleId(null)}
        />
      )}
    </div>
  );
}

export default App;
