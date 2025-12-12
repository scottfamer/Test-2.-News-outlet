import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Shield, Clock, ChevronDown, ChevronUp, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Article } from '../types';
import { fetchArticleById } from '../api';
import { FullArticle } from '../types';
import { useTTS } from '../hooks/useTTS';

interface ReelCardProps {
  article: Article;
  isActive: boolean;
  observerRef: React.MutableRefObject<IntersectionObserver | null>;
}

export default function ReelCard({ article, isActive, observerRef }: ReelCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [fullArticle, setFullArticle] = useState<FullArticle | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  
  // TTS hook - auto-plays when article becomes active, respects global mute state
  const tts = useTTS(article.id, isActive);

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-900/80 border-green-500/30';
    if (score >= 60) return 'text-yellow-700 bg-yellow-900/80 border-yellow-500/30';
    return 'text-orange-700 bg-orange-900/80 border-orange-500/30';
  };

  // Register card with intersection observer
  useEffect(() => {
    const card = cardRef.current;
    if (card && observerRef.current) {
      observerRef.current.observe(card);
      return () => {
        if (observerRef.current) {
          observerRef.current.unobserve(card);
        }
      };
    }
  }, [observerRef]);

  // Handle mute/unmute toggle
  const handleMuteToggle = () => {
    tts.toggleMute();
  };

  const handleExpand = async () => {
    if (!expanded && !fullArticle) {
      setLoadingFull(true);
      try {
        const data = await fetchArticleById(article.id);
        setFullArticle(data);
      } catch (err) {
        console.error('Error loading full article:', err);
      } finally {
        setLoadingFull(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <article 
      ref={cardRef}
      data-article-id={article.id}
      className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 snap-start snap-always"
    >
      <div className="w-full max-w-[600px] h-full flex flex-col px-4 sm:px-6 py-8">
        {/* Content Container - Scrollable when expanded */}
        <div className={`flex-1 overflow-y-auto scrollbar-hide ${expanded ? '' : 'flex flex-col justify-center'}`}>
          <div className="space-y-6">
            {/* Header Badges */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div 
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border backdrop-blur-sm ${getCredibilityColor(article.credibilityScore)}`}
              >
                <Shield className="w-4 h-4" />
                <span>{article.credibilityScore}% Credible</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-900/80 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-700/50">
                <Clock className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(article.timestamp), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              {article.headline}
            </h2>

            {/* Summary */}
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
              {article.summary}
            </p>

            {/* Full Text (when expanded) */}
            {expanded && (
              <div className="space-y-4 animate-fade-in">
                {loadingFull ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-400">Loading full article...</p>
                  </div>
                ) : fullArticle ? (
                  <div className="prose prose-invert prose-lg max-w-none">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {fullArticle.fullText}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Source Info */}
            {article.metadata?.source && (
              <div className="text-sm text-gray-400 bg-gray-900/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50 inline-block">
                <span className="font-medium">Source:</span> {article.metadata.source}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 mt-auto">
          {/* TTS Mute/Unmute Button */}
          <button
            onClick={handleMuteToggle}
            disabled={!isActive}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={tts.isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {tts.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : tts.isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleExpand}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-5 h-5" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                <span>Read Full Story</span>
              </>
            )}
          </button>

          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 border border-gray-700 shadow-lg hover:shadow-xl active:scale-95"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-5 h-5" />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </div>
    </article>
  );
}
