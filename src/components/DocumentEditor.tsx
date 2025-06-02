
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
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ pageId, title }) => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'heading', content: 'Welcome to Your Workspace', level: 1 },
    { id: '2', type: 'paragraph', content: 'This is your personal workspace where you can create, organize, and collaborate on documents with the power of AI.' },
    { id: '3', type: 'heading', content: 'Getting Started', level: 2 },
    { id: '4', type: 'list', content: 'Create new pages and organize them in the sidebar' },
    { id: '5', type: 'list', content: 'Use the command palette (Cmd+K) for quick actions' },
    { id: '6', type: 'list', content: 'Let AI help you connect ideas and find relevant content' },
    { id: '7', type: 'quote', content: 'AI-powered knowledge management makes your ideas more connected and discoverable.' },
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
        
        {/* AI Suggestions Banner */}
        <div className="bg-gradient-to-r from-[#FFB800]/20 to-[#00D9FF]/20 border border-[#FFB800]/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FFB800] to-[#00D9FF] rounded-full flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/90">
                <strong>AI Assistant:</strong> I found 3 related pages that might be helpful. Would you like me to suggest some connections?
              </p>
            </div>
            <button className="px-4 py-2 bg-[#00D9FF]/20 border border-[#00D9FF]/50 rounded-md text-sm hover:bg-[#00D9FF]/30 transition-colors duration-200">
              Show Links
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <BlockComponent key={block.id} block={block} index={index} />
        ))}
        
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
