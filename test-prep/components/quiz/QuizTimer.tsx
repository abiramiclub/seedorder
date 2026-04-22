'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface QuizTimerProps {
  durationSeconds: number;
  onTimeUp: () => void;
  paused?: boolean;
}

export function QuizTimer({ durationSeconds, onTimeUp, paused = false }: QuizTimerProps): React.JSX.Element {
  const [remaining, setRemaining] = useState(durationSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) {
      onTimeUpRef.current();
      return;
    }
    const id = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(id);
          onTimeUpRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, remaining, durationSeconds]);

  const pct = remaining / durationSeconds;
  const urgent = pct < 0.25;
  const warning = pct < 0.5;

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={cn(
          'text-2xl font-mono font-bold tabular-nums',
          urgent ? 'text-red-400' : warning ? 'text-amber-400' : 'text-slate-300',
        )}
      >
        {String(Math.floor(remaining / 60)).padStart(2, '0')}:
        {String(remaining % 60).padStart(2, '0')}
      </span>
      <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000',
            urgent ? 'bg-red-500' : warning ? 'bg-amber-500' : 'bg-indigo-500',
          )}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
