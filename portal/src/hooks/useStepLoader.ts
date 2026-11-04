import { useEffect, useState } from 'react';

export function useStepLoader(step: number, delay = 300) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [step, delay]);

  return loading;
}
