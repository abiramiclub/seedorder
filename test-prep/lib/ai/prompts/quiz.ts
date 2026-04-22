import type { QuizConfig } from '@/types/quiz';

export function buildQuizPrompt(config: QuizConfig): string {
  const { topic, materials, questionCount, difficulty, questionTypes, timeLimitSeconds } = config;

  const timeGuidance =
    difficulty === 'easy' ? '20–40s' : difficulty === 'medium' ? '45–75s' : '75–120s';

  return `You are an expert educator and quiz designer. Generate a structured, pedagogically sound quiz.

TOPIC: ${topic}
DIFFICULTY: ${difficulty}
QUESTION COUNT: ${questionCount}
QUESTION TYPES: ${questionTypes.join(', ')}
DEFAULT TIME PER QUESTION: ${timeLimitSeconds}s (adjust per question; ${difficulty} questions typically need ${timeGuidance})
${materials ? `\nSOURCE MATERIALS:\n${materials}\n` : ''}
RULES:
- Test genuine understanding and application, not pure memorization
- For multiple-choice: exactly 4 options (ids: "a", "b", "c", "d"), one correct
- For true-false: exactly 2 options: [{"id":"true","text":"True"},{"id":"false","text":"False"}]
- For short-answer: omit options entirely; correctAnswer is the expected answer text (keep it short, 1–5 words)
- Explanations must be educational: explain WHY the correct answer is right AND why each wrong option is wrong
- Distribute difficulty: ~30% easy, ~50% medium, ~20% hard for a "${difficulty}" quiz
- Distractors (wrong options) must be plausible, not obviously wrong

Respond with ONLY valid JSON — no markdown fences, no extra text:

{
  "title": "string",
  "description": "string (1-2 sentences describing what this quiz covers)",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "string",
      "options": [
        { "id": "a", "text": "string" },
        { "id": "b", "text": "string" },
        { "id": "c", "text": "string" },
        { "id": "d", "text": "string" }
      ],
      "correctAnswer": "b",
      "explanation": "string",
      "difficulty": "medium",
      "timeLimitSeconds": 60
    }
  ]
}`;
}
