# Generate Quiz

Generate an interactive timed quiz on any topic. Claude does all the work directly — no API server, no API key needed.

## Steps

### 1. Gather requirements

Ask the user for (skip anything they already provided):

| Setting | Default | Options |
|---|---|---|
| Topic | required | any subject |
| Materials | none | paste text / file path / `search:<query>` |
| Difficulty | medium | easy · medium · hard |
| Question count | 10 | 3–30 |
| Time per question | 60s | 15–180s |
| Question types | MC + TF | multiple-choice, true-false, short-answer |

### 2. Load materials (if any)

- **File path given** → use Read to load the file
- **`search:<query>`** → use WebSearch to find relevant content, then WebFetch the most useful result; summarize key facts and concepts into plain text
- **Text pasted** → use it directly
- **Nothing** → proceed on your own knowledge

If materials exceed ~6000 words, summarize the most important concepts before proceeding.

### 3. Generate the quiz

Generate a quiz in the following exact JSON format. Do this yourself — no API calls, no external services:

```json
{
  "id": "<uuid>",
  "title": "<descriptive quiz title>",
  "topic": "<topic>",
  "description": "<1-2 sentences about what this quiz covers>",
  "difficulty": "easy|medium|hard",
  "totalTimeSeconds": <sum of all timeLimitSeconds>,
  "createdAt": "<ISO timestamp>",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "<question text>",
      "options": [
        { "id": "a", "text": "<option>" },
        { "id": "b", "text": "<option>" },
        { "id": "c", "text": "<option>" },
        { "id": "d", "text": "<option>" }
      ],
      "correctAnswer": "b",
      "explanation": "<why correct, and why each wrong option is wrong>",
      "difficulty": "easy|medium|hard",
      "timeLimitSeconds": 60
    }
  ]
}
```

**Rules for great questions:**
- Test genuine understanding, not just memorization
- Multiple-choice: exactly 4 options (a–d), one correct, distractors must be plausible
- True-false: options are exactly `[{"id":"true","text":"True"},{"id":"false","text":"False"}]`
- Short-answer: omit `options`; `correctAnswer` is the expected text (1–5 words, unambiguous)
- Explanations must be educational — explain the WHY, and address why wrong options are wrong
- Spread difficulty: ~30% easy, ~50% medium, ~20% hard for a "medium" quiz
- Time guidance: easy ≈ 30s, medium ≈ 60s, hard ≈ 90s

### 4. Save to file

Write the generated JSON to `quiz-output.json` in the current directory using the Write tool.

### 5. Display summary

Print a readable summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Quiz: <title>
 Topic: <topic>  |  Difficulty: <difficulty>
 Questions: <n>  |  Est. time: <totalTimeSeconds>s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Q1 [multiple-choice · 60s] <question text>
 Q2 [true-false · 30s] <question text>
 ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Saved to: quiz-output.json
```

### 6. Next steps

Tell the user:

> **To take this quiz in the browser** (timed, with instant feedback):
> ```bash
> cd test-prep
> cp .env.example .env.local   # add ANTHROPIC_API_KEY (only needed for web search feature)
> npm install && npm run dev
> ```
> Visit http://localhost:3000 — configure your quiz there and hit Generate.
>
> Or use `quiz-output.json` in any JSON-capable quiz runner.
