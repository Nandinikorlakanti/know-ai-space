
import React, { useState, useEffect } from 'react';
import { Zap, Link, X, Check, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkSuggestion {
  id: string;
  targetPage: string;
  confidence: number;
  reason: string;
  preview: string;
  type: 'semantic' | 'contextual' | 'related';
}

interface AILinkerProps {
  isActive: boolean;
  currentText: string;
  cursorPosition: number;
  onLinkSuggestion: (pageId: string, text: string) => void;
  onDismiss: () => void;
  workspace?: string;
}

export const AILinker: React.FC<AILinkerProps> = ({
  isActive,
  currentText,
  cursorPosition,
  onLinkSuggestion,
  onDismiss,
  workspace = 'default-workspace'
}) => {
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateSuggestions = async (text: string): Promise<LinkSuggestion[]> => {
    try {
      const response = await fetch('http://localhost:8000/extract_links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace: workspace,
          text: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to get suggestions:', data.detail);
        return [];
      }

      return data.suggestions || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  useEffect(() => {
    if (isActive && currentText.length > 10) {
      setIsAnalyzing(true);
      
      const timer = setTimeout(async () => {
        const newSuggestions = await generateSuggestions(currentText);
        setSuggestions(newSuggestions);
        setSelectedIndex(0);
        setIsAnalyzing(false);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [isActive, currentText, workspace]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev === 0 ? suggestions.length - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onLinkSuggestion(
              suggestions[selectedIndex].id,
              suggestions[selectedIndex].targetPage
            );
          }
          break;
        case 'Escape':
          onDismiss();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, suggestions, selectedIndex, onLinkSuggestion, onDismiss]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* AI Analysis Indicator */}
      {isAnalyzing && (
        <div className="absolute top-20 right-8 pointer-events-auto animate-fade-in">
          <div className="bg-gradient-to-r from-[#8B5CF6]/90 to-[#39FF14]/90 backdrop-blur-xl border border-[#8B5CF6]/30 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain size={20} className="text-white animate-pulse" />
                <div className="absolute inset-0 animate-spin">
                  <Sparkles size={20} className="text-[#39FF14]" />
                </div>
              </div>
              <div>
                <div className="text-white font-medium">AI Analyzing Content</div>
                <div className="text-white/70 text-sm">Finding relevant connections...</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Suggestions Panel */}
      {suggestions.length > 0 && !isAnalyzing && (
        <div className="absolute top-20 right-8 w-96 pointer-events-auto animate-slide-in-right">
          <div className="bg-gradient-to-br from-[#0D2818]/95 to-[#000000]/95 backdrop-blur-xl border border-[#39FF14]/30 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#39FF14]/20 to-[#8B5CF6]/20 border-b border-[#39FF14]/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-[#39FF14]" />
                  <span className="font-medium text-white">AI Link Suggestions</span>
                </div>
                <button
                  onClick={onDismiss}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                >
                  <X size={14} className="text-white/60" />
                </button>
              </div>
              <div className="text-sm text-white/70 mt-1">
                Found {suggestions.length} relevant connections
              </div>
            </div>

            {/* Suggestions List */}
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={cn(
                    "p-4 border-b border-[#39FF14]/10 cursor-pointer transition-all duration-200",
                    index === selectedIndex
                      ? "bg-gradient-to-r from-[#39FF14]/20 to-[#8B5CF6]/20 border-l-4 border-l-[#39FF14]"
                      : "hover:bg-white/5"
                  )}
                  onClick={() => onLinkSuggestion(suggestion.id, suggestion.targetPage)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link size={14} className="text-[#39FF14]" />
                        <span className="font-medium text-white truncate">
                          {suggestion.targetPage}
                        </span>
                      </div>
                      <div className="text-sm text-white/70 mb-2">
                        {suggestion.preview}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            suggestion.type === 'semantic' ? "bg-[#39FF14]/20 text-[#39FF14]" :
                            suggestion.type === 'related' ? "bg-[#8B5CF6]/20 text-[#8B5CF6]" :
                            "bg-[#FFB800]/20 text-[#FFB800]"
                          )}>
                            {suggestion.type}
                          </span>
                          <span className="text-xs text-white/50">
                            {suggestion.reason}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="text-xs text-white/50">
                            {(suggestion.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#39FF14] to-[#8B5CF6] transition-all duration-300"
                              style={{ width: `${suggestion.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index === selectedIndex && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#39FF14]/20">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#39FF14]/20 border border-[#39FF14]/50 rounded-lg text-[#39FF14] hover:bg-[#39FF14]/30 transition-colors">
                        <Check size={14} />
                        Create Link
                      </button>
                      <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/70 hover:bg-white/20 transition-colors">
                        Preview
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-[#0D2818]/50 p-3 border-t border-[#39FF14]/30">
              <div className="flex items-center justify-between text-xs text-white/60">
                <div className="flex items-center gap-3">
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
                  <span className="ml-1">dismiss</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
