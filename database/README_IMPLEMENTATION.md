# 🚀 Household Schema Update - Implementation Guide

## 📋 Overview
Updated household management system with new business logic:
- **Hộ gia đình = Chủ hộ** (auto-generated name)
- **Phone-based uniqueness** validation
- **Structured member addresses** (full province/ward)
- **Protected head deletion** + cascade household deletion
- **2-step creation wizard**

---

## 🗃️ **Step 1: Run Database Migrations**

### 1.1 Core Schema Update
```sql
-- Run in Supabase SQL Editor
-- File: database/migration_household_schema_update.sql

-- This adds:
-- - phone column to households (required, unique)
-- - head_of_household_id to households
-- - hometown_address, hometown_province_code, hometown_ward_code to family_members
-- - Indexes and constraints
```

### 1.2 Stored Procedures
```sql
-- Run in Supabase SQL Editor  
-- File: database/stored_procedures.sql

-- This creates:
-- - create_household_with_head() - atomic creation
-- - transfer_headship() - change head safely
-- - delete_household_cascade() - delete with all members
-- - get_household_display_name() - computed name
-- - Helper functions for validation
```

### 1.3 Enable Row Level Security (Optional)
```sql
-- If using RLS, these policies are included in migration
-- Users can only see/modify their own households
```

---

## 🔧 **Step 2: Update Imports**

### 2.1 New Type Definitions
```typescript
// Import new types
import type { 
  Household, 
  FamilyMember,
  CreateHouseholdData,
  CreateHeadOfHouseholdData 
} from '@/types/household';
```

### 2.2 New Business Logic Functions
```typescript
// Import new operations
import { 
  createHouseholdWithHead,
  transferHeadship,
  deleteHouseholdCascade,
  getUserHouseholds
} from '@/lib/household-operations';
```

---

## 🎯 **Step 3: Test New Features**

### 3.1 Create Household Wizard
```
✅ Test Steps:
1. Click "Thêm hộ gia đình" 
2. Step 1: Fill household address + phone
3. Step 2: Fill head of household info
4. Verify auto-generated name: "Gia đình [Name]"
5. Check success message & redirect
```

### 3.2 Member Management  
```
✅ Test Actions:
- Add new member with different hometown
- Try to delete head of household (should be blocked)
- Transfer headship to another member
- Verify household name auto-updates
```

### 3.3 Validation
```
✅ Test Validation:
- Duplicate phone numbers (should fail)
- Required fields validation
- Province/ward dependencies
- Head of household protection
```

---

## 🔄 **Step 4: Migration Strategy**

### 4.1 For Existing Data
```sql
-- If you have existing households without phone/head:

-- 1. Add temporary phone numbers
UPDATE households 
SET phone = '0000000000' || id::text 
WHERE phone IS NULL;

-- 2. Set first member as head for existing households
UPDATE households h
SET head_of_household_id = (
  SELECT fm.id 
  FROM family_members fm 
  WHERE fm.household_id = h.id 
  ORDER BY fm.created_at 
  LIMIT 1
)
WHERE head_of_household_id IS NULL;

-- 3. Update family_members to mark heads
UPDATE family_members fm
SET is_head_of_household = true
FROM households h
WHERE h.head_of_household_id = fm.id;
```

### 4.2 Enable Constraints (After Data Migration)
```sql
-- After cleaning up data, enable constraints:
ALTER TABLE households 
ALTER COLUMN phone SET NOT NULL;

ALTER TABLE households 
ADD CONSTRAINT households_phone_unique UNIQUE (phone);

ALTER TABLE households 
ALTER COLUMN head_of_household_id SET NOT NULL;
```

---

## 🎨 **Step 5: UI Components Updated**

### 5.1 New Components
- ✅ `CreateHouseholdWizard` - 2-step creation process
- ✅ `MemberDetailDrawer` - Enhanced member details (previous update)
- ✅ Updated `CreateHouseholdDialog` - Now uses wizard

### 5.2 Enhanced Features
- ✅ **Search & Filter**: Phone, name, location-based filtering  
- ✅ **Protection Logic**: Can't delete head of household
- ✅ **Auto-fill Addresses**: Member hometown defaults to household
- ✅ **Display Names**: Auto-generated "Gia đình [Name]"

---

## 🚨 **Breaking Changes**

### 5.1 Database Schema
```
⚠️ Changed:
- households: Added phone (required), head_of_household_id
- family_members: Added hometown_* fields  
- New constraints and triggers

⚠️ Removed:
- households.household_name (replaced by computed display_name)
```

### 5.2 API Changes
```
⚠️ Functions Changed:
- createHousehold() -> createHouseholdWithHead()
- New required fields in forms
- Different validation rules
```

---

## 🧪 **Testing Checklist**

### Core Functionality
- [ ] Create household with wizard (2 steps)
- [ ] Phone uniqueness validation  
- [ ] Auto-generated household names
- [ ] Member hometown address fields
- [ ] Transfer headship between members
- [ ] Delete protection for head of household
- [ ] Cascade delete for entire household

### UI/UX
- [ ] Wizard progress indicator works
- [ ] Auto-fill hometown from household address
- [ ] Checkbox toggle for "same address"
- [ ] Province/ward dropdowns cascade correctly
- [ ] Form validation messages
- [ ] Success/error toast notifications

### Edge Cases
- [ ] What happens if head is deleted externally?
- [ ] Duplicate phone handling
- [ ] Invalid province/ward combinations
- [ ] Network errors during creation
- [ ] Browser refresh during wizard

---

## 📈 **Next Steps**

### Immediate
1. Run migrations in staging environment
2. Test all functionality thoroughly
3. Update any custom queries/reports
4. Train users on new flow

### Future Enhancements
1. **Import/Export**: Bulk household creation
2. **Analytics**: Household distribution by location  
3. **Search**: Advanced filtering by member attributes
4. **Mobile**: Responsive design improvements
5. **Performance**: Optimize queries for large datasets

---

## 🆘 **Troubleshooting**

### Common Issues
```
❌ "Cannot create household"
  → Check phone uniqueness
  → Verify user authentication
  → Check network connectivity

❌ "Cannot delete member"  
  → Member might be head of household
  → Use transfer headship first

❌ "Wizard step validation fails"
  → Check required fields
  → Verify province/ward data loaded
  → Check browser console for errors
```

### Rollback Plan
```sql
-- If needed to rollback:
-- 1. Restore household_name column
-- 2. Drop new columns
-- 3. Remove triggers/functions
-- 4. Revert application code
```

---

## 🎉 **Benefits Achieved**

✅ **User Experience**
- Simpler, more natural naming convention
- Guided 2-step creation process  
- Better data structure for reporting

✅ **Data Quality**
- Phone-based uniqueness prevents duplicates
- Structured addresses enable better search
- Protected relationships maintain data integrity

✅ **Developer Experience**  
- Cleaner business logic
- Better separation of concerns
- Atomic operations prevent inconsistency

✅ **Future-Proof**
- Extensible schema for new features
- Computed display names adapt to changes
- Structured data ready for analytics

---

**Ready to deploy! 🚀**
