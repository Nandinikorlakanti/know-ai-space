
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Tags, Home, LogOut, User, Loader2, Sparkles, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedTag {
  name: string;
  confidence: number;
  auto_generated: boolean;
  type?: string;
}

interface TagGenerationResult {
  tags: GeneratedTag[];
  keywords?: string[];
  total_content_length?: number;
  chunks_analyzed?: number;
  error?: string;
  message?: string;
}

export const AutoTagGenerator: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [customContent, setCustomContent] = useState<string>('');
  const [generatedTags, setGeneratedTags] = useState<GeneratedTag[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStats, setAnalysisStats] = useState<{
    contentLength?: number;
    chunksAnalyzed?: number;
    keywords?: string[];
  }>({});

  const handleGenerateTags = async (useCustomContent: boolean = false) => {
    if (!selectedWorkspace) {
      toast.error('Please select a workspace first');
      return;
    }

    if (useCustomContent && !customContent.trim()) {
      toast.error('Please enter some content to analyze');
      return;
    }

    setIsGenerating(true);
    setGeneratedTags([]);
    setAnalysisStats({});

    try {
      const requestBody: any = {
        workspace: selectedWorkspace,
      };

      if (useCustomContent) {
        requestBody.content = customContent;
      }

      const response = await fetch('http://localhost:8000/generate_tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: TagGenerationResult = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tags');
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.message) {
        toast.info(data.message);
      }

      setGeneratedTags(data.tags || []);
      setAnalysisStats({
        contentLength: data.total_content_length,
        chunksAnalyzed: data.chunks_analyzed,
        keywords: data.keywords,
      });

      if (data.tags && data.tags.length > 0) {
        toast.success(`Generated ${data.tags.length} tags successfully!`);
      } else {
        toast.info('No tags were generated. Try with different content.');
      }

    } catch (error) {
      console.error('Error generating tags:', error);
      toast.error('Failed to generate tags. Make sure the FastAPI backend is running on port 8000.');
    } finally {
      setIsGenerating(false);
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
          <h1 className="text-3xl font-bold mb-2">Auto Tag Generator</h1>
          <p className="text-gray-300">Generate semantic tags for your workspace content using AI</p>
        </div>

        {/* Workspace Selection */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Tags className="mr-2 h-5 w-5" />
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

        {/* Tag Generation Options */}
        {selectedWorkspace && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Analyze Workspace */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  Analyze Entire Workspace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Generate tags based on all content in your selected workspace
                </p>
                <Button
                  onClick={() => handleGenerateTags(false)}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-[#00D9FF] to-[#FFB800] hover:opacity-90 text-black"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing Workspace...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Workspace
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analyze Custom Content */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze Custom Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Enter text content to analyze for tags..."
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                  disabled={isGenerating}
                />
                <Button
                  onClick={() => handleGenerateTags(true)}
                  disabled={isGenerating || !customContent.trim()}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-90 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing Content...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Statistics */}
        {Object.keys(analysisStats).length > 0 && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Analysis Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {analysisStats.contentLength && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00D9FF]">{analysisStats.contentLength}</div>
                    <div className="text-gray-400">Characters Analyzed</div>
                  </div>
                )}
                {analysisStats.chunksAnalyzed && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFB800]">{analysisStats.chunksAnalyzed}</div>
                    <div className="text-gray-400">Content Chunks</div>
                  </div>
                )}
                {analysisStats.keywords && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#8B5CF6]">{analysisStats.keywords.length}</div>
                    <div className="text-gray-400">Keywords Found</div>
                  </div>
                )}
              </div>
              {analysisStats.keywords && analysisStats.keywords.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Extracted Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisStats.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Generated Tags */}
        {generatedTags.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Generated Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedTags.map((tag, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white capitalize">{tag.name}</span>
                      <span className="text-xs text-gray-400">
                        {Math.round(tag.confidence * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] h-2 rounded-full"
                        style={{ width: `${tag.confidence * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        {tag.auto_generated ? 'AI Generated' : 'Manual'}
                      </span>
                      {tag.type && (
                        <span className="px-2 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full">
                          {tag.type}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedWorkspace && generatedTags.length === 0 && !isGenerating && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-8">
              <div className="text-center text-gray-400">
                <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a workspace and click "Analyze Workspace" or enter custom content to generate AI-powered tags.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
