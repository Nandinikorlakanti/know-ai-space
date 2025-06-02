
import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISearchTriggerProps {
  onOpenSearch: () => void;
  className?: string;
}

export const AISearchTrigger: React.FC<AISearchTriggerProps> = ({
  onOpenSearch,
  className
}) => {
  return (
    <button
      onClick={onOpenSearch}
      className={cn(
        "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E1B4B] to-[#000000] border border-[#F59E0B]/30 rounded-lg hover:border-[#F59E0B]/50 hover:from-[#F59E0B]/10 hover:to-[#3B82F6]/10 transition-all duration-200 group",
        className
      )}
      title="AI Search & Q&A"
    >
      <div className="relative">
        <Search size={16} className="text-[#F59E0B] group-hover:opacity-0 transition-opacity" />
        <Sparkles size={16} className="text-[#3B82F6] absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity group-hover:animate-pulse" />
      </div>
      <span className="text-[#F59E0B] text-sm font-medium">Ask AI</span>
      <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
        Ctrl+Space
      </kbd>
    </button>
  );
};
