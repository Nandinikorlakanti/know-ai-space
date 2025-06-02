import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, Clock, Star, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIResponseCard } from './AIResponseCard';
import { SearchResultsList } from './SearchResultsList';
import { AIThinkingIndicator } from './AIThinkingIndicator';
import { QuestionSuggestions } from './QuestionSuggestions';

interface AISearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'page' | 'document' | 'note';
  author: string;
  date: string;
  relevanceScore: number;
}

interface AIResponse {
  id: string;
  question: string;
  answer: string;
  sources: SearchResult[];
  confidence: number;
  timestamp: string;
}

export const AISearchInterface: React.FC<AISearchInterfaceProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showNewWorkspaceInput, setShowNewWorkspaceInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<AIResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('http://localhost:5000/workspaces');
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }
      const data: string[] = await response.json();
      setWorkspaces(data);
      if (data.length > 0 && !data.includes(selectedWorkspace)) {
          setSelectedWorkspace(data[0]);
      } else if (data.length === 0) {
          setSelectedWorkspace('');
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setWorkspaces([]);
      setSelectedWorkspace('');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkspaces();
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setIsExpanded(true);
    } else {
        setQuery('');
        setAIResponse(null);
        setSearchResults([]);
        setShowNewWorkspaceInput(false);
        setNewWorkspaceName('');
    }
  }, [isOpen]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !selectedWorkspace.trim()) {
      console.log("Query or selected workspace is empty.");
      return;
    }

    setIsThinking(true);
    setSearchResults([]);
    setAIResponse(null);

    setSearchHistory(prev => [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 10));

    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspace: selectedWorkspace, question: searchQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch answer from backend');
      }

      const data = await response.json();

      const aiResponse: AIResponse = {
        id: Date.now().toString(),
        question: searchQuery,
        answer: data.answer,
        sources: [],
        confidence: 1.0,
        timestamp: new Date().toISOString()
      };
      
      setAIResponse(aiResponse);

    } catch (error) {
      console.error('Error fetching answer:', error);
      setAIResponse({
        id: Date.now().toString(),
        question: searchQuery,
        answer: `Error fetching answer: ${error instanceof Error ? error.message : String(error)}`,
        sources: [],
        confidence: 0,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
        console.log("New workspace name is empty.");
        return;
    }
    setIsThinking(true);
    try {
        const response = await fetch('http://localhost:5000/create_workspace', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspace: newWorkspaceName })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create workspace');
        }
        await fetchWorkspaces();
        setSelectedWorkspace(newWorkspaceName);
        setNewWorkspaceName('');
        setShowNewWorkspaceInput(false);
        console.log(`Workspace \'${newWorkspaceName}\' created.`);
    } catch (error) {
        console.error('Error creating workspace:', error);
    } finally {
        setIsThinking(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedWorkspace.trim()) {
        console.log("No workspace selected for file upload.");
        return;
    }
    const files = event.target.files;
    if (!files || files.length === 0) {
        return;
    }

    const formData = new FormData();
    for (const file of Array.from(files)) {
        formData.append('file', file);
    }

    setIsThinking(true);
    try {
        const response = await fetch(`http://localhost:5000/upload_file/${selectedWorkspace}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload file');
        }

        const data = await response.json();
        console.log('File upload successful:', data.message);

    } catch (error) {
        console.error('Error uploading file:', error);
    } finally {
        setIsThinking(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const saveAnswer = (response: AIResponse) => {
    setSavedAnswers(prev => [response, ...prev]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        style={{
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, #fff, transparent),
                           radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                           radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
                           radial-gradient(2px 2px at 160px 30px, #fff, transparent)`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px'
        }}
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl mx-4 animate-scale-in">
        <div className={cn(
          "relative bg-gradient-to-r from-[#1E1B4B]/90 to-[#000000]/90 backdrop-blur-xl border border-[#F59E0B]/30 rounded-2xl shadow-2xl transition-all duration-500 ease-out",
          isExpanded ? "p-6" : "p-4"
        )}>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F59E0B]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything about your workspace..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/60 text-lg outline-none border-b border-[#F59E0B]/20 focus:border-[#F59E0B]/60 transition-colors"
              />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] opacity-0 transform scale-x-0 transition-all duration-300 focus-within:opacity-100 focus-within:scale-x-100" />
            </div>
            
            <div className="relative">
               <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                className="w-40 px-4 py-4 bg-transparent text-white text-lg outline-none border-b border-[#00D9FF]/20 focus:border-[#00D9FF]/60 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.362%22%20height%3D%22292.362%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287.045%2C104.493%20l-14.291%2C-14.293%20c-19.53,-19.529%20-51.187%2C-19.529%20-70.717%2C0%20l-144.06%2C144.06%20l-144.06%2C-144.06%20c-19.529%2C-19.529%20-51.188%2C-19.529%20-70.717%2C0%20l-14.292%2C14.293%20c-19.529%2C19.529%20-19.529%2C51.188%2C0%2C70.717%20l178.374%2C178.372%20c19.529%2C19.53%2051.187%2C19.53%2070.717%2C0%20l178.374%2C-178.372%20C306.574%2C155.681%2C306.574%2C124.022%2C287.045%2C104.493%20z%22/%3E%3C/svg%3E) no-repeat right 0.7em center/12px rgba(0,0,0,0)"
               >
                 {workspaces.map(ws => <option key={ws} value={ws}>{ws}</option>)}
               </select>
               <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] opacity-0 transform scale-x-0 transition-all duration-300 focus-within:opacity-100 focus-within:scale-x-100" />
            </div>

            <div className="flex items-center gap-2">
               <button
                 onClick={() => setShowNewWorkspaceInput(!showNewWorkspaceInput)}
                 className="p-3 bg-gradient-to-r from-[#8B5CF6] to-[#00D9FF] rounded-lg hover:shadow-lg hover:shadow-[#8B5CF6]/25 transition-all duration-200"
                 title="Create New Workspace"
               >
                 <Plus size={20} className="text-white" />
               </button>
               
               <input
                 type="file"
                 ref={fileInputRef}
                 multiple
                 onChange={handleFileUpload}
                 className="hidden"
               />
               <button
                 onClick={() => fileInputRef.current?.click()}
                 disabled={!selectedWorkspace}
                 className="p-3 bg-gradient-to-r from-[#3B82F6] to-[#FFB800] rounded-lg hover:shadow-lg hover:shadow-[#3B82F6]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                 title="Upload Files to Workspace"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
               </button>

              <button
                onClick={() => handleSearch(query)}
                disabled={!query.trim() || isThinking || !selectedWorkspace.trim()}
                className="p-3 bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] rounded-lg hover:shadow-lg hover:shadow-[#F59E0B]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={20} className="text-white" />
              </button>
              
              <button
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-white text-sm">Esc</span>
              </button>
            </div>
          </div>
          
          {showNewWorkspaceInput && (
              <div className="flex items-center gap-2 mb-4 animate-fade-in">
                <input
                  type="text"
                  placeholder="Enter new workspace name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleCreateWorkspace(); }}
                  className="flex-1 px-4 py-2 bg-transparent text-white placeholder-white/60 outline-none border-b border-[#8B5CF6]/20 focus:border-[#8B5CF6]/60 transition-colors"
                />
                <button
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim()}
                  className="px-4 py-2 bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 rounded-md text-sm text-[#8B5CF6] hover:bg-[#8B5CF6]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowNewWorkspaceInput(false); setNewWorkspaceName(''); }}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-md text-sm text-white/80 hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
          )}

          {isThinking && (
            <div className="mb-6">
              <AIThinkingIndicator />
            </div>
          )}

          {aiResponse && !isThinking && (
            <div className="mb-6">
              <AIResponseCard 
                response={aiResponse} 
                onSave={() => saveAnswer(aiResponse)}
              />
            </div>
          )}

          {searchResults.length > 0 && !isThinking && (
            <div className="mb-6">
              <SearchResultsList results={searchResults} />
            </div>
          )}

          {searchHistory.length > 0 && !query && !isThinking && !aiResponse && !showNewWorkspaceInput && (
            <div className="mt-4">
              <h3 className="text-white/80 text-sm font-medium mb-2">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((historyQuery, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(historyQuery);
                      handleSearch(historyQuery);
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 text-sm rounded-full transition-colors"
                  >
                    {historyQuery}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <div className="text-white/40 text-xs">
            Powered by AI • Press{' '}
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[#F59E0B]">Ctrl+Space</kbd>
            {' '}for quick search
          </div>
        </div>
      </div>
    </div>
  );
};
