import { Article } from '../types';
import ReelCard from './ReelCard';

interface ReelsContainerProps {
  articles: Article[];
}

export default function ReelsContainer({ articles }: ReelsContainerProps) {
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
        />
      ))}
    </div>
  );
}
