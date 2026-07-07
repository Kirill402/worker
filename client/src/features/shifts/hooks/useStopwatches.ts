import { useState, useEffect } from 'react';

export const useStopwatches = (shiftStart?: string, segmentStart?: string) => {
  const [elapsed, setElapsed] = useState({ shift: 0, segment: 0 });

  useEffect(() => {
    if (!shiftStart) {
      setElapsed({ shift: 0, segment: 0 });
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const shiftMs = now - new Date(shiftStart).getTime();
      const segMs = segmentStart ? now - new Date(segmentStart).getTime() : 0;
      setElapsed({
        shift: Math.max(0, shiftMs),
        segment: Math.max(0, segMs),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [shiftStart, segmentStart]);

  return elapsed;
};
