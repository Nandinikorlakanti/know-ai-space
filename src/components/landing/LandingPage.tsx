
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, FileText, Brain, Link, Tags, LogOut, User } from 'lucide-react';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';
import { AuthForm } from '@/components/auth/AuthForm';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'Question Answering',
      description: 'Ask questions about your documents and get AI-powered answers based on your workspace content.',
      path: '/question-answering'
    },
    {
      icon: Link,
      title: 'AI Auto Linker',
      description: 'Automatically discover and create connections between related concepts across your documents.',
      path: '/ai-linker'
    },
    {
      icon: Brain,
      title: 'Knowledge Graph',
      description: 'Visualize relationships and connections between concepts in your workspace with an interactive graph.',
      path: '/knowledge-graph'
    },
    {
      icon: Tags,
      title: 'Auto Tag Generator',
      description: 'Automatically generate relevant tags for your documents to improve organization and searchability.',
      path: '/auto-tag-generator'
    },
  ];

  const handleFeatureClick = (feature: { path: string }) => {
    if (user) {
      navigate(feature.path);
    } else {
      setShowAuth(true);
    }
  };

  const handleWorkspaceCreated = () => {
    navigate('/dashboard');
  };

  if (showAuth) {
    return <AuthForm onClose={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1D29] to-[#0F1419] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#00D9FF] to-[#FFB800] bg-clip-text text-transparent">
                AI Workspace
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
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
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={signOut}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAuth(true)}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Unlock the Power of Your
            <span className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] bg-clip-text text-transparent">
              {' '}Documents
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your documents into an intelligent workspace. Upload files, ask questions, 
            discover connections, and visualize knowledge like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] hover:opacity-90 text-black font-semibold px-8 py-3"
              onClick={() => user ? setShowCreateWorkspace(true) : setShowAuth(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Workspace
            </Button>
            {user && (
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
                onClick={() => navigate('/dashboard')}
              >
                View Workspaces
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              onClick={() => handleFeatureClick(feature)}
            >
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-r from-[#00D9FF] to-[#FFB800] rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-black" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/5 rounded-2xl p-12 border border-white/10">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Create your first workspace and experience the power of AI-driven document analysis.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] hover:opacity-90 text-black font-semibold"
            onClick={() => user ? setShowCreateWorkspace(true) : setShowAuth(true)}
          >
            Get Started Now
          </Button>
        </div>
      </div>

      <CreateWorkspaceDialog 
        isOpen={showCreateWorkspace} 
        onClose={() => setShowCreateWorkspace(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
};
