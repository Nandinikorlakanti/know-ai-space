
import React, { useState, useEffect } from 'react';
import { Search, FileText, Plus, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  category: 'pages' | 'actions' | 'ai';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: 'new-page',
      title: 'Create New Page',
      description: 'Add a new page to your workspace',
      icon: Plus,
      category: 'actions',
      action: () => {
        console.log('Creating new page...');
        onClose();
      }
    },
    {
      id: 'search-pages',
      title: 'Search Pages',
      description: 'Find pages in your workspace',
      icon: Search,
      category: 'pages',
      action: () => {
        console.log('Searching pages...');
        onClose();
      }
    },
    {
      id: 'ai-suggest',
      title: 'AI Suggestions',
      description: 'Get AI-powered content suggestions',
      icon: Zap,
      category: 'ai',
      action: () => {
        console.log('Getting AI suggestions...');
        onClose();
      }
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Open workspace settings',
      icon: Settings,
      category: 'actions',
      action: () => {
        console.log('Opening settings...');
        onClose();
      }
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#0B1426]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search size={20} className="text-white/60" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-lg"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
            Esc
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            <div className="p-2">
              {['ai', 'actions', 'pages'].map(category => {
                const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
                if (categoryCommands.length === 0) return null;

                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="px-3 py-2 text-xs uppercase tracking-wide text-white/60 font-medium">
                      {category === 'ai' ? '🤖 AI Features' : 
                       category === 'actions' ? '⚡ Actions' : 
                       '📄 Pages'}
                    </div>
                    {categoryCommands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const Icon = command.icon;
                      
                      return (
                        <button
                          key={command.id}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                            globalIndex === selectedIndex
                              ? "bg-gradient-to-r from-[#00D9FF]/20 to-[#FFB800]/20 border border-[#00D9FF]/30"
                              : "hover:bg-white/5"
                          )}
                          onClick={command.action}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            command.category === 'ai' ? "bg-[#FFB800]/20 text-[#FFB800]" :
                            command.category === 'actions' ? "bg-[#00D9FF]/20 text-[#00D9FF]" :
                            "bg-white/10 text-white/80"
                          )}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{command.title}</div>
                            <div className="text-white/60 text-sm">{command.description}</div>
                          </div>
                          {globalIndex === selectedIndex && (
                            <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-white/60 mb-2">No commands found</div>
              <div className="text-white/40 text-sm">Try a different search term</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-white/10 text-xs text-white/60">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd>
              <span>select</span>
            </div>
          </div>
          <div>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">esc</kbd>
            <span className="ml-1">close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
