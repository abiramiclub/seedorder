'use client';

import { useCallback, useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QuizFeedback } from '@/components/quiz/QuizFeedback';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { QuizResults } from '@/components/quiz/QuizResults';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import type { Quiz, QuestionResult, QuizSessionResult } from '@/types/quiz';

interface QuizSessionProps {
  quiz: Quiz;
  onNewQuiz: () => void;
}

type SessionState = 'answering' | 'feedback' | 'results';

export function QuizSession({ quiz, onNewQuiz }: QuizSessionProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionState, setSessionState] = useState<SessionState>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const questionStartRef = useRef<number>(Date.now());
  const totalStartRef = useRef<number>(Date.now());
  const [timerKey, setTimerKey] = useState(0);

  const currentQuestion = quiz.questions[currentIndex];

  const submitAnswer = useCallback(
    (answer: string) => {
      const timeTakenSeconds = Math.round((Date.now() - questionStartRef.current) / 1000);

      const isCorrect =
        currentQuestion.type === 'short-answer'
          ? answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()
          : answer === currentQuestion.correctAnswer;

      const result: QuestionResult = {
        questionId: currentQuestion.id,
        userAnswer: answer,
        isCorrect,
        timeTakenSeconds,
      };

      setResults((prev) => [...prev, result]);
      setSessionState('feedback');
    },
    [currentQuestion],
  );

  function handleTimeUp(): void {
    if (sessionState !== 'answering') return;
    submitAnswer(selectedAnswer ?? '');
  }

  function handleSubmitClick(): void {
    if (!selectedAnswer) return;
    submitAnswer(selectedAnswer);
  }

  function handleNext(): void {
    const isLast = currentIndex === quiz.questions.length - 1;
    if (isLast) {
      setSessionState('results');
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setSessionState('answering');
    setTimerKey((k) => k + 1);
    questionStartRef.current = Date.now();
  }

  if (sessionState === 'results') {
    const correct = results.filter((r) => r.isCorrect).length;
    const sessionResult: QuizSessionResult = {
      quizId: quiz.id,
      results,
      score: (correct / quiz.questions.length) * 100,
      totalTimeTakenSeconds: Math.round((Date.now() - totalStartRef.current) / 1000),
      completedAt: new Date().toISOString(),
    };

    return (
      <QuizResults
        quiz={quiz}
        result={sessionResult}
        onRetry={() => {
          setCurrentIndex(0);
          setResults([]);
          setSelectedAnswer(null);
          setSessionState('answering');
          setTimerKey((k) => k + 1);
          questionStartRef.current = Date.now();
          totalStartRef.current = Date.now();
        }}
        onNewQuiz={onNewQuiz}
      />
    );
  }

  const lastResult = results[results.length - 1];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-500">
            Question {currentIndex + 1} of {quiz.questions.length}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="info">{currentQuestion.type}</Badge>
            <Badge
              variant={
                currentQuestion.difficulty === 'easy'
                  ? 'success'
                  : currentQuestion.difficulty === 'hard'
                    ? 'danger'
                    : 'warning'
              }
            >
              {currentQuestion.difficulty}
            </Badge>
          </div>
        </div>
        {sessionState === 'answering' && (
          <QuizTimer
            key={timerKey}
            durationSeconds={currentQuestion.timeLimitSeconds}
            onTimeUp={handleTimeUp}
          />
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all"
          style={{ width: `${((currentIndex) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <QuizQuestion
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onSelect={setSelectedAnswer}
        disabled={sessionState === 'feedback'}
      />

      {/* Submit button */}
      {sessionState === 'answering' && (
        <div className="flex justify-end">
          <Button onClick={handleSubmitClick} disabled={!selectedAnswer}>
            Submit Answer
          </Button>
        </div>
      )}

      {/* Feedback */}
      {sessionState === 'feedback' && lastResult && (
        <QuizFeedback
          question={currentQuestion}
          userAnswer={lastResult.userAnswer}
          isCorrect={lastResult.isCorrect}
          isLast={currentIndex === quiz.questions.length - 1}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
