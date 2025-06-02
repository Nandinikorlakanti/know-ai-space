
import React from 'react';
import { cn } from '@/lib/utils';

export const AIThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* Neural network visualization */}
        <div className="relative w-32 h-24">
          {/* Nodes */}
          <div className="absolute top-0 left-4 w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="absolute top-0 right-4 w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="absolute top-1/2 left-0 w-2 h-2 bg-[#8B5CF6] rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          <div className="absolute top-1/2 right-0 w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
          <div className="absolute bottom-0 left-4 w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse" style={{ animationDelay: '800ms' }} />
          <div className="absolute bottom-0 right-4 w-2 h-2 bg-[#8B5CF6] rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />

          {/* Animated connections */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="connectionGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 0 }} />
                <stop offset="50%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="connectionGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0 }} />
                <stop offset="50%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            
            {/* Flowing connection lines */}
            <line x1="20" y1="4" x2="64" y2="48" stroke="url(#connectionGradient1)" strokeWidth="1" opacity="0.6">
              <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0;0,100" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="112" y1="4" x2="68" y2="48" stroke="url(#connectionGradient2)" strokeWidth="1" opacity="0.6">
              <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0;0,100" dur="2.5s" repeatCount="indefinite" />
            </line>
            <line x1="4" y1="48" x2="64" y2="48" stroke="url(#connectionGradient1)" strokeWidth="1" opacity="0.6">
              <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0;0,100" dur="1.8s" repeatCount="indefinite" />
            </line>
            <line x1="128" y1="48" x2="68" y2="48" stroke="url(#connectionGradient2)" strokeWidth="1" opacity="0.6">
              <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0;0,100" dur="2.2s" repeatCount="indefinite" />
            </line>
            <line x1="20" y1="92" x2="64" y2="48" stroke="url(#connectionGradient1)" strokeWidth="1" opacity="0.6">
              <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0;0,100" dur="1.5s" repeatCount="indefinite" />
            </line>
            <line x1="112" y1="92" x2="68" y2="48" stroke="url(#connectionGradient2)" strokeWidth="1" opacity="0.6">
              <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0;0,100" dur="2.8s" repeatCount="indefinite" />
            </line>
          </svg>
        </div>

        {/* Rotating outer ring */}
        <div className="absolute inset-0 border-2 border-transparent border-t-[#F59E0B] border-r-[#3B82F6] rounded-full animate-spin" style={{ animationDuration: '3s' }} />
        
        {/* Text */}
        <div className="mt-6 text-center">
          <div className="text-white font-medium mb-2">AI is thinking...</div>
          <div className="text-white/60 text-sm">
            Analyzing your workspace content
          </div>
          
          {/* Typing dots */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-1 h-1 bg-[#F59E0B] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-[#3B82F6] rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-1 h-1 bg-[#8B5CF6] rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
