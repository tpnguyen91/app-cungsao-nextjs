-- Stored procedures for household operations
-- File: database/stored_procedures.sql
-- Run this in Supabase SQL Editor after the main migration

-- 1. Create household with head of household atomically
CREATE OR REPLACE FUNCTION create_household_with_head(
  household_data JSON,
  head_data JSON
)
RETURNS JSON AS $$
DECLARE
  new_household_id UUID;
  new_head_id UUID;
  result JSON;
BEGIN
  -- Generate IDs
  new_household_id := gen_random_uuid();
  new_head_id := gen_random_uuid();
  
  -- Insert household first (without head_of_household_id)
  INSERT INTO households (
    id,
    address,
    province_code,
    ward_code,
    phone,
    notes,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    new_household_id,
    (household_data->>'address')::TEXT,
    (household_data->>'province_code')::TEXT,
    (household_data->>'ward_code')::TEXT,
    (household_data->>'phone')::TEXT,
    (household_data->>'notes')::TEXT,
    (household_data->>'created_by')::UUID,
    NOW(),
    NOW()
  );
  
  -- Insert head of household
  INSERT INTO family_members (
    id,
    household_id,
    full_name,
    birth_year,
    relationship_role,
    gender,
    hometown_address,
    hometown_province_code,
    hometown_ward_code,
    is_head_of_household,
    is_alive,
    notes,
    created_at,
    updated_at
  ) VALUES (
    new_head_id,
    new_household_id,
    (head_data->>'full_name')::TEXT,
    (head_data->>'birth_year')::INTEGER,
    'CHU_HO',
    (head_data->>'gender')::TEXT,
    (head_data->>'hometown_address')::TEXT,
    (head_data->>'hometown_province_code')::TEXT,
    (head_data->>'hometown_ward_code')::TEXT,
    true,
    true,
    (head_data->>'notes')::TEXT,
    NOW(),
    NOW()
  );
  
  -- Update household with head_of_household_id
  UPDATE households 
  SET head_of_household_id = new_head_id,
      updated_at = NOW()
  WHERE id = new_household_id;
  
  -- Return result
  result := json_build_object(
    'household_id', new_household_id,
    'head_id', new_head_id,
    'success', true
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Rollback will happen automatically
  RAISE EXCEPTION 'Failed to create household with head: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 2. Transfer headship between members
CREATE OR REPLACE FUNCTION transfer_headship(
  household_id UUID,
  new_head_id UUID
)
RETURNS VOID AS $$
DECLARE
  member_exists BOOLEAN;
  member_household_id UUID;
BEGIN
  -- Validate new head exists and belongs to household
  SELECT EXISTS(
    SELECT 1 FROM family_members 
    WHERE id = new_head_id AND household_id = transfer_headship.household_id
  ), household_id INTO member_exists, member_household_id
  FROM family_members 
  WHERE id = new_head_id;
  
  IF NOT member_exists THEN
    RAISE EXCEPTION 'Thành viên không tồn tại hoặc không thuộc hộ gia đình này';
  END IF;
  
  -- Update all members to not be head
  UPDATE family_members 
  SET is_head_of_household = false,
      updated_at = NOW()
  WHERE household_id = transfer_headship.household_id;
  
  -- Set new head
  UPDATE family_members 
  SET is_head_of_household = true,
      relationship_role = 'CHU_HO',
      updated_at = NOW()
  WHERE id = new_head_id;
  
  -- Update household reference
  UPDATE households 
  SET head_of_household_id = new_head_id,
      updated_at = NOW()
  WHERE id = transfer_headship.household_id;
  
END;
$$ LANGUAGE plpgsql;

-- 3. Delete household with all members (cascade)
CREATE OR REPLACE FUNCTION delete_household_cascade(household_id UUID)
RETURNS VOID AS $$
DECLARE
  member_count INTEGER;
BEGIN
  -- Get member count for logging
  SELECT COUNT(*) INTO member_count
  FROM family_members 
  WHERE household_id = delete_household_cascade.household_id;
  
  -- Delete all family members first
  DELETE FROM family_members 
  WHERE household_id = delete_household_cascade.household_id;
  
  -- Delete the household
  DELETE FROM households 
  WHERE id = delete_household_cascade.household_id;
  
  -- Log the deletion (optional)
  RAISE NOTICE 'Deleted household % with % members', household_id, member_count;
  
END;
$$ LANGUAGE plpgsql;

-- 4. Get household display name (computed)
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

-- 5. Get member hometown display (computed)
CREATE OR REPLACE FUNCTION get_member_hometown_display(member_id UUID)
RETURNS TEXT AS $$
DECLARE
  member_record family_members%ROWTYPE;
  province_name TEXT;
  ward_name TEXT;
  result TEXT[];
BEGIN
  -- Get member data
  SELECT * INTO member_record
  FROM family_members
  WHERE id = member_id;
  
  IF NOT FOUND THEN
    RETURN 'Không xác định';
  END IF;
  
  -- Build address parts
  result := ARRAY[]::TEXT[];
  
  IF member_record.hometown_address IS NOT NULL AND member_record.hometown_address != '' THEN
    result := array_append(result, member_record.hometown_address);
  END IF;
  
  -- Get ward name (you'll need to join with your location tables)
  -- This is a placeholder - adjust based on your actual location table structure
  IF member_record.hometown_ward_code IS NOT NULL THEN
    SELECT name INTO ward_name 
    FROM wards 
    WHERE code = member_record.hometown_ward_code;
    
    IF ward_name IS NOT NULL THEN
      result := array_append(result, ward_name);
    END IF;
  END IF;
  
  -- Get province name
  IF member_record.hometown_province_code IS NOT NULL THEN
    SELECT name INTO province_name 
    FROM provinces 
    WHERE code = member_record.hometown_province_code;
    
    IF province_name IS NOT NULL THEN
      result := array_append(result, province_name);
    END IF;
  END IF;
  
  -- Join with commas
  IF array_length(result, 1) > 0 THEN
    RETURN array_to_string(result, ', ');
  ELSE
    RETURN 'Chưa cập nhật';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Validate phone uniqueness
CREATE OR REPLACE FUNCTION is_phone_unique(
  check_phone TEXT,
  exclude_household_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  phone_exists BOOLEAN;
BEGIN
  IF exclude_household_id IS NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM households 
      WHERE phone = check_phone
    ) INTO phone_exists;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM households 
      WHERE phone = check_phone 
      AND id != exclude_household_id
    ) INTO phone_exists;
  END IF;
  
  RETURN NOT phone_exists;
END;
$$ LANGUAGE plpgsql;

-- 7. Get households with computed data for user
CREATE OR REPLACE FUNCTION get_user_households_with_computed(user_id UUID)
RETURNS TABLE (
  id UUID,
  address TEXT,
  province_code TEXT,
  ward_code TEXT,
  phone TEXT,
  notes TEXT,
  head_of_household_id UUID,
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  display_name TEXT,
  member_count BIGINT,
  head_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.address,
    h.province_code,
    h.ward_code,
    h.phone,
    h.notes,
    h.head_of_household_id,
    h.created_by,
    h.created_at,
    h.updated_at,
    get_household_display_name(h.id) as display_name,
    COUNT(fm.id) as member_count,
    head.full_name as head_name
  FROM households h
  LEFT JOIN family_members fm ON h.id = fm.household_id
  LEFT JOIN family_members head ON h.head_of_household_id = head.id
  WHERE h.created_by = user_id
  GROUP BY h.id, head.full_name
  ORDER BY h.created_at DESC;
END;
$$ LANGUAGE plpgsql;
