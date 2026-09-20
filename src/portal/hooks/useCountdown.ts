import { useEffect, useState } from 'react';

export function useCountdown(targetIsoDate: string | null | undefined) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    if (!targetIsoDate) {
      setRemainingSeconds(0);
      return;
    }

    const calculateRemaining = () => {
      const targetTime = new Date(targetIsoDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      return diff;
    };

    setRemainingSeconds(calculateRemaining());

    const interval = setInterval(() => {
      const rem = calculateRemaining();
      setRemainingSeconds(rem);
      if (rem <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetIsoDate]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isFinished = remainingSeconds <= 0;

  return { remainingSeconds, formatted, isFinished };
}
