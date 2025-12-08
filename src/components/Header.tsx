import { RefreshCw, Zap, Newspaper } from 'lucide-react';

interface HeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onScrape: () => void;
  articlesCount: number;
}

export default function Header({ isRefreshing, onRefresh, onScrape, articlesCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-start justify-between">
          {/* Logo and Title - Top Left */}
          <div className="flex items-center gap-2 pointer-events-auto bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md px-4 py-3 rounded-xl border border-gray-700/50 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                Breaking News
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Newspaper className="w-3 h-3" />
                <span>{articlesCount} articles</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Top Right */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={onScrape}
              disabled={isRefreshing}
              className="px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-md rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-blue-500/30 active:scale-95"
              title="Manually trigger AI news gathering"
            >
              <span className="hidden sm:inline">Gather News</span>
              <Zap className="w-4 h-4 sm:hidden" />
            </button>
            
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-3 text-white bg-gray-900/90 backdrop-blur-md rounded-xl hover:bg-gray-800/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-gray-700/50 active:scale-95"
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
