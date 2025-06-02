
import React from 'react';
import { Network, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GraphTriggerProps {
  onOpenGraph: () => void;
  onToggleAILinker: () => void;
  aiLinkerActive: boolean;
  className?: string;
}

export const GraphTrigger: React.FC<GraphTriggerProps> = ({
  onOpenGraph,
  onToggleAILinker,
  aiLinkerActive,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={onOpenGraph}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0D2818] to-[#000000] border border-[#39FF14]/30 rounded-lg hover:border-[#39FF14]/50 hover:from-[#39FF14]/10 hover:to-[#8B5CF6]/10 transition-all duration-200 group"
        title="Open Knowledge Graph"
      >
        <Network size={16} className="text-[#39FF14] group-hover:animate-pulse" />
        <span className="text-[#39FF14] text-sm font-medium">Graph</span>
      </button>
      
      <button
        onClick={onToggleAILinker}
        className={cn(
          "flex items-center gap-2 px-3 py-2 border rounded-lg transition-all duration-200 group",
          aiLinkerActive
            ? "bg-gradient-to-r from-[#8B5CF6]/20 to-[#39FF14]/20 border-[#8B5CF6]/50 text-[#8B5CF6]"
            : "bg-gradient-to-r from-[#0D2818] to-[#000000] border-[#8B5CF6]/30 hover:border-[#8B5CF6]/50 text-[#8B5CF6]"
        )}
        title={aiLinkerActive ? "Disable AI Linking" : "Enable AI Linking"}
      >
        <Zap size={16} className={cn(
          "transition-all duration-200",
          aiLinkerActive ? "animate-pulse text-[#39FF14]" : "group-hover:animate-pulse"
        )} />
        <span className="text-sm font-medium">
          AI Link {aiLinkerActive ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
};
