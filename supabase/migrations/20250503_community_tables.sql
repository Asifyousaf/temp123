
-- Create the community_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  title TEXT,
  category TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the post_likes table for tracking post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create the comments table for post comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a function to increment likes count
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts 
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts 
  SET likes_count = likes_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for the likes count
CREATE TRIGGER increment_likes_count
AFTER INSERT ON post_likes
FOR EACH ROW
EXECUTE PROCEDURE increment_post_likes();

CREATE TRIGGER decrement_likes_count
AFTER DELETE ON post_likes
FOR EACH ROW
EXECUTE PROCEDURE decrement_post_likes();

-- Create storage bucket for community images if it doesn't exist
-- First check if the bucket exists to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'community') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('community', 'Community Content', true);
    END IF;
END $$;

-- Set up row level security policies for the storage bucket
CREATE POLICY IF NOT EXISTS "Allow public read access to community bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'community');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload to community bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'community' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow users to update their own objects in community bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'community' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'community' AND auth.uid() = owner);

CREATE POLICY IF NOT EXISTS "Allow users to delete their own objects in community bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'community' AND auth.uid() = owner);

-- Set up RLS for community_posts
CREATE POLICY "Public access to community_posts" ON community_posts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own posts" ON community_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON community_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON community_posts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Set up RLS for comments
CREATE POLICY "Public access to comments" ON comments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Set up RLS for post_likes
CREATE POLICY "Public access to post_likes" ON post_likes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own likes" ON post_likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON post_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
