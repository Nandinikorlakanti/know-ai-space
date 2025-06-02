
import React from 'react';
import { FileText, File, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'page' | 'document' | 'note';
  author: string;
  date: string;
  relevanceScore: number;
}

interface SearchResultsListProps {
  results: SearchResult[];
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({ results }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return FileText;
      case 'document':
        return File;
      case 'note':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page':
        return 'text-[#F59E0B]';
      case 'document':
        return 'text-[#3B82F6]';
      case 'note':
        return 'text-[#8B5CF6]';
      default:
        return 'text-white/60';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-[#F59E0B] to-[#3B82F6] rounded-full" />
        Search Results ({results.length})
      </h3>
      
      {results.map((result, index) => {
        const Icon = getTypeIcon(result.type);
        
        return (
          <div
            key={result.id}
            className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-[#F59E0B]/30 transition-all duration-300 cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/10 to-[#3B82F6]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    result.type === 'page' ? "bg-[#F59E0B]/20" :
                    result.type === 'document' ? "bg-[#3B82F6]/20" :
                    "bg-[#8B5CF6]/20"
                  )}>
                    <Icon size={16} className={getTypeColor(result.type)} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-white font-medium group-hover:text-[#F59E0B] transition-colors">
                      {result.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                      <span>by {result.author}</span>
                      <span>•</span>
                      <span>{new Date(result.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{result.type}</span>
                    </div>
                  </div>
                </div>

                {/* Relevance score */}
                <div className="flex items-center gap-2">
                  <div className="text-xs text-white/60">
                    {Math.round(result.relevanceScore * 100)}%
                  </div>
                  <div className="relative w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] rounded-full transition-all duration-1000"
                      style={{ width: `${result.relevanceScore * 100}%` }}
                    />
                  </div>
                  <ExternalLink size={14} className="text-white/40 group-hover:text-white/60 transition-colors" />
                </div>
              </div>

              {/* Content preview */}
              <div className="text-white/80 text-sm leading-relaxed">
                {result.content}
              </div>

              {/* Highlight effect */}
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#F59E0B] to-[#3B82F6] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
