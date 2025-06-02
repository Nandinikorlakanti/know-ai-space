
import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Save, Share, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourceAttributionCard } from './SourceAttributionCard';

interface AIResponse {
  id: string;
  question: string;
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    author: string;
    date: string;
    relevanceScore: number;
  }>;
  confidence: number;
  timestamp: string;
}

interface AIResponseCardProps {
  response: AIResponse;
  onSave: () => void;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({ response, onSave }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Typewriter effect for AI response
  useEffect(() => {
    const text = response.answer;
    let index = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typeWriter = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeWriter);
      }
    }, 20);

    return () => clearInterval(typeWriter);
  }, [response.answer]);

  const handleSave = () => {
    setIsSaved(true);
    onSave();
    setTimeout(() => setIsSaved(false), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response.answer);
  };

  return (
    <div className="relative animate-fade-in">
      {/* Rainbow edge lighting effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F59E0B] via-[#3B82F6] to-[#8B5CF6] rounded-xl opacity-30 blur-sm animate-pulse" />
      
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-[#1E1B4B]/90 to-[#000000]/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">AI Assistant</h3>
              <div className="flex items-center gap-2">
                <div className="text-xs text-white/60">
                  Confidence: {Math.round(response.confidence * 100)}%
                </div>
                {/* Confidence indicator ring */}
                <div className="relative w-4 h-4">
                  <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 16 16">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-white/20"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 6}`}
                      strokeDashoffset={`${2 * Math.PI * 6 * (1 - response.confidence)}`}
                      className="text-[#F59E0B] transition-all duration-1000"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Copy response"
            >
              <Copy size={16} className="text-white/60 hover:text-white" />
            </button>
            <button
              onClick={handleSave}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                isSaved 
                  ? "bg-[#F59E0B]/20 text-[#F59E0B]" 
                  : "hover:bg-white/10 text-white/60 hover:text-white"
              )}
              title="Save answer"
            >
              <Save size={16} />
            </button>
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Share"
            >
              <Share size={16} className="text-white/60 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="mb-4 p-3 bg-white/5 rounded-lg border-l-4 border-[#F59E0B]">
          <div className="text-[#F59E0B] text-sm font-medium mb-1">Your Question</div>
          <div className="text-white">{response.question}</div>
        </div>

        {/* AI Response with typewriter effect */}
        <div className="mb-6">
          <div className="text-white leading-relaxed">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-5 bg-[#F59E0B] ml-1 animate-pulse" />
            )}
          </div>
        </div>

        {/* Sources section */}
        {response.sources.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
            >
              <span className="text-sm font-medium">
                View Sources ({response.sources.length})
              </span>
              <div className={cn(
                "w-4 h-4 transition-transform duration-200",
                showSources ? "rotate-180" : ""
              )}>
                ↓
              </div>
            </button>

            {showSources && (
              <div className="grid gap-3 animate-fade-in">
                {response.sources.map((source, index) => (
                  <div
                    key={source.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-fade-in"
                  >
                    <SourceAttributionCard source={source} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="text-xs text-white/40">
            Generated at {new Date(response.timestamp).toLocaleTimeString()}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 mr-2">Was this helpful?</span>
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <ThumbsUp size={14} className="text-white/60 hover:text-green-400" />
            </button>
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <ThumbsDown size={14} className="text-white/60 hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
