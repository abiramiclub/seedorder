'use client';

import { cn } from '@/lib/utils/cn';
import type { QuizQuestion as QuizQuestionType } from '@/types/quiz';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function QuizQuestion({
  question,
  selectedAnswer,
  onSelect,
  disabled = false,
}: QuizQuestionProps): React.JSX.Element {
  if (question.type === 'short-answer') {
    return (
      <div className="space-y-4">
        <p className="text-lg text-slate-100 leading-relaxed">{question.question}</p>
        <input
          type="text"
          value={selectedAnswer ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        />
      </div>
    );
  }

  const options = question.options ?? [];

  return (
    <div className="space-y-4">
      <p className="text-lg text-slate-100 leading-relaxed">{question.question}</p>
      <div className="grid gap-3">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              disabled={disabled}
              className={cn(
                'w-full text-left px-5 py-3.5 rounded-xl border transition-all',
                'disabled:cursor-not-allowed',
                isSelected
                  ? 'border-indigo-500 bg-indigo-950 text-indigo-100'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-750',
              )}
            >
              <span className="font-semibold text-indigo-400 mr-3">{opt.id.toUpperCase()}.</span>
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
