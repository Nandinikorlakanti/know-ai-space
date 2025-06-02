
import React, { useState } from 'react';
import { FileText, Calendar, User, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Source {
  id: string;
  title: string;
  content: string;
  type: string;
  author: string;
  date: string;
  relevanceScore: number;
}

interface SourceAttributionCardProps {
  source: Source;
}

export const SourceAttributionCard: React.FC<SourceAttributionCardProps> = ({ source }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-24 cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      {/* Card container with flip effect */}
      <div className={cn(
        "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d",
        isFlipped ? "rotate-y-180" : ""
      )}>
        
        {/* Front face */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <FileText size={16} className="text-[#3B82F6]" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{source.title}</h4>
                <div className="text-white/60 text-xs mt-1">
                  {source.type} • {Math.round(source.relevanceScore * 100)}% match
                </div>
              </div>
            </div>
            
            {/* Relevance indicator */}
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#F59E0B]" />
              <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] rounded-full transition-all duration-1000"
                  style={{ width: `${source.relevanceScore * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Back face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 backdrop-blur-sm rounded-lg border border-[#3B82F6]/30 p-4">
          <div className="flex flex-col justify-between h-full">
            <div className="text-white/80 text-xs leading-relaxed overflow-hidden">
              {source.content.substring(0, 120)}...
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <User size={10} />
                  <span>{source.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={10} />
                  <span>{new Date(source.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <button className="text-[#3B82F6] hover:text-[#60A5FA] text-xs transition-colors">
                View Source
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
