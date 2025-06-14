
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DocumentEditor } from './DocumentEditor';
import { CommandPalette } from './CommandPalette';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';
import { KnowledgeGraph } from './KnowledgeGraph';
import { AILinker } from './AILinker';
import { GraphTrigger } from './GraphTrigger';
import { AISearchInterface } from './AISearchInterface';
import { AISearchTrigger } from './AISearchTrigger';
import { cn } from '@/lib/utils';

interface WorkspaceProps {
  className?: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ className }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [knowledgeGraphOpen, setKnowledgeGraphOpen] = useState(false);
  const [aiLinkerActive, setAiLinkerActive] = useState(false);
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState({
    id: '1',
    title: 'Welcome to Your Workspace',
    path: ['Home', 'Getting Started']
  });

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        setKnowledgeGraphOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
        e.preventDefault();
        setAiSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLinkSuggestion = (pageId: string, text: string) => {
    console.log('Creating link to:', pageId, text);
    setAiLinkerActive(false);
  };

  const handlePageSelect = (page: { id: string; title: string; path: string }) => {
    setCurrentPage({
      id: page.id,
      title: page.title,
      path: [page.path] // Convert string to array for breadcrumbs
    });
  };

  return (
    <div className={cn(
      "min-h-screen w-full bg-gradient-to-br from-[#1A1D29] to-[#0F1419] text-white overflow-hidden",
      className
    )}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onPageSelect={handlePageSelect}
      />

      {/* Main Content Area */}
      <div className={cn(
        "transition-all duration-300 ease-out",
        sidebarOpen ? "ml-80" : "ml-16"
      )}>
        {/* Top Navigation */}
        <nav className="h-16 border-b border-white/10 backdrop-blur-md bg-white/5 flex items-center justify-between px-6">
          <Breadcrumbs path={currentPage.path} />
          <div className="flex items-center gap-4">
            <AISearchTrigger onOpenSearch={() => setAiSearchOpen(true)} />
            <GraphTrigger
              onOpenGraph={() => setKnowledgeGraphOpen(true)}
              onToggleAILinker={() => setAiLinkerActive(!aiLinkerActive)}
              aiLinkerActive={aiLinkerActive}
            />
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00D9FF] to-[#FFB800] flex items-center justify-center text-sm font-medium">
              U
            </div>
          </div>
        </nav>

        {/* Document Editor */}
        <main className="p-6">
          <DocumentEditor 
            pageId={currentPage.id}
            title={currentPage.title}
            onAICardClick={(feature) => {
              if (feature === 'linker') setAiLinkerActive(true);
              if (feature === 'graph') setKnowledgeGraphOpen(true);
              if (feature === 'search') setAiSearchOpen(true);
              // Note: Auto Tag Generator doesn't have a dedicated open state in Workspace yet
              // You might need to add state and logic for it if needed.
              console.log(`Clicked on ${feature} card`);
            }}
          />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Knowledge Graph */}
      <KnowledgeGraph
        isOpen={knowledgeGraphOpen}
        onClose={() => setKnowledgeGraphOpen(false)}
      />

      {/* AI Linker */}
      <AILinker
        isActive={aiLinkerActive}
        currentText="This is sample text about machine learning and AI algorithms"
        cursorPosition={0}
        onLinkSuggestion={handleLinkSuggestion}
        onDismiss={() => setAiLinkerActive(false)}
      />

      {/* AI Search Interface */}
      <AISearchInterface
        isOpen={aiSearchOpen}
        onClose={() => setAiSearchOpen(false)}
      />
    </div>
  );
};
