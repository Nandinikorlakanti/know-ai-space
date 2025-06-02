
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  path: string[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, className }) => {
  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {path.map((segment, index) => (
        <React.Fragment key={index}>
          <button
            className={cn(
              "px-2 py-1 rounded-md transition-all duration-200 text-sm",
              index === path.length - 1
                ? "text-white font-medium"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            {segment}
          </button>
          {index < path.length - 1 && (
            <ChevronRight size={14} className="text-white/40" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
