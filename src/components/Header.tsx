import { RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onScrape: () => void;
}

export default function Header({ isRefreshing, onRefresh, onScrape }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Breaking News
              </h1>
              <p className="text-sm text-gray-600">
                AI-Powered • Updated Automatically
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onScrape}
              disabled={isRefreshing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Manually trigger AI news gathering"
            >
              Gather News
            </button>
            
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh news feed"
            >
              <RefreshCw 
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
