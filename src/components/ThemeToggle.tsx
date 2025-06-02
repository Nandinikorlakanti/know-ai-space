
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // In a real app, you'd persist this to localStorage and update CSS variables
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-12 h-6 rounded-full transition-all duration-300 ease-out",
        "bg-gradient-to-r from-[#0B1426] to-[#1A1D29] border border-white/20",
        "hover:border-[#00D9FF]/50 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ease-out",
          "bg-gradient-to-r from-[#00D9FF] to-[#FFB800] shadow-lg",
          isDark ? "left-0.5" : "left-6"
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <Moon size={10} className="text-[#0B1426]" />
          ) : (
            <Sun size={10} className="text-[#0B1426]" />
          )}
        </div>
      </div>
    </button>
  );
};
