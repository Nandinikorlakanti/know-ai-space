
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Page {
  id: string;
  title: string;
  path: string[];
  children?: Page[];
  emoji?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onPageSelect: (page: { id: string; title: string; path: string[] }) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onPageSelect }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [pages] = useState<Page[]>([
    {
      id: '1',
      title: 'Getting Started',
      path: ['Home', 'Getting Started'],
      emoji: '🚀',
      children: [
        { id: '2', title: 'Quick Tour', path: ['Home', 'Getting Started', 'Quick Tour'], emoji: '👋' },
        { id: '3', title: 'Templates', path: ['Home', 'Getting Started', 'Templates'], emoji: '📝' }
      ]
    },
    {
      id: '4',
      title: 'Projects',
      path: ['Home', 'Projects'],
      emoji: '📁',
      children: [
        { id: '5', title: 'AI Research', path: ['Home', 'Projects', 'AI Research'], emoji: '🤖' },
        { id: '6', title: 'Design System', path: ['Home', 'Projects', 'Design System'], emoji: '🎨' }
      ]
    }
  ]);

  const PageItem: React.FC<{ page: Page; level: number }> = ({ page, level }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div className="select-none">
        <div
          className={cn(
            "group flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200",
            "hover:bg-white/10 hover:backdrop-blur-md active:scale-95",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onPageSelect(page)}
          draggable
          onDragStart={() => setDraggedItem(page.id)}
          onDragEnd={() => setDraggedItem(null)}
        >
          {page.children && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded transition-transform duration-200"
            >
              <ChevronRight 
                size={12} 
                className={cn(
                  "transition-transform duration-200",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          )}
          
          <span className="text-sm">{page.emoji}</span>
          <span className="text-sm text-white/90 truncate flex-1">{page.title}</span>
          
          <button className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded transition-all duration-200">
            <Plus size={12} />
          </button>
        </div>

        {page.children && isExpanded && (
          <div className="animate-accordion-down">
            {page.children.map((child) => (
              <PageItem key={child.id} page={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-out",
        "bg-[#0B1426]/90 backdrop-blur-xl border-r border-white/10",
        isOpen ? "w-80" : "w-16"
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {isOpen && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#FFB800] flex items-center justify-center">
                <span className="text-sm font-bold text-[#0B1426]">N</span>
              </div>
              <span className="font-semibold text-white">Notion AI</span>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors duration-200"
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isOpen ? (
            <div className="space-y-4 animate-fade-in">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 transition-all duration-200"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#00D9FF]/20 to-[#FFB800]/20 border border-[#00D9FF]/30 rounded-lg text-sm hover:from-[#00D9FF]/30 hover:to-[#FFB800]/30 transition-all duration-200">
                  <Plus size={14} />
                  New Page
                </button>
              </div>

              {/* Pages */}
              <div className="space-y-1">
                <h3 className="text-xs uppercase tracking-wide text-white/60 font-medium mb-2">Pages</h3>
                {pages.map((page) => (
                  <PageItem key={page.id} page={page} level={0} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors duration-200">
                <Search size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors duration-200">
                <Plus size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors duration-200">
                <Settings size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
