
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Tags, Home, LogOut, User, Loader2, Sparkles, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedTag {
  name: string;
  confidence: number;
  auto_generated: boolean;
  type?: string;
}

interface TagGenerationResult {
  tags: GeneratedTag[];
  keywords: string[];
  total_content_length: number;
  chunks_analyzed: number;
  error?: string;
  message?: string;
}

export const AutoTagGenerator: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<GeneratedTag[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [analysisStats, setAnalysisStats] = useState<{
    contentLength: number;
    chunksAnalyzed: number;
  } | null>(null);

  const handleGenerateTags = async () => {
    if (!selectedWorkspace) {
      toast.error('Please select a workspace first');
      return;
    }

    setIsLoading(true);
    setGeneratedTags([]);
    setKeywords([]);
    setAnalysisStats(null);

    try {
      const response = await fetch('http://localhost:5000/generate_tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace: selectedWorkspace,
        }),
      });

      const data: TagGenerationResult = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tags');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.message) {
        toast.info(data.message);
        return;
      }

      setGeneratedTags(data.tags || []);
      setKeywords(data.keywords || []);
      setAnalysisStats({
        contentLength: data.total_content_length || 0,
        chunksAnalyzed: data.chunks_analyzed || 0,
      });

      toast.success(`Generated ${data.tags?.length || 0} tags successfully!`);
    } catch (error) {
      console.error('Error generating tags:', error);
      toast.error('Failed to generate tags. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Tags className="mr-3 h-8 w-8" />
            Auto Tag Generator
          </h1>
          <p className="text-gray-300">Automatically generate relevant tags for your documents using AI to improve organization and searchability</p>
        </div>

        {/* Workspace Selection */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Select Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WorkspaceSelector
              selectedWorkspaceId={selectedWorkspace}
              onWorkspaceChange={setSelectedWorkspace}
              className="bg-white/5 border-white/20 text-white"
            />
            
            <Button
              onClick={handleGenerateTags}
              disabled={isLoading || !selectedWorkspace}
              className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] hover:opacity-90 text-black w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Tags...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Auto Tags
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Statistics */}
        {analysisStats && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Analysis Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 p-3 rounded-lg">
                  <span className="text-gray-400">Content Analyzed:</span>
                  <span className="text-white ml-2 font-semibold">
                    {analysisStats.contentLength.toLocaleString()} characters
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <span className="text-gray-400">Chunks Processed:</span>
                  <span className="text-white ml-2 font-semibold">
                    {analysisStats.chunksAnalyzed}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Tags */}
        {generatedTags.length > 0 && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Tags className="mr-2 h-5 w-5" />
                  Generated Tags ({generatedTags.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateTags}
                  disabled={isLoading || !selectedWorkspace}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-3">
                  {generatedTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className={`${getConfidenceColor(tag.confidence)} font-medium`}
                        >
                          {tag.name}
                        </Badge>
                        {tag.type === 'keyword' && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                            Keyword
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-300">
                          {getConfidenceLabel(tag.confidence)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {(tag.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                Extracted Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-indigo-100 text-indigo-800 border-indigo-200"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && generatedTags.length === 0 && selectedWorkspace && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="text-center py-12">
              <Tags className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Tags Generated Yet</h3>
              <p className="text-gray-400 mb-4">
                Select a workspace and click "Generate Auto Tags" to analyze your documents and create relevant tags.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
