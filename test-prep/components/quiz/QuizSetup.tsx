'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Difficulty, QuizConfig, QuestionType } from '@/types/quiz';

interface QuizSetupProps {
  onStart: (config: QuizConfig) => void;
  isLoading: boolean;
}

export function QuizSetup({ onStart, isLoading }: QuizSetupProps): React.JSX.Element {
  const [topic, setTopic] = useState('');
  const [materials, setMaterials] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(60);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    'multiple-choice',
    'true-false',
  ]);
  const [materialSource, setMaterialSource] = useState<'none' | 'paste' | 'upload' | 'search'>(
    'none',
  );
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleType(type: QuestionType): void {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setMaterials(text);
  }

  async function handleSearch(): Promise<void> {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = (await res.json()) as { material?: string; error?: string };
      if (!res.ok || data.error) {
        setSearchError(data.error ?? 'Search failed');
        return;
      }
      setMaterials(data.material ?? '');
    } catch {
      setSearchError('Network error — please try again');
    } finally {
      setIsSearching(false);
    }
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!topic.trim() || questionTypes.length === 0) return;
    onStart({
      topic: topic.trim(),
      materials: materials.trim() || undefined,
      questionCount,
      difficulty,
      questionTypes,
      timeLimitSeconds,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-7">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Topic *</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Photosynthesis, World War II, Python generators..."
          required
          className="w-full px-4 py-3 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Material source */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-300">
          Source Materials <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'none', label: "Claude's knowledge" },
              { value: 'paste', label: 'Paste text' },
              { value: 'upload', label: 'Upload file' },
              { value: 'search', label: 'Web search' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMaterialSource(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                materialSource === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {materialSource === 'paste' && (
          <textarea
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="Paste your study notes, textbook excerpt, article, or any text..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        )}

        {materialSource === 'upload' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 text-sm transition-colors"
            >
              {materials ? 'File loaded — click to replace' : 'Choose file (.txt, .md, .pdf)'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            {materials && (
              <p className="text-xs text-emerald-400">
                {materials.length.toLocaleString()} characters loaded
              </p>
            )}
          </div>
        )}

        {materialSource === 'search' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search query..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {searchError && <p className="text-xs text-red-400">{searchError}</p>}
            {materials && !searchError && (
              <p className="text-xs text-emerald-400">
                Material fetched ({materials.length.toLocaleString()} chars)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Difficulty</label>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 rounded-xl capitalize text-sm font-medium transition-colors ${
                difficulty === d
                  ? d === 'easy'
                    ? 'bg-emerald-700 text-emerald-100'
                    : d === 'medium'
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-red-800 text-red-100'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Question types */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Question Types</label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'multiple-choice', label: 'Multiple Choice' },
              { value: 'true-false', label: 'True / False' },
              { value: 'short-answer', label: 'Short Answer' },
            ] as { value: QuestionType; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleType(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                questionTypes.includes(value)
                  ? 'bg-indigo-700 text-indigo-100'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count + time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">
            Questions: <span className="text-indigo-400">{questionCount}</span>
          </label>
          <input
            type="range"
            min={3}
            max={30}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">
            Time / question: <span className="text-indigo-400">{timeLimitSeconds}s</span>
          </label>
          <input
            type="range"
            min={15}
            max={180}
            step={15}
            value={timeLimitSeconds}
            onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading || !topic.trim() || questionTypes.length === 0}
      >
        {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
      </Button>
    </form>
  );
}
