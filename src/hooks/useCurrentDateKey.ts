import { useEffect, useState } from 'react';
import { getLocalDateKey } from '../utils/cycles';

const MINUTE = 60 * 1000;

export function useCurrentDateKey(): string {
  const [dateKey, setDateKey] = useState(() => getLocalDateKey());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDateKey(getLocalDateKey());
    }, MINUTE);

    return () => window.clearInterval(timer);
  }, []);

  return dateKey;
}
