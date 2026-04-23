# Adding a New Certification

Follow these steps to add any new certification to the test-prep skill. Each cert gets its own folder under `certifications/<cert-code>/`.

---

## Step 1 — Create the folder

```bash
mkdir -p certifications/<cert-code>
```

Use a short, lowercase, hyphenated code: `aws-saa`, `cissp`, `iapp-aigp`, `azure-ai102`.

---

## Step 2 — Write `blueprint.md`

Fetch the official exam page and extract:
- Exam code, full name, question count, time limit, passing score
- Domain names and percentage weights
- All exam objectives (numbered list)
- Official study resources and URLs

Template structure:
```markdown
# <CERT-CODE> Exam Blueprint
## <Full Exam Name>

**Exam code:** ...   **Format:** ...   **Passing score:** ...

## Domain Weights
| # | Domain | Weight | Questions (of N) |

## Domain 1 — <Name> (X%)
### 1.1 <Objective name>
- Key concept bullet points...

## Official Study Resources
| Resource | URL |
```

---

## Step 3 — Add `study-guide.pdf`

If the vendor provides an official PDF study guide, download it and save as `certifications/<cert-code>/study-guide.pdf`.

Note: exclude PDFs from the `.skill` zip (too large). Reference them in `blueprint.md` instead.

---

## Step 4 — Write `reading-materials.md`

Consume each official reading source listed in `blueprint.md`. For each source:
1. Read or fetch the content
2. Extract key facts, numbers, definitions, and distinctions
3. Write them as bullet-point summaries organized by topic

Format:
```markdown
# <CERT-CODE> Reading Materials

## <Topic from source>
- Key fact 1
- Key fact 2
- Important distinction: X vs Y — ...

## <Next topic>
...
```

Aim for 1 000–3 000 words. This file becomes the source material for question generation.

---

## Step 5 — Write `tricks.md`

Analyze the exam blueprint and reading materials. Identify:
1. Terms that are commonly confused (terminology_precision)
2. Tools that overlap in purpose (tool_confusion)
3. Spec numbers that are close together (magnitude_trap)
4. Functions that are inverted in common misconceptions (function_inversion)
5. Scope differences (single resource vs group vs cluster)

Build a **tool confusion matrix** table and a **high-yield topic list**.

Use the 8 standard `trick_pattern` values from `engine/question-schema.json`.

---

## Step 6 — Generate `questions.json`

Generate at least 20 questions. Target 50 for a full mock exam.

Weight questions by domain:
```
domain_1_questions = round(total * domain_1_weight / 100)
```

For each question:
- Apply a distractor pattern from `tricks.md`
- Include full explanation (why correct AND why each wrong option is wrong)
- Set `timeLimitSeconds`: foundational=30, associate=60, professional=90
- Validate: `correct` index (0–3) actually points to the correct option in `options`

Save as valid JSON array matching `engine/question-schema.json`.

---

## Step 7 — Generate `quiz.html`

1. Open `template/quiz-template.html`
2. Replace the `EXAM_CONFIG` block with cert-specific values:
   ```javascript
   const EXAM_CONFIG = {
     name: "<CERT-CODE>",
     title: "<Full Exam Name>",
     timerMinutes: <N>,
     passingPct: <N>,
     domains: [ ... ]
   };
   ```
3. Replace the `QUESTIONS` array with the contents of `questions.json`
   (convert JSON objects to JS — remove outer quotes on keys, keep values)
4. Save as `certifications/<cert-code>/quiz.html`

Test: open in a browser, verify all 20+ questions render, timer counts down, feedback shows.

---

## Step 8 — Update SKILL.md certifications table

Add a row to the table in `SKILL.md`:

```markdown
| <CERT-CODE> | `certifications/<cert-code>/` | <N> (<target> target) | Active |
```

---

## Checklist

```
[ ] certifications/<cert-code>/blueprint.md       — domains, objectives, resources
[ ] certifications/<cert-code>/reading-materials.md — key facts extracted
[ ] certifications/<cert-code>/tricks.md           — distractor patterns
[ ] certifications/<cert-code>/questions.json      — ≥20 questions, standard schema
[ ] certifications/<cert-code>/quiz.html           — working self-contained quiz
[ ] SKILL.md certifications table updated
[ ] quiz.html tested in browser (all questions, timer, feedback, results)
```

---

## Recommended Certs to Add Next

| Cert | Vendor | Relevance | Est. effort |
|------|--------|-----------|-------------|
| AWS SAA-C03 | AWS | Cloud infra | 3–4 hrs |
| IAPP AIGP | IAPP | AI governance/privacy | 2–3 hrs |
| Azure AI-102 | Microsoft | Azure AI services | 2–3 hrs |
| CISSP | (ISC)² | Security | 4–5 hrs |
| CKA | CNCF | Kubernetes | 3–4 hrs |
