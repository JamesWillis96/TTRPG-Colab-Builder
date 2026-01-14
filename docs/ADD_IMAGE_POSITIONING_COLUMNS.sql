-- Add image positioning columns to profiles table
ALTER TABLE profiles ADD COLUMN image_zoom DECIMAL DEFAULT 1.0;
ALTER TABLE profiles ADD COLUMN image_position_x INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN image_position_y INTEGER DEFAULT 0;

-- Add comments
COMMENT ON COLUMN profiles.image_zoom IS 'Zoom level for profile image display (1.0 = 100%)';
COMMENT ON COLUMN profiles.image_position_x IS 'Horizontal offset of image in pixels';
COMMENT ON COLUMN profiles.image_position_y IS 'Vertical offset of image in pixels';
