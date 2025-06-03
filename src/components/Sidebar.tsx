
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Settings, FileText, Brain, Link, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Page {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<any>;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onPageSelect: (page: { id: string; title: string; path: string }) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onPageSelect }) => {
  const navigate = useNavigate();
  const [pages] = useState<Page[]>([
    {
      id: '1',
      title: 'Question Answering',
      path: '/question-answering',
      icon: FileText
    },
    {
      id: '2',
      title: 'AI Auto Linker',
      path: '/ai-linker',
      icon: Link
    },
    {
      id: '3',
      title: 'Knowledge Graph',
      path: '/knowledge-graph',
      icon: Brain
    },
    {
      id: '4',
      title: 'Auto Tag Generator',
      path: '/auto-tag-generator',
      icon: Tags
    }
  ]);

  const handlePageClick = (page: Page) => {
    navigate(page.path);
    onPageSelect({ id: page.id, title: page.title, path: page.path });
  };

  const PageItem: React.FC<{ page: Page }> = ({ page }) => {
    return (
      <div className="select-none">
        <div
          className={cn(
            "group flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200",
            "hover:bg-white/10 hover:backdrop-blur-md active:scale-95"
          )}
          onClick={() => handlePageClick(page)}
        >
          <page.icon size={16} className="text-white/90" />
          <span className="text-sm text-white/90 truncate flex-1">{page.title}</span>
          
          <button className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded transition-all duration-200">
            <Plus size={12} />
          </button>
        </div>
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
                <span className="text-sm font-bold text-[#0B1426]">A</span>
              </div>
              <span className="font-semibold text-white">AI Workspace</span>
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
                  placeholder="Search features..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 transition-all duration-200"
                />
              </div>

              {/* Features */}
              <div className="space-y-1">
                <h3 className="text-xs uppercase tracking-wide text-white/60 font-medium mb-2">AI Features</h3>
                {pages.map((page) => (
                  <PageItem key={page.id} page={page} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors duration-200">
                <Search size={16} />
              </button>
              {pages.map((page) => (
                <button 
                  key={page.id}
                  onClick={() => handlePageClick(page)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors duration-200"
                  title={page.title}
                >
                  <page.icon size={16} />
                </button>
              ))}
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
