import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import type { QuizQuestion } from '@/types/quiz';

interface QuizFeedbackProps {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  isLast: boolean;
  onNext: () => void;
}

export function QuizFeedback({
  question,
  userAnswer,
  isCorrect,
  isLast,
  onNext,
}: QuizFeedbackProps): React.JSX.Element {
  const correctOptionText =
    question.options?.find((o) => o.id === question.correctAnswer)?.text ??
    question.correctAnswer;

  const userOptionText =
    question.options?.find((o) => o.id === userAnswer)?.text ?? userAnswer || '(no answer)';

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 space-y-4 mt-4',
        isCorrect ? 'border-emerald-700 bg-emerald-950' : 'border-red-800 bg-red-950',
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn('text-2xl', isCorrect ? 'text-emerald-400' : 'text-red-400')}>
          {isCorrect ? '✓' : '✗'}
        </span>
        <p className={cn('text-lg font-semibold', isCorrect ? 'text-emerald-300' : 'text-red-300')}>
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </p>
      </div>

      {!isCorrect && (
        <div className="space-y-1 text-sm">
          <p className="text-slate-400">
            Your answer: <span className="text-red-300 font-medium">{userOptionText}</span>
          </p>
          <p className="text-slate-400">
            Correct answer:{' '}
            <span className="text-emerald-300 font-medium">{correctOptionText}</span>
          </p>
        </div>
      )}

      <div className="border-t border-slate-700 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Explanation
        </p>
        <p className="text-slate-300 leading-relaxed">{question.explanation}</p>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} size="md">
          {isLast ? 'See Results' : 'Next Question →'}
        </Button>
      </div>
    </div>
  );
}
