import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Shield } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  index: number;
}

export default function ArticleCard({ article, onClick, index }: ArticleCardProps) {
  const getCredibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-orange-700 bg-orange-50 border-orange-200';
  };

  return (
    <article
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 cursor-pointer group animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Credibility Badge */}
        <div className="flex items-center justify-between mb-3">
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getCredibilityColor(article.credibilityScore)}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{article.credibilityScore}% Credible</span>
          </div>
          
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(article.timestamp), { addSuffix: true })}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-3 group-hover:text-blue-600 transition-colors">
          {article.headline}
        </h2>

        {/* Summary */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {article.metadata?.source && (
              <span className="font-medium">{article.metadata.source}</span>
            )}
          </div>

          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-1 group-hover:h-1.5 transition-all" />
    </article>
  );
}
