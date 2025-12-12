import { useState, useEffect, useRef } from 'react';
import { Article } from '../types';
import ReelCard from './ReelCard';

interface ReelsContainerProps {
  articles: Article[];
}

export default function ReelsContainer({ articles }: ReelsContainerProps) {
  const [activeArticleId, setActiveArticleId] = useState<number | null>(
    articles.length > 0 ? articles[0].id : null
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer to track visible article
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // An article is considered active if more than 50% is visible
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const articleId = parseInt(entry.target.getAttribute('data-article-id') || '0');
            console.log(`📍 ReelsContainer: Article ${articleId} is now active (${Math.round(entry.intersectionRatio * 100)}% visible)`);
            setActiveArticleId(articleId);
          }
        });
      },
      {
        threshold: [0, 0.5, 1], // Trigger at 0%, 50%, and 100% visibility
        rootMargin: '0px',
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Log when active article changes
  useEffect(() => {
    if (activeArticleId !== null) {
      console.log(`🎯 ReelsContainer: Active article ID set to ${activeArticleId}`);
    }
  }, [activeArticleId]);

  return (
    <div 
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{
        scrollBehavior: 'smooth',
        scrollSnapType: 'y mandatory'
      }}
    >
      {articles.map((article) => (
        <ReelCard 
          key={article.id} 
          article={article}
          isActive={activeArticleId === article.id}
          observerRef={observerRef}
        />
      ))}
    </div>
  );
}
