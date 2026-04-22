import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Quiz, QuizSessionResult } from '@/types/quiz';

interface QuizResultsProps {
  quiz: Quiz;
  result: QuizSessionResult;
  onRetry: () => void;
  onNewQuiz: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function QuizResults({ quiz, result, onRetry, onNewQuiz }: QuizResultsProps): React.JSX.Element {
  const correct = result.results.filter((r) => r.isCorrect).length;
  const total = result.results.length;
  const pct = Math.round(result.score);

  const gradeColor =
    pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-slate-100">Quiz Complete</h2>
        <p className={`text-6xl font-black ${gradeColor}`}>{pct}%</p>
        <p className="text-slate-400">
          {correct} / {total} correct &middot; {formatTime(result.totalTimeTakenSeconds)}
        </p>
        {pct >= 80 && (
          <p className="text-emerald-400 font-medium">Excellent work!</p>
        )}
        {pct >= 60 && pct < 80 && (
          <p className="text-amber-400 font-medium">Good effort — review the explanations below.</p>
        )}
        {pct < 60 && (
          <p className="text-red-400 font-medium">Keep practicing — read the explanations below.</p>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={onRetry}>
          Retry This Quiz
        </Button>
        <Button onClick={onNewQuiz}>New Quiz</Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-300">Review</h3>
        {quiz.questions.map((q, i) => {
          const res = result.results[i];
          const correctText =
            q.options?.find((o) => o.id === q.correctAnswer)?.text ?? q.correctAnswer;
          const userText =
            q.options?.find((o) => o.id === res?.userAnswer)?.text ??
            res?.userAnswer ??
            '(skipped)';

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 text-sm font-bold ${res?.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {res?.isCorrect ? '✓' : '✗'}
                </span>
                <div className="flex-1 space-y-2">
                  <p className="text-slate-200 font-medium">
                    <span className="text-slate-500 text-sm mr-2">Q{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant={res?.isCorrect ? 'success' : 'danger'}>
                      You: {userText}
                    </Badge>
                    {!res?.isCorrect && (
                      <Badge variant="success">Correct: {correctText}</Badge>
                    )}
                    <Badge variant="default">{formatTime(res?.timeTakenSeconds ?? 0)}</Badge>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
