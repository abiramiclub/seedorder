import Anthropic from '@anthropic-ai/sdk';
import type { Quiz, QuizConfig } from '@/types/quiz';
import { buildQuizPrompt } from './prompts/quiz';

const client = new Anthropic();

interface RawQuizResponse {
  title: string;
  description: string;
  questions: Quiz['questions'];
}

export async function generateQuiz(config: QuizConfig): Promise<Quiz> {
  const prompt = buildQuizPrompt(config);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system:
      'You are an expert quiz generator. Always respond with valid JSON only — no markdown, no explanation, no fences.',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  let raw: RawQuizResponse;
  try {
    raw = JSON.parse(content.text) as RawQuizResponse;
  } catch {
    throw new Error('Claude returned invalid JSON — quiz generation failed');
  }

  if (!raw.questions || raw.questions.length === 0) {
    throw new Error('Claude returned no questions');
  }

  const totalTimeSeconds = raw.questions.reduce((sum, q) => sum + q.timeLimitSeconds, 0);

  return {
    id: crypto.randomUUID(),
    title: raw.title,
    topic: config.topic,
    description: raw.description,
    questions: raw.questions,
    totalTimeSeconds,
    difficulty: config.difficulty,
    createdAt: new Date().toISOString(),
  };
}
