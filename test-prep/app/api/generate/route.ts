import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/ai/quiz-generator';
import type { QuizConfig } from '@/types/quiz';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let config: QuizConfig;
  try {
    config = (await request.json()) as QuizConfig;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!config.topic?.trim()) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }
  if (!config.questionCount || config.questionCount < 1 || config.questionCount > 30) {
    return NextResponse.json({ error: 'questionCount must be between 1 and 30' }, { status: 400 });
  }
  if (!config.questionTypes?.length) {
    return NextResponse.json({ error: 'At least one question type is required' }, { status: 400 });
  }

  try {
    const quiz = await generateQuiz(config);
    return NextResponse.json(quiz);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate quiz';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
