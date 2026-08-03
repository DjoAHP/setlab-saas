import { useState, useCallback, useRef } from 'react';

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 2000;

export function useRateLimit() {
  const attemptsRef = useRef(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const getDelay = useCallback(() => {
    const exponent = Math.min(attemptsRef.current, 6);
    return BASE_DELAY_MS * Math.pow(2, exponent);
  }, []);

  const isLocked = useCallback((): boolean => {
    if (!lockedUntil) return false;
    if (Date.now() >= lockedUntil) {
      setLockedUntil(null);
      return false;
    }
    return true;
  }, [lockedUntil]);

  const getRemainingSeconds = useCallback((): number => {
    if (!lockedUntil) return 0;
    return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  }, [lockedUntil]);

  const recordFailure = useCallback(() => {
    attemptsRef.current += 1;
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      const delay = getDelay();
      setLockedUntil(Date.now() + delay);
    }
  }, [getDelay]);

  const reset = useCallback(() => {
    attemptsRef.current = 0;
    setLockedUntil(null);
  }, []);

  return {
    isLocked,
    getRemainingSeconds,
    recordFailure,
    reset,
  };
}
