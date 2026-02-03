-- =========================================================
-- 0️⃣ REQUIRED EXTENSIONS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS http;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =========================================================
-- 1️⃣ Add suspended column
-- =========================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false;

-- =========================================================
-- 2️⃣ UNSUSPEND ON CREATE
-- =========================================================
CREATE OR REPLACE FUNCTION public.unsuspend_on_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM http_post(
    'http://hostclick.am/api/v1/webhooks/unsuspend',
    json_build_object('subdomain', NEW.subdomain)::text,
    'application/json'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_unsuspend_on_create
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.unsuspend_on_create();

-- =========================================================
-- 3️⃣ INCREMENT CLICKS (unsuspend if needed)
-- =========================================================
CREATE OR REPLACE FUNCTION public.increment_clicks(profile_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_clicks INTEGER;
  was_suspended BOOLEAN;
  sub TEXT;
BEGIN
  SELECT suspended, subdomain
  INTO was_suspended, sub
  FROM public.profiles
  WHERE user_id = profile_user_id;

  UPDATE public.profiles
  SET clicks = LEAST(clicks + 1, 100),
      suspended = false,
      updated_at = now()
  WHERE user_id = profile_user_id
  RETURNING clicks INTO new_clicks;

  -- Call unsuspend webhook if previously suspended
  IF was_suspended = true THEN
    PERFORM http_post(
      'http://hostclick.am/api/v1/webhooks/unsuspend',
      json_build_object('subdomain', sub)::text,
      'application/json'
    );
  END IF;

  RETURN new_clicks;
END;
$$;

-- =========================================================
-- 4️⃣ DAILY DECREASE + SUSPEND AT 0
-- =========================================================
CREATE OR REPLACE FUNCTION public.daily_decrease_clicks_and_suspend()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    UPDATE public.profiles
    SET clicks = GREATEST(clicks - 1, 0),
        updated_at = now()
    RETURNING id, subdomain, clicks, suspended
  LOOP
    IF r.clicks = 0 AND r.suspended = false THEN
      -- Suspend webhook
      PERFORM http_post(
        'http://hostclick.am/api/v1/webhooks/suspend',
        json_build_object('subdomain', r.subdomain)::text,
        'application/json'
      );

      -- Mark as suspended
      UPDATE public.profiles
      SET suspended = true
      WHERE id = r.id;
    END IF;
  END LOOP;
END;
$$;

-- =========================================================
-- 5️⃣ CRON JOB: RUN DAILY AT 00:00 UTC
-- =========================================================
SELECT cron.schedule(
  'daily-click-decrease',
  '0 0 * * *',
  $$SELECT public.daily_decrease_clicks_and_suspend();$$
);
