'use client';

import { useState } from 'react';
import { QuizSession } from '@/components/quiz/QuizSession';
import { QuizSetup } from '@/components/quiz/QuizSetup';
import type { Quiz, QuizConfig } from '@/types/quiz';

type AppState = 'setup' | 'loading' | 'quiz';

export default function HomePage(): React.JSX.Element {
  const [appState, setAppState] = useState<AppState>('setup');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState('');

  async function handleStart(config: QuizConfig): Promise<void> {
    setError('');
    setAppState('loading');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = (await res.json()) as Quiz | { error: string };
      if (!res.ok || 'error' in data) {
        setError('error' in data ? data.error : 'Failed to generate quiz');
        setAppState('setup');
        return;
      }
      setQuiz(data);
      setAppState('quiz');
    } catch {
      setError('Network error — please try again');
      setAppState('setup');
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      {appState === 'setup' || appState === 'loading' ? (
        <div className="max-w-xl mx-auto space-y-8">
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-100">TestPrep</h1>
            <p className="text-slate-400">
              AI-generated timed quizzes with instant feedback.
              <br />
              Upload materials, search the web, or just enter a topic.
            </p>
          </header>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-950 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}

          <QuizSetup onStart={handleStart} isLoading={appState === 'loading'} />
        </div>
      ) : quiz ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <header className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-slate-100">{quiz.title}</h1>
            <p className="text-slate-400 text-sm">{quiz.description}</p>
          </header>
          <QuizSession quiz={quiz} onNewQuiz={() => { setQuiz(null); setAppState('setup'); }} />
        </div>
      ) : null}
    </main>
  );
}
