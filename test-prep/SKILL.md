---
name: test-prep
version: 1.0.0
description: >
  Interactive certification exam preparation skill. Generates timed, weighted,
  multiple-choice practice quizzes with immediate answer feedback, wrong-answer
  explanations, and trick/distractor analysis — mimicking real certification exam
  style. Use this skill whenever the user mentions studying for a certification,
  wants practice questions, asks to quiz them on a topic, says 'test me',
  'quiz me', 'practice exam', 'certification prep', or uploads a study guide or
  exam blueprint. Always use this skill when the user is preparing for NVIDIA,
  AWS, Azure, GCP, IAPP, CISSP, or any other professional certification. The
  skill can ingest PDFs, web content, and YouTube transcripts as source material,
  then generate domain-weighted questions that expose distractor patterns and
  explain why wrong answers are wrong.
---

# TestPrep Skill

## Quick Trigger Reference

| User says | Action |
|---|---|
| "quiz me on X" / "test me on X" | Generate quiz, ask difficulty + count |
| "practice exam for X cert" | Load cert folder if exists, else ingest blueprint |
| "I'm studying for X" | Ask what they want — quiz, explain topics, or identify weak areas |
| Uploads a PDF / paste text | Ingest as source material, generate questions from it |
| "add X cert" | Run the new-cert protocol (scripts/new-cert.md) |

---

## Core Workflow

### Step 1 — Identify the certification

- If a known cert folder exists under `certifications/`, load it.
- If the cert is unknown, ask the user to provide the official exam page URL or paste the blueprint.
- If no cert context at all, treat topic as free-form and proceed with Claude's knowledge.

**Known certifications:**

| Cert | Folder | Questions | Status |
|------|--------|-----------|--------|
| NVIDIA NCA-AIIO | `certifications/nca-aiio/` | 20 (50 target) | Active |

### Step 2 — Ingest materials (if provided)

| Source type | Action |
|---|---|
| File path (.md, .txt) | Read file with Read tool |
| PDF path | Read with Read tool (extract text content) |
| URL | WebFetch the page; extract key facts |
| YouTube URL | WebFetch transcript if available; summarize key points |
| Pasted text | Use directly |
| `search:<query>` | WebSearch → WebFetch top result → summarize |

If material exceeds ~6 000 words: summarize into key facts before generating questions.

### Step 3 — Generate questions

1. Load `engine/question-schema.json` to understand the required format.
2. If a cert folder exists, read its `tricks.md` first — apply those distractor patterns.
3. Weight questions by domain (use percentages from `blueprint.md`).
4. Generate to the standard schema (see below). Do NOT call any external API — generate directly.
5. Validate: `correctAnswer` index matches one of the `options` entries.

**Question generation principles:**
- Test understanding and application, not memorization of keywords
- Distractors must be plausible — never obviously wrong
- Explanations must address WHY correct is correct AND why each wrong option is wrong
- Distribute difficulty: ~30% easy, ~50% medium, ~20% hard for a "medium" session
- Time budget: easy ≈ 30 s, medium ≈ 60 s, hard ≈ 90 s
- For every question, identify which distractor pattern (from tricks.md) applies, or label `"none"`

### Step 4 — Deliver the quiz

**Option A — HTML quiz (preferred for timed sessions)**

1. Load `template/quiz-template.html`.
2. Inject `EXAM_CONFIG` (cert name, domains, timer, passing %) and the generated question array.
3. Write the filled template to `certifications/<cert>/quiz-session.html` (or output as artifact).
4. Tell the user: open the file in any browser — no server needed.

**Option B — Inline CLI quiz**

Present questions one at a time in the terminal. After each answer:
- Show ✓ or ✗
- Show the correct answer
- Show the explanation

### Step 5 — Score and debrief

After quiz completion, report:
- Overall score (%)
- Per-domain breakdown (score vs domain weight)
- Weakest domain → suggest specific objectives to review
- Distractor patterns the user fell for most

---

## HTML Quiz Template Spec

`template/quiz-template.html` is a self-contained single-file quiz. To generate a cert-specific instance, inject:

```javascript
const EXAM_CONFIG = {
  name: "NCA-AIIO",               // exam code / short label
  title: "AI Infrastructure & Operations",  // display title
  timerMinutes: 24,               // countdown duration
  passingPct: 70,                 // pass threshold
  domains: [
    { id: 1, label: "Essential AI Knowledge", weight: 38, color: "#4db3ff" },
    { id: 2, label: "AI Infrastructure",      weight: 40, color: "#76b900" },
    { id: 3, label: "AI Operations",          weight: 22, color: "#e8a020" }
  ]
};

const QUESTIONS = [ /* array of question objects — see engine/question-schema.json */ ];
```

The engine below `EXAM_CONFIG` is not exam-specific and must not be modified per cert.

---

## Question Schema

Full schema: `engine/question-schema.json`

```json
{
  "id": "nca-aiio-q001",
  "cert": "nca-aiio",
  "domain": 1,
  "objective": "1.1",
  "difficulty": "associate",
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 1,
  "explanation": "Full explanation of why B is correct and why A, C, D are wrong.",
  "trick": "Human-readable description of the distractor pattern used.",
  "trick_pattern": "terminology_precision",
  "tags": ["gpu", "architecture"],
  "source": "Official study guide Obj 1.1"
}
```

Note: `correct` is a **0-based index** into `options`.

---

## Adding a New Certification

See `scripts/new-cert.md` for the full protocol.

Short version: create `certifications/<cert-code>/` with `blueprint.md`, `reading-materials.md`, `questions.json`, `tricks.md`, and `quiz.html`. Update the certifications table in this file.

---

## Free-Tier Compatibility Notes

This skill is designed to run on Claude.ai Free:

- All quiz generation done by Claude in-context — no API calls, no server
- HTML quiz files are self-contained and run locally in any browser
- Reference .md files are read into context when the skill loads
- No API keys required (web search uses Claude's built-in tool when available)
- Skill package size target: < 5 MB (PDFs excluded from the .skill zip)

**To install on a second Claude.ai account:**
1. Zip the `test-prep/` folder → rename to `test-prep.skill`
2. In Claude.ai: Settings → Projects → New Project → Upload Files → add all .md and .html files as project knowledge
3. Paste the `description` field above as custom instructions
4. Type "quiz me on NCA-AIIO" to verify
