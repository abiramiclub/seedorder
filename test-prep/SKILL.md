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
| NVIDIA NCA-AIIO | `certifications/nca-aiio/` | 30 (50 target) | Active |
| IAPP AIGP | `certifications/iapp-aigp/` | — | Planned — run new-cert protocol |

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

## Session Modes

When delivering a quiz, offer the user a choice of mode. Gate feedback and timer behaviour on the selected mode.

| Mode | Feedback | Timer | Questions | When to use |
|------|----------|-------|-----------|-------------|
| **Learning** | Immediate per-question | Per-question (60 s default) | All, shuffled | Default study mode |
| **Exam Simulation** | None until end | Single 60-min session countdown | All, shuffled | Realistic exam rehearsal |
| **Targeted Drill** | Immediate | Per-question | Filtered by domain/concept user picks | Weak-area remediation |
| **Spaced Review** | Immediate | Per-question | Concepts not seen in 3+ days (from localStorage) | Retention maintenance |
| **Diagnostic** | None during, full debrief at end | Per-question | 20 Q domain-weighted sample | First session baseline |

**Mode selection prompt** — before starting, ask:
> "Which mode? Learning (feedback after each Q), Exam Sim (no feedback, 60 min), Targeted Drill (pick a domain), Spaced Review (due concepts), or Diagnostic (20 Q baseline)?"

---

## Distractor Patterns

Every question must have a `trick_pattern` field. Use one of these 8 named patterns:

| Pattern | Definition | Example |
|---------|-----------|---------|
| `terminology_precision` | Two terms look similar but mean different things | FP16 vs BF16 — both 16-bit, different exponent widths |
| `tool_confusion` | Correct tool category but wrong specific tool | "Use TensorRT to serve the model" (it optimizes; Triton serves) |
| `generation_mixup` | Right feature, wrong GPU generation | FP8 attributed to A100 (it's H100/Hopper) |
| `scope_confusion` | Right concept, wrong scope (intra vs inter, node vs cluster) | NVSwitch described as handling inter-node traffic (it's intra-node only) |
| `role_confusion` | Two tools with overlapping domains; wrong one assigned the role | "Base Command replaces Slurm" (it sits on top; doesn't replace) |
| `function_inversion` | Swaps cause/effect or reverses a definition | "GPUs are faster per core than CPUs" (reverses the truth) |
| `magnitude_trap` | Uses a plausible-but-wrong number near the real one | 8 MIG instances (real answer: 7; 8 = GPUs per DGX) |
| `false_equivalence` | Implies two distinct things are the same | "MIG and MPS both provide hardware isolation" |

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

**To share this skill with another Claude.ai account:**
1. Zip the `test-prep/` folder → rename the zip to `test-prep.skill`
2. In Claude.ai: **Settings → Capabilities → Skills → Upload** → select `test-prep.skill`
3. The skill will appear in the skill panel — no custom instructions needed
4. Type "quiz me on NCA-AIIO" to verify it loaded

**Alternative (Project Knowledge path):**
1. In Claude.ai: New Project → Add to Project Knowledge → upload all `.md` and `.html` files
2. Paste the `description` frontmatter block as the project's Custom Instructions
3. Type "quiz me on NCA-AIIO" to verify
