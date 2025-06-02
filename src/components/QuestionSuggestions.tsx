
import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

interface QuestionSuggestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export const QuestionSuggestions: React.FC<QuestionSuggestionsProps> = ({ 
  questions, 
  onSelectQuestion 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-white/80 font-medium flex items-center gap-2">
        <Sparkles size={16} className="text-[#F59E0B]" />
        Suggested Questions
      </h3>
      
      <div className="grid gap-3">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(question)}
            className="group relative bg-white/5 hover:bg-gradient-to-r hover:from-[#F59E0B]/10 hover:to-[#3B82F6]/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-[#F59E0B]/30 transition-all duration-300 text-left animate-fade-in"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Bubble animation effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/5 to-[#3B82F6]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 group-hover:bg-[#F59E0B]/30 flex items-center justify-center transition-colors">
                <HelpCircle size={16} className="text-[#F59E0B]" />
              </div>
              
              <div className="flex-1">
                <div className="text-white group-hover:text-[#F59E0B] transition-colors font-medium">
                  {question}
                </div>
                <div className="text-white/60 text-xs mt-1">
                  Click to ask this question
                </div>
              </div>
              
              {/* Hover arrow */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#F59E0B]">
                →
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#F59E0B]/20 to-[#3B82F6]/20 opacity-0 group-hover:opacity-100 blur-sm -z-10 transition-opacity duration-300" />
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <div className="text-white/40 text-xs">
          Or type your own question above
        </div>
      </div>
    </div>
  );
};
