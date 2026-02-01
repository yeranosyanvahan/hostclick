import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'hostclick_days';

export const useClicker = () => {
  const [days, setDays] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, days.toString());
  }, [days]);

  const addDay = useCallback(() => {
    setDays((prev) => prev + 1);
  }, []);

  const resetDays = useCallback(() => {
    setDays(0);
  }, []);

  return { days, addDay, resetDays };
};
