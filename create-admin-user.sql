-- Insert an admin user into the profiles table if they don't exist
-- This is useful if you need to grant special privileges to a specific user

-- Check if the user already exists
DO $$
DECLARE
  v_count integer;
  v_admin_email text := 'admin@example.com';
  v_admin_id uuid;
BEGIN
  -- Check if the user exists in auth.users
  SELECT COUNT(*) INTO v_count FROM auth.users WHERE email = v_admin_email;

  IF v_count = 0 THEN
    RAISE NOTICE 'Admin user does not exist in auth.users. Create one through the Supabase Authentication UI first.';
  ELSE
    -- Get the user ID
    SELECT id INTO v_admin_id FROM auth.users WHERE email = v_admin_email;

    -- Check if the profile exists
    SELECT COUNT(*) INTO v_count FROM profiles WHERE id = v_admin_id;

    IF v_count = 0 THEN
      -- Insert the profile
      INSERT INTO profiles (id, username, full_name, email, role, created_at, updated_at)
      VALUES (
        v_admin_id,
        'admin',
        'Administrator',
        v_admin_email,
        'admin',
        NOW(),
        NOW()
      );
      RAISE NOTICE 'Admin profile created successfully.';
    ELSE
      -- Update the profile to ensure admin role
      UPDATE profiles
      SET role = 'admin',
          username = COALESCE(username, 'admin'),
          full_name = COALESCE(full_name, 'Administrator')
      WHERE id = v_admin_id;
      RAISE NOTICE 'Admin profile updated successfully.';
    END IF;
  END IF;
END $$;

-- Also update the user role for rakeshvarma9704@gmail.com if it exists
DO $$
DECLARE
  v_count integer;
  v_admin_email text := 'rakeshvarma9704@gmail.com';
  v_admin_id uuid;
BEGIN
  -- Check if the user exists in auth.users
  SELECT COUNT(*) INTO v_count FROM auth.users WHERE email = v_admin_email;

  IF v_count = 0 THEN
    RAISE NOTICE 'User % does not exist in auth.users.', v_admin_email;
  ELSE
    -- Get the user ID
    SELECT id INTO v_admin_id FROM auth.users WHERE email = v_admin_email;

    -- Check if the profile exists
    SELECT COUNT(*) INTO v_count FROM profiles WHERE id = v_admin_id;

    IF v_count = 0 THEN
      -- Insert the profile
      INSERT INTO profiles (id, username, full_name, email, role, created_at, updated_at)
      VALUES (
        v_admin_id,
        'rakesh',
        'Rakesh Varma',
        v_admin_email,
        'admin',
        NOW(),
        NOW()
      );
      RAISE NOTICE 'Admin profile for % created successfully.', v_admin_email;
    ELSE
      -- Update the profile to ensure admin role
      UPDATE profiles
      SET role = 'admin'
      WHERE id = v_admin_id;
      RAISE NOTICE 'Admin profile for % updated successfully.', v_admin_email;
    END IF;
  END IF;
END $$; 