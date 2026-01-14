-- Add profile_image column to profiles table
ALTER TABLE profiles ADD COLUMN profile_image TEXT;

-- Add comment
COMMENT ON COLUMN profiles.profile_image IS 'URL to user profile image/avatar';
