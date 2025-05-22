
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Author {
  name: string;
  avatar: string;
  username: string;
  id?: string;
}

interface PostComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author?: Author;
}

interface CommunityPostProps {
  post: {
    id: string;
    author: Author;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timePosted: string;
    likedByMe?: boolean;
  };
}

// Define a type for the profile data to help with type checking
interface ProfileData {
  full_name?: string;
  avatar_url?: string;
}

const CommunityPost = ({ post }: CommunityPostProps) => {
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postComments, setPostComments] = useState<PostComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.session.user.id)
          .single();
        
        if (profileData) {
          setCurrentUser({
            id: data.session.user.id,
            name: profileData.full_name || data.session.user.email?.split('@')[0] || 'User'
          });
        } else {
          setCurrentUser({
            id: data.session.user.id,
            name: data.session.user.email?.split('@')[0] || 'User'
          });
        }
      }
    };
    
    fetchUser();
  }, []);
  
  const handleLike = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Login Required",
          description: "Please sign in to like posts",
          variant: "destructive",
        });
        return;
      }
      
      // Update optimistically
      const newLikeStatus = !liked;
      const newLikeCount = liked ? likeCount - 1 : likeCount + 1;
      
      setLiked(newLikeStatus);
      setLikeCount(newLikeCount);
      
      try {
        // Call the community-posts function to handle the backend logic
        const { data, error } = await supabase.functions.invoke('community-posts', {
          body: {
            action: 'like',
            post: {
              id: post.id,
              likes_count: likeCount
            }
          }
        });
        
        if (error) throw error;
      } catch (error) {
        console.error("Error updating like status:", error);
        // Revert on error
        setLiked(liked);
        setLikeCount(likeCount);
        
        toast({
          title: "Error",
          description: "Failed to update like status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert on error
      setLiked(liked);
      setLikeCount(likeCount);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  const fetchComments = async () => {
    if (!showComments) return;
    
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content, 
          created_at,
          user_id,
          profiles:user_id(full_name, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPostComments((data || []).map(comment => {
        // Handle profiles data correctly - it can be null or an array with a single object
        const profileData = comment.profiles;
        let fullName = 'Unknown User';
        let avatarUrl = '';
        
        // Check if profileData exists and extract the data properly
        if (profileData) {
          // Check if it's an array explicitly
          if (Array.isArray(profileData)) {
            if (profileData.length > 0) {
              // Access the first element of the array
              const profile = profileData[0];
              fullName = profile && typeof profile === 'object' && 'full_name' in profile 
                ? profile.full_name || 'Unknown User' 
                : 'Unknown User';
              avatarUrl = profile && typeof profile === 'object' && 'avatar_url' in profile 
                ? profile.avatar_url || '' 
                : '';
            }
          } else if (typeof profileData === 'object') {
            // It's a single object, not an array
            // Use type checking to ensure TypeScript knows these properties exist
            const typedProfileData = profileData as ProfileData;
            fullName = typedProfileData.full_name || 'Unknown User';
            avatarUrl = typedProfileData.avatar_url || '';
          }
        }
        
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user_id: comment.user_id,
          author: {
            name: fullName,
            avatar: avatarUrl,
            username: '',
          }
        };
      }));
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post.id]);
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      toast({
        title: "Login Required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: sessionData.session.user.id,
          content: commentText.trim()
        })
        .select();
        
      if (error) throw error;
      
      // Refresh comments
      fetchComments();
      setCommentText('');
      
      // Increase comment count
      post.comments += 1;
      
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleShare = () => {
    toast({
      title: "Post shared",
      description: "The post has been shared to your profile",
    });
  };
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center space-y-0">
        <div className="flex items-center flex-1">
          <Avatar className="h-10 w-10 mr-3 border">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{post.author.name}</div>
            <div className="text-xs text-gray-500">@{post.author.username} • {post.timePosted}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="mb-4">{post.content}</p>
        {post.image && (
          <div className="rounded-md overflow-hidden mb-2">
            <img src={post.image} alt="Post content" className="w-full object-cover" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 border-t flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike} 
          className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-red-500' : ''}`} />
          {likeCount}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          {post.comments}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </CardFooter>
      
      {showComments && (
        <div className="p-4 bg-gray-50 border-t">
          <form onSubmit={handleAddComment} className="flex items-center mb-4">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{currentUser?.name.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <input 
              type="text" 
              placeholder="Write a comment..." 
              className="w-full border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmittingComment}
            />
            <Button 
              type="submit" 
              size="sm" 
              className="ml-2"
              variant="ghost" 
              disabled={!commentText.trim() || isSubmittingComment}
            >
              Post
            </Button>
          </form>
          
          {isLoadingComments ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
              <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : postComments.length > 0 ? (
            <div className="space-y-4">
              {postComments.map(comment => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{comment.author?.name.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="bg-white rounded-lg px-3 py-2 text-sm flex-1">
                    <p className="font-medium text-xs">{comment.author?.name}</p>
                    <p>{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default CommunityPost;
