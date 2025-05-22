
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ImageIcon, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Update the prop interface to include onPost
export interface CreatePostProps {
  onPost?: (content: string, image?: string) => Promise<void>;
  className?: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPost, className = '' }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file.name);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Please write something.",
        description: "Content cannot be empty.",
      })
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        toast({
          title: "Login Required",
          description: "Please sign in to create posts",
          variant: "destructive",
        });
        return;
      }
      
      // Create post directly in database
      const { data, error } = await supabase.from('posts').insert({
        user_id: session.user.id,
        content: content,
        image_url: image || null,
        likes: 0
      }).select();
      
      if (error) throw error;
      
      // Call the onPost handler if provided
      if (onPost) {
        await onPost(content, image || undefined);
      }
      
      // Reset the form
      setContent('');
      setImage(null);
      setImagePreview(null);
      
      toast({
        title: "Success!",
        description: "Post created successfully.",
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("bg-white rounded-md shadow-sm p-4 space-y-4", className)}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="resize-none"
      />

      <div>
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="rounded-md w-full h-auto max-h-48 object-cover" />
            <Button
              onClick={handleRemoveImage}
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        )}
        {!imagePreview && (
          <label htmlFor="image-upload" className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 cursor-pointer">
            <ImageIcon className="h-5 w-5" />
            <span>Add Image</span>
          </label>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
