-- Create a trigger to auto-create profile when user signs up
-- This runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, subdomain, clicks)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'subdomain', 'user-' || substr(NEW.id::text, 1, 8)),
    COALESCE((NEW.raw_user_meta_data->>'initial_clicks')::integer, 0)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint on subdomain if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subdomain_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_subdomain_key UNIQUE (subdomain);
  END IF;
END $$;

-- Add unique constraint on user_id if not exists  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;