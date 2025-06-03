
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const QuestionAnswering: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const getWorkspaceFiles = async (workspaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('content, name')
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workspace files:', error);
      return [];
    }
  };

  const generateAnswer = async (question: string, context: string) => {
    // This is a simple mock implementation
    // In a real application, you would call your AI service here
    const contextSnippet = context.substring(0, 500);
    return `Based on your documents, ${question.toLowerCase().includes('what') ? 'here is what I found' : 'I can help with that'}. Context from your files suggests: "${contextSnippet}...". This is a simulated AI response based on your workspace content.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedWorkspaceId || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Get files from selected workspace
      const files = await getWorkspaceFiles(selectedWorkspaceId);
      const context = files.map(file => file.content).join('\n');

      if (files.length === 0) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "No files found in this workspace. Please upload some documents first.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Generate AI response based on context
      const aiResponse = await generateAnswer(inputValue, context);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1D29] to-[#0F1419] text-white">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Question Answering</h1>
            </div>
            <WorkspaceSelector
              selectedWorkspaceId={selectedWorkspaceId}
              onWorkspaceChange={setSelectedWorkspaceId}
              className="w-64 bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-120px)]">
        {!selectedWorkspaceId ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-white mb-2">Select a Workspace</h3>
                <p className="text-gray-400">Choose a workspace to start asking questions about your documents.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-8 text-center">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                      <h3 className="text-lg font-medium text-white mb-2">Ready to Answer Your Questions</h3>
                      <p className="text-gray-400">Ask me anything about the documents in your selected workspace.</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-3 max-w-3xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.isUser ? 'bg-blue-600' : 'bg-gray-600'}`}>
                        {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <Card className={`${message.isUser ? 'bg-blue-600/20 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                        <CardContent className="p-4">
                          <p className="text-white">{message.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-gray-400 text-sm">AI is thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex space-x-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your documents..."
                className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
