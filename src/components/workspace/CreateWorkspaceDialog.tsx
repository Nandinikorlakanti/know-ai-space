
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated?: () => void;
}

interface UploadedFile {
  file: File;
  id: string;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({ 
  isOpen, 
  onClose, 
  onWorkspaceCreated 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50) || 'workspace';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(fileExtension);
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped. Only PDF, DOC, DOCX, and TXT files are supported.');
    }

    const newFiles = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      reader.onerror = () => {
        console.error('Error reading file:', file.name);
        resolve('');
      };
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a workspace');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setLoading(true);

    try {
      const slug = generateSlug(formData.name);
      
      console.log('Creating workspace for user:', user.id);
      
      // Create workspace with required slug field
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          slug: slug,
          owner_id: user.id,
        })
        .select()
        .single();

      if (workspaceError) {
        console.error('Workspace creation error:', workspaceError);
        throw workspaceError;
      }

      console.log('Workspace created successfully:', workspace);

      // Upload files and save to database
      let filesUploaded = 0;
      for (const uploadedFile of uploadedFiles) {
        try {
          const { file } = uploadedFile;
          const filePath = `${user.id}/${workspace.id}/${file.name}`;

          console.log('Uploading file:', filePath);

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('workspace-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error for file:', file.name, uploadError);
            continue;
          }

          // Extract text content for AI processing
          let content = '';
          try {
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
              content = await extractTextFromFile(file);
            }
          } catch (error) {
            console.error('Text extraction error for file:', file.name, error);
          }

          // Save file metadata to database
          const { error: dbError } = await supabase
            .from('files')
            .insert({
              workspace_id: workspace.id,
              name: file.name,
              file_path: filePath,
              file_size: file.size,
              file_type: file.type,
              content,
            });

          if (dbError) {
            console.error('Database error for file:', file.name, dbError);
          } else {
            filesUploaded++;
            console.log('File saved to database:', file.name);
          }
        } catch (fileError) {
          console.error('Error processing file:', uploadedFile.file.name, fileError);
        }
      }

      toast.success(`Workspace created successfully! ${filesUploaded} files uploaded.`);
      
      // Reset form
      setFormData({ name: '', description: '' });
      setUploadedFiles([]);
      
      // Notify parent component
      if (onWorkspaceCreated) {
        onWorkspaceCreated();
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '' });
      setUploadedFiles([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter workspace name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your workspace"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>Upload Files (Optional)</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                "hover:border-blue-400 hover:bg-gray-50",
                loading && "opacity-50 pointer-events-none"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports PDF, DOC, DOCX, TXT files
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <Button type="button" variant="outline" asChild disabled={loading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose Files
                </label>
              </Button>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({uploadedFiles.length})</Label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {uploadedFiles.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{uploadedFile.file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(uploadedFile.file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.id)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
