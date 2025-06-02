import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Block {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'code' | 'divider';
  content: string;
  level?: number;
}

interface DocumentEditorProps {
  pageId: string;
  title: string;
  onAICardClick: (feature: 'linker' | 'graph' | 'tags' | 'search') => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ pageId, title, onAICardClick }) => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'heading', content: 'AI-Powered Knowledge Management', level: 1 },
    { id: '2', type: 'paragraph', content: 'Welcome to your intelligent workspace where AI enhances your productivity and knowledge organization.' },
    { id: '3', type: 'heading', content: 'Key Features', level: 2 },
    { id: '12', type: 'quote', content: 'Transform your workspace into an intelligent knowledge hub with AI-powered features that understand and enhance your content.' },
  ]);

  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);

  const BlockComponent: React.FC<{ block: Block; index: number }> = ({ block, index }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(block.content);

    const handleContentChange = (newContent: string) => {
      setContent(newContent);
      setBlocks(prev => prev.map(b => 
        b.id === block.id ? { ...b, content: newContent } : b
      ));
    };

    const renderBlock = () => {
      const baseClasses = "outline-none focus:ring-2 focus:ring-[#00D9FF]/50 rounded-md px-2 py-1 transition-all duration-200";
      
      switch (block.type) {
        case 'heading':
          const HeadingTag = `h${block.level || 1}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag 
              className={cn(
                baseClasses,
                block.level === 1 ? "text-3xl font-bold" : "text-xl font-semibold",
                "text-white"
              )}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
            >
              {content}
            </HeadingTag>
          );
        
        case 'paragraph':
          return (
            <p 
              className={cn(baseClasses, "text-[#B8C5D1] leading-relaxed")}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
            >
              {content}
            </p>
          );
        
        case 'list':
          return (
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-[#00D9FF] rounded-full mt-2.5 flex-shrink-0"></span>
              <p 
                className={cn(baseClasses, "text-[#B8C5D1] flex-1")}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
              >
                {content}
              </p>
            </div>
          );
        
        case 'quote':
          return (
            <blockquote className="border-l-4 border-[#FFB800] pl-4 py-2 bg-[#FFB800]/10 rounded-r-md">
              <p 
                className={cn(baseClasses, "text-[#B8C5D1] italic")}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
              >
                {content}
              </p>
            </blockquote>
          );
        
        case 'code':
          return (
            <pre className="bg-[#0B1426] border border-white/20 rounded-lg p-4 overflow-x-auto">
              <code 
                className={cn(baseClasses, "text-[#00D9FF] font-mono text-sm")}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
              >
                {content}
              </code>
            </pre>
          );
        
        case 'divider':
          return <hr className="border-white/20 my-6" />;
        
        default:
          return null;
      }
    };

    return (
      <div 
        className={cn(
          "group relative transition-all duration-200 hover:bg-white/5 rounded-lg p-2 -m-2",
          draggedBlock === block.id && "opacity-50 scale-95"
        )}
        draggable
        onDragStart={() => setDraggedBlock(block.id)}
        onDragEnd={() => setDraggedBlock(null)}
      >
        {/* Block Controls */}
        <div className="absolute left-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-10">
          <button className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded cursor-grab active:cursor-grabbing">
            <GripVertical size={14} className="text-white/60" />
          </button>
          <button 
            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded"
            onClick={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
          >
            <Plus size={14} className="text-white/60" />
          </button>
        </div>

        {/* Block Content */}
        {renderBlock()}

        {/* Block Menu */}
        {showBlockMenu === block.id && (
          <div className="absolute left-0 top-full mt-2 bg-[#0B1426]/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-2 min-w-48 z-10 animate-scale-in">
            <div className="space-y-1">
              {[
                { type: 'paragraph', label: 'Text', icon: '📝' },
                { type: 'heading', label: 'Heading', icon: '📰' },
                { type: 'list', label: 'Bullet List', icon: '•' },
                { type: 'quote', label: 'Quote', icon: '💬' },
                { type: 'code', label: 'Code', icon: '💻' },
                { type: 'divider', label: 'Divider', icon: '➖' },
              ].map((item) => (
                <button
                  key={item.type}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md text-left transition-colors duration-200"
                  onClick={() => {
                    // Add new block after current one
                    const newBlock: Block = {
                      id: Date.now().toString(),
                      type: item.type as Block['type'],
                      content: '',
                      level: item.type === 'heading' ? 1 : undefined
                    };
                    setBlocks(prev => {
                      const newBlocks = [...prev];
                      newBlocks.splice(index + 1, 0, newBlock);
                      return newBlocks;
                    });
                    setShowBlockMenu(null);
                  }}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-sm text-white/90">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">📄</div>
          <input
            type="text"
            defaultValue={title}
            className="text-4xl font-bold bg-transparent border-none outline-none text-white placeholder-white/50"
            placeholder="Untitled"
          />
        </div>
      </div>

      {/* Document Content */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <BlockComponent key={block.id} block={block} index={index} />
        ))}
        
        {/* AI Features Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* AI Auto-Linker Card */}
          <div 
            className="bg-gradient-to-br from-[#1E1B4B]/90 to-[#000000]/90 backdrop-blur-xl border border-[#00D9FF]/30 rounded-xl p-6 hover:border-[#00D9FF]/50 transition-all duration-300 cursor-pointer"
            onClick={() => onAICardClick('linker')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#00D9FF]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-white">AI Auto-Linker</h3>
            </div>
            <p className="text-[#B8C5D1] mb-4">As you write, our AI automatically suggests linking to other related pages, creating a connected network of knowledge.</p>
            <div className="flex items-center gap-2 text-sm text-[#00D9FF]">
              <span>Learn More</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          {/* Knowledge Graph Builder Card */}
          <div 
            className="bg-gradient-to-br from-[#1E1B4B]/90 to-[#000000]/90 backdrop-blur-xl border border-[#FFB800]/30 rounded-xl p-6 hover:border-[#FFB800]/50 transition-all duration-300 cursor-pointer"
            onClick={() => onAICardClick('graph')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#FFB800]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Knowledge Graph Builder</h3>
            </div>
            <p className="text-[#B8C5D1] mb-4">Visualize your document relationships as a live, interactive graph. See how your ideas connect and evolve over time.</p>
            <div className="flex items-center gap-2 text-sm text-[#FFB800]">
              <span>View graph</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          {/* Auto Tag Generator Card */}
          <div 
            className="bg-gradient-to-br from-[#1E1B4B]/90 to-[#000000]/90 backdrop-blur-xl border border-[#8B5CF6]/30 rounded-xl p-6 hover:border-[#8B5CF6]/50 transition-all duration-300 cursor-pointer"
            onClick={() => onAICardClick('tags')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏷️</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Auto Tag Generator</h3>
            </div>
            <p className="text-[#B8C5D1] mb-4">AI generates semantic tags for every page, enabling smarter search and better content organization.</p>
            <div className="flex items-center gap-2 text-sm text-[#8B5CF6]">
              <span>Generate tags</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          {/* Question Answering Card */}
          <div 
            className="bg-gradient-to-br from-[#1E1B4B]/90 to-[#000000]/90 backdrop-blur-xl border border-[#F59E0B]/30 rounded-xl p-6 hover:border-[#F59E0B]/50 transition-all duration-300 cursor-pointer"
            onClick={() => onAICardClick('search')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Question Answering</h3>
            </div>
            <p className="text-[#B8C5D1] mb-4">Ask questions about your workspace content. Our AI will find and present the most relevant information from your documents.</p>
            <div className="flex items-center gap-2 text-sm text-[#F59E0B]">
              <span>Ask a question</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
        
        {/* Add Block Button */}
        <button 
          className="w-full flex items-center gap-2 px-4 py-3 border-2 border-dashed border-white/20 rounded-lg hover:border-[#00D9FF]/50 hover:bg-[#00D9FF]/5 transition-all duration-200 group"
          onClick={() => {
            const newBlock: Block = {
              id: Date.now().toString(),
              type: 'paragraph',
              content: ''
            };
            setBlocks(prev => [...prev, newBlock]);
          }}
        >
          <Plus size={16} className="text-white/60 group-hover:text-[#00D9FF]" />
          <span className="text-white/60 group-hover:text-[#00D9FF]">Click to add a new block</span>
        </button>
      </div>
    </div>
  );
};
