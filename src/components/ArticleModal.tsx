import { useEffect, useState } from 'react';
import { X, ExternalLink, Shield, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchArticleById } from '../api';
import { FullArticle } from '../types';

interface ArticleModalProps {
  articleId: number;
  onClose: () => void;
}

export default function ArticleModal({ articleId, onClose }: ArticleModalProps) {
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const data = await fetchArticleById(articleId);
        setArticle(data);
      } catch (err) {
        setError('Failed to load article');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-orange-700 bg-orange-50 border-orange-200';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">Full Article</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading article...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : article ? (
            <article className="prose prose-lg max-w-none">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mb-6 not-prose">
                <div 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getCredibilityColor(article.credibilityScore)}`}
                >
                  <Shield className="w-4 h-4" />
                  <span>{article.credibilityScore}% Credibility Score</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(article.timestamp), { addSuffix: true })}</span>
                </div>

                {article.metadata?.source && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Source:</span> {article.metadata.source}
                  </div>
                )}
              </div>

              {/* Headline */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {article.headline}
              </h1>

              {/* Summary */}
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                {article.summary}
              </p>

              {/* Full Text */}
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                {article.fullText}
              </div>

              {/* Source Link */}
              <div className="mt-8 pt-6 border-t border-gray-200 not-prose">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <span>View Original Source</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </div>
  );
}
