
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Download, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  title: string;
  type: 'page' | 'concept' | 'tag';
  x: number;
  y: number;
  connections: string[];
  strength: number;
  lastModified: Date;
}

interface Link {
  source: string;
  target: string;
  strength: number;
  type: 'manual' | 'ai-suggested' | 'semantic';
}

interface KnowledgeGraphProps {
  isOpen: boolean;
  onClose: () => void;
  nodes?: Node[];
  links?: Link[];
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  isOpen, 
  onClose, 
  nodes = [], 
  links = [] 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Sample data for demonstration
  const sampleNodes: Node[] = [
    {
      id: '1',
      title: 'AI Research',
      type: 'page',
      x: 300,
      y: 200,
      connections: ['2', '3'],
      strength: 0.9,
      lastModified: new Date()
    },
    {
      id: '2',
      title: 'Machine Learning',
      type: 'concept',
      x: 500,
      y: 150,
      connections: ['1', '4'],
      strength: 0.8,
      lastModified: new Date()
    },
    {
      id: '3',
      title: 'Neural Networks',
      type: 'concept',
      x: 400,
      y: 350,
      connections: ['1', '4'],
      strength: 0.7,
      lastModified: new Date()
    },
    {
      id: '4',
      title: 'Deep Learning',
      type: 'tag',
      x: 600,
      y: 300,
      connections: ['2', '3'],
      strength: 0.85,
      lastModified: new Date()
    }
  ];

  const sampleLinks: Link[] = [
    { source: '1', target: '2', strength: 0.9, type: 'manual' },
    { source: '1', target: '3', strength: 0.7, type: 'ai-suggested' },
    { source: '2', target: '4', strength: 0.8, type: 'semantic' },
    { source: '3', target: '4', strength: 0.6, type: 'ai-suggested' }
  ];

  const activeNodes = nodes.length > 0 ? nodes : sampleNodes;
  const activeLinks = links.length > 0 ? links : sampleLinks;

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw connections
    activeLinks.forEach(link => {
      const sourceNode = activeNodes.find(n => n.id === link.source);
      const targetNode = activeNodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        // Different colors for different link types
        switch (link.type) {
          case 'manual':
            ctx.strokeStyle = '#00FFFF';
            break;
          case 'ai-suggested':
            ctx.strokeStyle = '#8B5CF6';
            break;
          case 'semantic':
            ctx.strokeStyle = '#39FF14';
            break;
        }
        
        ctx.lineWidth = link.strength * 3;
        ctx.globalAlpha = 0.6 + link.strength * 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw nodes
    activeNodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const isFiltered = filter === 'all' || filter === node.type;
      const matchesSearch = !searchQuery || node.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!isFiltered || !matchesSearch) return;

      ctx.beginPath();
      ctx.arc(node.x, node.y, 15 + node.strength * 10, 0, 2 * Math.PI);
      
      // Node colors based on type
      switch (node.type) {
        case 'page':
          ctx.fillStyle = isSelected ? '#39FF14' : '#0D2818';
          break;
        case 'concept':
          ctx.fillStyle = isSelected ? '#8B5CF6' : '#4C1D95';
          break;
        case 'tag':
          ctx.fillStyle = isSelected ? '#00FFFF' : '#0F766E';
          break;
      }
      
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = '#39FF14';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.title, node.x, node.y + 35);
    });

    ctx.restore();
  };

  useEffect(() => {
    if (isOpen) {
      drawGraph();
    }
  }, [isOpen, selectedNode, zoomLevel, panOffset, filter, searchQuery]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const y = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    // Find clicked node
    const clickedNode = activeNodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 15 + node.strength * 10;
    });

    setSelectedNode(clickedNode || null);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.1, Math.min(3, newZoom));
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0A1F0A] to-[#000000] animate-fade-in">
      {/* Header */}
      <div className="h-16 bg-[#0D2818]/90 backdrop-blur-xl border-b border-[#39FF14]/20 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-[#39FF14]">Knowledge Graph</h2>
          <div className="flex items-center gap-2">
            <Search size={16} className="text-white/60" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0D2818] border border-[#39FF14]/30 rounded-lg px-3 py-1 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#39FF14]/50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#0D2818] border border-[#39FF14]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]/50"
          >
            <option value="all">All Types</option>
            <option value="page">Pages</option>
            <option value="concept">Concepts</option>
            <option value="tag">Tags</option>
          </select>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 bg-[#0D2818] border border-[#39FF14]/30 rounded-lg hover:bg-[#39FF14]/10 transition-colors"
            >
              <ZoomOut size={16} className="text-[#39FF14]" />
            </button>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 bg-[#0D2818] border border-[#39FF14]/30 rounded-lg hover:bg-[#39FF14]/10 transition-colors"
            >
              <ZoomIn size={16} className="text-[#39FF14]" />
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0D2818] border border-[#39FF14]/30 rounded-lg hover:bg-[#39FF14]/10 transition-colors text-[#39FF14]"
          >
            Close
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 64}
          className="cursor-crosshair"
          onClick={handleCanvasClick}
        />
        
        {/* Node Details Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 bg-[#0D2818]/95 backdrop-blur-xl border border-[#39FF14]/30 rounded-xl p-4 animate-slide-in-right">
            <h3 className="text-lg font-bold text-[#39FF14] mb-2">{selectedNode.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Type:</span>
                <span className="text-white capitalize">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Strength:</span>
                <span className="text-white">{(selectedNode.strength * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Connections:</span>
                <span className="text-white">{selectedNode.connections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Last Modified:</span>
                <span className="text-white">{selectedNode.lastModified.toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-[#39FF14]/20 border border-[#39FF14]/50 rounded-lg text-[#39FF14] hover:bg-[#39FF14]/30 transition-colors">
                Open Page
              </button>
              <button className="flex-1 px-3 py-2 bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 rounded-lg text-[#8B5CF6] hover:bg-[#8B5CF6]/30 transition-colors">
                AI Suggest
              </button>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[#0D2818]/95 backdrop-blur-xl border border-[#39FF14]/30 rounded-xl p-4">
          <h4 className="text-sm font-bold text-[#39FF14] mb-3">Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0D2818] border border-[#39FF14] rounded-full"></div>
              <span className="text-white">Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#4C1D95] border border-[#39FF14] rounded-full"></div>
              <span className="text-white">Concepts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0F766E] border border-[#39FF14] rounded-full"></div>
              <span className="text-white">Tags</span>
            </div>
            <hr className="border-[#39FF14]/30 my-2" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[#00FFFF]"></div>
              <span className="text-white">Manual Links</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[#8B5CF6]"></div>
              <span className="text-white">AI Suggested</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[#39FF14]"></div>
              <span className="text-white">Semantic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
