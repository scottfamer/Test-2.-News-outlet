import { useState, useEffect } from 'react';
import { RefreshCw, Newspaper } from 'lucide-react';
import { fetchNews, triggerScrape } from './api';
import { Article } from './types';
import ReelsContainer from './components/ReelsContainer';
import Header from './components/Header';
import { audioManager } from "@/services/AudioManager";

const REFRESH_INTERVAL = 30000; // 30 seconds

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNews = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      const data = await fetchNews();
      setArticles(data);
    } catch (err) {
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading breaking news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <Header 
        isRefreshing={isRefreshing}
        onRefresh={() => loadNews(true)}
        onScrape={handleManualScrape}
        articlesCount={articles.length}
      />

      {articles.length === 0 ? (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="text-center px-6">
            <Newspaper className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-3">No Breaking News Yet</h2>
            <p className="text-gray-400 mb-8 text-lg">
              The AI is currently gathering news from across the internet.
            </p>
            <button
              onClick={handleManualScrape}
              disabled={isRefreshing}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
            >
              {isRefreshing ? 'Gathering News...' : 'Gather News Now'}
            </button>
          </div>
        </div>
      ) : (
        <ReelsContainer articles={articles} />
      )}
    </div>
  );
}

export default App;
