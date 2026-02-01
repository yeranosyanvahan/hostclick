import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'hostclick_days';

export const useClicker = () => {
  const { user } = useAuth();
  const [days, setDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  // Fetch profile data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      // Fall back to localStorage for non-authenticated users
      const stored = localStorage.getItem(STORAGE_KEY);
      setDays(stored ? Math.min(parseInt(stored, 10), 100) : 0);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('clicks, subdomain')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setDays(data?.clicks ?? 0);
      setSubdomain(data?.subdomain ?? null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDay = useCallback(async () => {
    if (days >= 100) return; // Don't allow more than 100

    if (user) {
      // Use database function for authenticated users
      try {
        const { data, error } = await supabase.rpc('increment_clicks', {
          profile_user_id: user.id,
        });

        if (error) throw error;
        setDays(data ?? days + 1);
      } catch (error) {
        console.error('Error incrementing clicks:', error);
      }
    } else {
      // Use localStorage for non-authenticated users
      const newDays = Math.min(days + 1, 100);
      setDays(newDays);
      localStorage.setItem(STORAGE_KEY, newDays.toString());
    }
  }, [user, days]);

  const resetDays = useCallback(async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ clicks: 0 })
          .eq('user_id', user.id);

        if (error) throw error;
        setDays(0);
      } catch (error) {
        console.error('Error resetting clicks:', error);
      }
    } else {
      setDays(0);
      localStorage.setItem(STORAGE_KEY, '0');
    }
  }, [user]);

  return { days, addDay, resetDays, loading, subdomain, maxReached: days >= 100 };
};
