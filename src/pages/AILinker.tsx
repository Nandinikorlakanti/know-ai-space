
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Link, Home, LogOut, User, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  title: string;
}

interface LinkSuggestion {
  id: string;
  targetPage: string;
  confidence: number;
  reason: string;
  preview: string;
  type: 'semantic' | 'contextual' | 'related';
}

export const AILinker: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [currentText, setCurrentText] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceDocuments();
    } else {
      setDocuments([]);
      setSelectedPage('');
    }
  }, [selectedWorkspace]);

  const fetchWorkspaceDocuments = async () => {
    if (!selectedWorkspace) return;

    setIsLoadingDocs(true);
    try {
      const response = await fetch(`http://localhost:5000/workspace_documents/${selectedWorkspace}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents');
      }

      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load workspace documents');
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleAnalyzeText = async () => {
    if (!selectedWorkspace || !currentText.trim()) {
      toast.error('Please select a workspace and enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setSuggestions([]);

    try {
      const response = await fetch('http://localhost:5000/extract_links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace: selectedWorkspace,
          text: currentText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze text');
      }

      setSuggestions(data.suggestions || []);
      
      if (data.suggestions && data.suggestions.length > 0) {
        toast.success(`Found ${data.suggestions.length} potential link suggestions`);
      } else {
        toast.info('No relevant links found for the current text');
      }

    } catch (error) {
      console.error('Error analyzing text:', error);
      toast.error('Failed to analyze text. Make sure the backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1D29] to-[#0F1419] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 
                className="text-xl font-bold bg-gradient-to-r from-[#00D9FF] to-[#FFB800] bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate('/')}
              >
                AI Workspace
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dashboard')}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={signOut}
                    className="text-white border-gray-600 bg-gray-800 hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Auto Linker</h1>
          <p className="text-gray-300">Automatically discover and create connections between related concepts across your documents</p>
        </div>

        {/* Workspace Selection */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Link className="mr-2 h-5 w-5" />
              Select Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkspaceSelector
              selectedWorkspaceId={selectedWorkspace}
              onWorkspaceChange={setSelectedWorkspace}
              className="bg-white/5 border-white/20 text-white"
            />
          </CardContent>
        </Card>

        {/* Page Selection */}
        {selectedWorkspace && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Select Page/Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPage} onValueChange={setSelectedPage} disabled={isLoadingDocs}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder={isLoadingDocs ? "Loading documents..." : "Choose a document to analyze"} />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Text Analysis */}
        {selectedWorkspace && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Text Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Enter text to analyze for potential links..."
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[120px]"
                disabled={isAnalyzing}
              />
              <Button
                onClick={handleAnalyzeText}
                disabled={isAnalyzing || !selectedWorkspace || !currentText.trim()}
                className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] hover:opacity-90 text-black"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze for Links'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Link Suggestions */}
        {suggestions.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Link Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link className="h-4 w-4 text-[#39FF14]" />
                          <span className="font-medium text-white">
                            {suggestion.targetPage}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          {suggestion.preview}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              suggestion.type === 'semantic' ? 'bg-[#39FF14]/20 text-[#39FF14]' :
                              suggestion.type === 'related' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                              'bg-[#FFB800]/20 text-[#FFB800]'
                            }`}>
                              {suggestion.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {suggestion.reason}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                            <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#39FF14] to-[#8B5CF6]"
                                style={{ width: `${suggestion.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedWorkspace && suggestions.length === 0 && !isAnalyzing && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-8">
              <div className="text-center text-gray-400">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter some text and click "Analyze for Links" to find potential connections in your workspace.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
