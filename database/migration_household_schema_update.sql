-- Migration: Update households and family_members schema
-- File: database/migration_household_schema_update.sql
-- Run this in Supabase SQL Editor

-- 1. Add new columns to households table
ALTER TABLE households 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS head_of_household_id UUID;

-- 2. Add hometown fields to family_members  
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS hometown_address TEXT,
ADD COLUMN IF NOT EXISTS hometown_province_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS hometown_ward_code VARCHAR(10);

-- 3. Add constraints (Run these after populating data)
-- Make phone required and unique
-- ALTER TABLE households 
-- ALTER COLUMN phone SET NOT NULL;

-- ALTER TABLE households 
-- ADD CONSTRAINT households_phone_unique UNIQUE (phone);

-- Make head_of_household_id required  
-- ALTER TABLE households 
-- ALTER COLUMN head_of_household_id SET NOT NULL;

-- Add foreign key constraint
-- ALTER TABLE households 
-- ADD CONSTRAINT fk_households_head 
-- FOREIGN KEY (head_of_household_id) REFERENCES family_members(id);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_households_phone ON households(phone);
CREATE INDEX IF NOT EXISTS idx_households_head ON households(head_of_household_id);
CREATE INDEX IF NOT EXISTS idx_family_members_hometown_province ON family_members(hometown_province_code);
CREATE INDEX IF NOT EXISTS idx_family_members_hometown_ward ON family_members(hometown_ward_code);

-- 5. Create function to auto-update household display name
CREATE OR REPLACE FUNCTION get_household_display_name(household_id UUID)
RETURNS TEXT AS $$
DECLARE
  head_name TEXT;
BEGIN
  SELECT fm.full_name INTO head_name
  FROM households h
  JOIN family_members fm ON h.head_of_household_id = fm.id
  WHERE h.id = household_id;
  
  IF head_name IS NOT NULL THEN
    RETURN 'Gia đình ' || head_name;
  ELSE
    RETURN 'Hộ gia đình (ID: ' || LEFT(household_id::TEXT, 8) || ')';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to prevent deleting head of household
CREATE OR REPLACE FUNCTION prevent_head_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the member being deleted is a head of household
  IF OLD.is_head_of_household = true THEN
    RAISE EXCEPTION 'Cannot delete head of household. Please delete the entire household or transfer headship first.';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_head_deletion ON family_members;
CREATE TRIGGER trigger_prevent_head_deletion
  BEFORE DELETE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION prevent_head_deletion();

-- 7. Create function to cascade delete household with all members
CREATE OR REPLACE FUNCTION delete_household_cascade(household_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete all family members first
  DELETE FROM family_members WHERE household_id = delete_household_cascade.household_id;
  
  -- Then delete the household
  DELETE FROM households WHERE id = delete_household_cascade.household_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to transfer headship
CREATE OR REPLACE FUNCTION transfer_headship(household_id UUID, new_head_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update all members to not be head
  UPDATE family_members 
  SET is_head_of_household = false 
  WHERE household_id = transfer_headship.household_id;
  
  -- Set new head
  UPDATE family_members 
  SET is_head_of_household = true 
  WHERE id = new_head_id;
  
  -- Update household reference
  UPDATE households 
  SET head_of_household_id = new_head_id 
  WHERE id = transfer_headship.household_id;
END;
$$ LANGUAGE plpgsql;
