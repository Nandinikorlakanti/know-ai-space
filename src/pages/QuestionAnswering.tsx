
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Send, FileText, Home, LogOut, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const QuestionAnswering: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const workspaceFromUrl = searchParams.get('workspace');
    if (workspaceFromUrl) {
      setSelectedWorkspace(workspaceFromUrl);
    }
  }, [searchParams]);

  const handleSubmitQuestion = async () => {
    if (!question.trim() || !selectedWorkspace) {
      toast.error('Please select a workspace and enter a question');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspace: selectedWorkspace,
          question: userMessage.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error processing question:', error);
      toast.error('Failed to process your question. Make sure the backend is running.');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your question. Please make sure the backend server is running and try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion();
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
          <h1 className="text-3xl font-bold mb-2">Question Answering</h1>
          <p className="text-gray-300">Ask questions about your documents and get AI-powered answers</p>
        </div>

        {/* Workspace Selection */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="mr-2 h-5 w-5" />
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

        {/* Chat Interface */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Ask Your Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-black/20 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Select a workspace and ask a question to get started
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isUser
                          ? 'bg-gradient-to-r from-[#00D9FF] to-[#FFB800] text-black'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Analyzing your documents...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your documents..."
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                disabled={isLoading || !selectedWorkspace}
              />
              <Button
                onClick={handleSubmitQuestion}
                disabled={isLoading || !selectedWorkspace || !question.trim()}
                className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] hover:opacity-90 text-black"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
