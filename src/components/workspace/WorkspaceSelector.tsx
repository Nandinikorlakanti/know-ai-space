
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Folder } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string;
}

interface WorkspaceSelectorProps {
  selectedWorkspaceId?: string;
  onWorkspaceChange: (workspaceId: string) => void;
  className?: string;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  selectedWorkspaceId,
  onWorkspaceChange,
  className,
}) => {
  const { user, session } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user || !session) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const { data, error } = await supabase
          .from('workspaces')
          .select('id, name, description')
          .eq('owner_id', user.id)
          .order('name');

        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
          return;
        }

        setWorkspaces(data || []);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        setError('Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, session]);

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading workspaces..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder={`Error: ${error}`} />
        </SelectTrigger>
      </Select>
    );
  }

  if (workspaces.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="No workspaces available - create one first" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={selectedWorkspaceId} onValueChange={onWorkspaceChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center space-x-2">
          <Folder className="h-4 w-4" />
          <SelectValue placeholder="Select a workspace" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((workspace) => (
          <SelectItem key={workspace.id} value={workspace.name}>
            <div className="flex flex-col">
              <span className="font-medium">{workspace.name}</span>
              {workspace.description && (
                <span className="text-sm text-gray-500">{workspace.description}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
