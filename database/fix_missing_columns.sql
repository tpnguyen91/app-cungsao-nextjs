-- Complete migration: Add missing columns to households table
-- Run this in Supabase SQL Editor

-- 1. Add ALL missing columns to households table
ALTER TABLE households 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS province_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS ward_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS head_of_household_id UUID;

-- 2. Add hometown fields to family_members  
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS hometown_address TEXT,
ADD COLUMN IF NOT EXISTS hometown_province_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS hometown_ward_code VARCHAR(10);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_households_phone ON households(phone);
CREATE INDEX IF NOT EXISTS idx_households_head ON households(head_of_household_id);
CREATE INDEX IF NOT EXISTS idx_households_province ON households(province_code);
CREATE INDEX IF NOT EXISTS idx_households_ward ON households(ward_code);
CREATE INDEX IF NOT EXISTS idx_family_members_hometown_province ON family_members(hometown_province_code);
CREATE INDEX IF NOT EXISTS idx_family_members_hometown_ward ON family_members(hometown_ward_code);

-- 4. Create function to auto-update household display name
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

-- 5. Create trigger to prevent deleting head of household
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

-- 6. Create function to cascade delete household with all members
CREATE OR REPLACE FUNCTION delete_household_cascade(household_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete all family members first
  DELETE FROM family_members WHERE household_id = delete_household_cascade.household_id;
  
  -- Then delete the household
  DELETE FROM households WHERE id = delete_household_cascade.household_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to transfer headship
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

-- 8. Verify columns exist
DO $$
DECLARE
    missing_columns TEXT := '';
BEGIN
    -- Check for missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'households' AND column_name = 'address') THEN
        missing_columns := missing_columns || 'address, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'households' AND column_name = 'province_code') THEN
        missing_columns := missing_columns || 'province_code, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'households' AND column_name = 'ward_code') THEN
        missing_columns := missing_columns || 'ward_code, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'households' AND column_name = 'phone') THEN
        missing_columns := missing_columns || 'phone, ';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'households' AND column_name = 'head_of_household_id') THEN
        missing_columns := missing_columns || 'head_of_household_id, ';
    END IF;
    
    IF LENGTH(missing_columns) > 0 THEN
        RAISE NOTICE 'Still missing columns: %', TRIM(TRAILING ', ' FROM missing_columns);
    ELSE
        RAISE NOTICE '✅ All required columns exist in households table!';
    END IF;
END $$;
