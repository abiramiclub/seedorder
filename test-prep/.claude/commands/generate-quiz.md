# Generate Quiz

Generate an interactive timed quiz on any topic. Supports material uploads, web search, and custom difficulty/format configuration.

## Steps

### 1. Gather requirements

Ask the user for the following (skip any already provided):

- **Topic** — subject or specific concept to test on (required)
- **Source materials** — one of:
  - Paste text directly
  - File path to read (PDF, txt, md)
  - `search:<your query>` — will fetch material from the web
  - Leave blank to use Claude's built-in knowledge
- **Difficulty** — `easy` | `medium` | `hard` (default: medium)
- **Question count** — how many questions (default: 10, max: 30)
- **Time per question** — seconds per question (default: 60)
- **Question types** — any combination of:
  - `multiple-choice` (4 options, one correct)
  - `true-false`
  - `short-answer`
  - Default: multiple-choice + true-false

### 2. Fetch or read materials

- If the user said `search:<query>`: use WebSearch to find relevant content, then summarize the key concepts and facts into plain text to use as source material.
- If the user gave a file path: use Read to load the file contents.
- If the user pasted text: use it directly.
- If nothing was provided: proceed with Claude's knowledge only.

### 3. Generate the quiz

**Option A — Dev server is running** (preferred)

Call `POST http://localhost:3000/api/generate` with:

```json
{
  "topic": "<topic>",
  "materials": "<source text or null>",
  "questionCount": 10,
  "difficulty": "medium",
  "questionTypes": ["multiple-choice", "true-false"],
  "timeLimitSeconds": 60
}
```

Use Bash to make the request:
```bash
curl -s -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '<json body>'
```

**Option B — Dev server not running**

Generate the quiz directly. Produce valid JSON matching this schema:

```typescript
{
  id: string            // crypto.randomUUID()
  title: string         // descriptive quiz title
  topic: string
  description: string   // 1-2 sentences about what this quiz covers
  difficulty: "easy" | "medium" | "hard"
  totalTimeSeconds: number   // sum of all question time limits
  createdAt: string          // ISO timestamp
  questions: Array<{
    id: string               // "q1", "q2", etc.
    type: "multiple-choice" | "true-false" | "short-answer"
    question: string
    options?: Array<{ id: string; text: string }>   // MC: 4 options a-d, TF: true/false
    correctAnswer: string    // option id for MC/TF, answer text for short-answer
    explanation: string      // explain why correct AND why wrong options are wrong
    difficulty: "easy" | "medium" | "hard"
    timeLimitSeconds: number
  }>
}
```

Guidelines for great questions:
- Test genuine understanding, not just memorization
- Explanations should be educational — teach the WHY
- Distribute difficulty: ~30% easy, ~50% medium, ~20% hard for "medium" overall
- Wrong options (distractors) should be plausible, not obviously wrong
- For short-answer: keep answers short (1-5 words) and unambiguous

### 4. Save and display output

Save the generated quiz JSON to `quiz-output.json` in the current working directory:

```bash
# Write the JSON to file
```

Then display a readable summary:

```
Quiz: <title>
Topic: <topic>
Questions: <count> | Difficulty: <difficulty> | Est. time: <totalTimeSeconds>s

Sample questions:
  Q1 [multiple-choice, 60s]: <question text>
  Q2 [true-false, 30s]: <question text>
  ...

Full quiz saved to: quiz-output.json
```

### 5. Next steps

Tell the user:

> To take this quiz interactively with a timer and instant feedback:
> 1. `cd test-prep && npm install && npm run dev`
> 2. Visit http://localhost:3000
> 3. Your quiz (`quiz-output.json`) will be auto-loaded, or enter the topic manually.

---

## Tips

- For long materials (> 8000 words), summarize the key points before generating — focus on core concepts, not full verbatim text
- If a topic is ambiguous, ask the user to specify a scope (e.g. "Python" → "Python data structures" or "Python web frameworks")
- Validate that `correctAnswer` matches an actual option id for MC/TF questions before outputting
