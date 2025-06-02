
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, Clock, Star } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<AIResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      content: 'Introduction to machine learning concepts and algorithms...',
      type: 'page',
      author: 'John Doe',
      date: '2024-01-15',
      relevanceScore: 0.95
    },
    {
      id: '2',
      title: 'Neural Network Architecture',
      content: 'Deep dive into neural network structures and design patterns...',
      type: 'document',
      author: 'Jane Smith',
      date: '2024-01-10',
      relevanceScore: 0.87
    }
  ];

  const suggestedQuestions = [
    "How do neural networks learn?",
    "What is the difference between supervised and unsupervised learning?",
    "Explain gradient descent algorithm",
    "What are the best practices for data preprocessing?"
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setIsExpanded(true);
    }
  }, [isOpen]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsThinking(true);
    setSearchResults([]);
    setAIResponse(null);

    // Add to search history
    setSearchHistory(prev => [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 10));

    // Simulate API call delay
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      
      // Simulate AI response
      const response: AIResponse = {
        id: Date.now().toString(),
        question: searchQuery,
        answer: `Based on your workspace content, here's what I found about "${searchQuery}". Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. The key concepts include supervised learning, unsupervised learning, and reinforcement learning.`,
        sources: mockSearchResults,
        confidence: 0.92,
        timestamp: new Date().toISOString()
      };
      
      setAIResponse(response);
      setIsThinking(false);
    }, 2000);
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
      {/* Backdrop with star field */}
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
      
      {/* Search Interface */}
      <div className="relative w-full max-w-4xl mx-4 animate-scale-in">
        {/* Expandable Search Bar */}
        <div className={cn(
          "relative bg-gradient-to-r from-[#1E1B4B]/90 to-[#000000]/90 backdrop-blur-xl border border-[#F59E0B]/30 rounded-2xl shadow-2xl transition-all duration-500 ease-out",
          isExpanded ? "p-6" : "p-4"
        )}>
          {/* Search Input */}
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
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSearch(query)}
                disabled={!query.trim() || isThinking}
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

          {/* Quick Access Buttons */}
          <div className="flex items-center gap-2 mb-4">
            <button className="px-3 py-1 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] text-sm rounded-full transition-colors flex items-center gap-2">
              <Clock size={14} />
              Recent
            </button>
            <button className="px-3 py-1 bg-[#3B82F6]/20 hover:bg-[#3B82F6]/30 text-[#3B82F6] text-sm rounded-full transition-colors flex items-center gap-2">
              <BookOpen size={14} />
              Documents
            </button>
            <button className="px-3 py-1 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] text-sm rounded-full transition-colors flex items-center gap-2">
              <Star size={14} />
              Saved
            </button>
          </div>

          {/* AI Thinking Indicator */}
          {isThinking && (
            <div className="mb-6">
              <AIThinkingIndicator />
            </div>
          )}

          {/* AI Response */}
          {aiResponse && !isThinking && (
            <div className="mb-6">
              <AIResponseCard 
                response={aiResponse} 
                onSave={() => saveAnswer(aiResponse)}
              />
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && !isThinking && (
            <div className="mb-6">
              <SearchResultsList results={searchResults} />
            </div>
          )}

          {/* Question Suggestions */}
          {!query && !isThinking && !aiResponse && (
            <QuestionSuggestions 
              questions={suggestedQuestions}
              onSelectQuestion={(question) => {
                setQuery(question);
                handleSearch(question);
              }}
            />
          )}

          {/* Search History */}
          {searchHistory.length > 0 && !query && !isThinking && !aiResponse && (
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

        {/* Footer */}
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
