
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Calendar, MoreVertical, Search, LogOut, User } from 'lucide-react';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Workspace {
  id: string;
  name: string;
  description: string;
  created_at: string;
  file_count?: number;
}

export const WorkspaceDashboard: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const fetchWorkspaces = async () => {
    if (!user) return;

    try {
      console.log('Fetching workspaces for user:', user.id);
      
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          id,
          name,
          description,
          created_at
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workspaces:', error);
        throw error;
      }

      console.log('Fetched workspaces:', data);

      // Get file counts for each workspace
      const workspacesWithCount = await Promise.all(
        (data || []).map(async (workspace) => {
          const { count } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id);
          
          return {
            ...workspace,
            file_count: count || 0,
          };
        })
      );

      setWorkspaces(workspacesWithCount);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchWorkspaces();
    }
  }, [user, authLoading]);

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      toast.success('Workspace deleted successfully');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast.error('Failed to delete workspace');
    }
  };

  const handleWorkspaceCreated = () => {
    fetchWorkspaces();
  };

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1D29] to-[#0F1419] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

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
                    onClick={signOut}
                    className="text-white border-white/20 hover:bg-white/10"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Workspaces</h1>
            <p className="text-gray-300">Manage your document workspaces and explore AI-powered insights</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] hover:opacity-90 text-black font-semibold mt-4 md:mt-0"
            onClick={() => setShowCreateWorkspace(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Workspaces Grid */}
        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm ? 'No workspaces found' : 'No workspaces yet'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first workspace to get started'}
            </p>
            {!searchTerm && (
              <Button 
                className="bg-gradient-to-r from-[#00D9FF] to-[#FFB800] hover:opacity-90 text-black font-semibold"
                onClick={() => setShowCreateWorkspace(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace) => (
              <Card 
                key={workspace.id} 
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/question-answering?workspace=${workspace.id}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{workspace.name}</CardTitle>
                    <CardDescription className="text-gray-300 mt-1">
                      {workspace.description || 'No description'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkspace(workspace.id);
                        }}
                      >
                        Delete Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>{workspace.file_count || 0} files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(workspace.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceDialog 
        isOpen={showCreateWorkspace} 
        onClose={() => setShowCreateWorkspace(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
};
