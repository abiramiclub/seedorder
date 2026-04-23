# Test Prep — Generate Quiz / Certification Practice

Read `test-prep/SKILL.md` for the full skill definition and follow it exactly.

## Quick reference

This skill handles two modes:

**1. Free-form quiz** — any topic, no cert folder needed
- Ask: topic, difficulty, question count, time per question, question types
- Load materials if provided (file path, pasted text, or `search:<query>`)
- Generate quiz JSON directly, save to `quiz-output.json`, print summary

**2. Certification practice** — uses content from `test-prep/certifications/<cert>/`
- Triggers: "quiz me on NCA-AIIO", "practice exam for AWS SAA", "test me on CISSP", etc.
- Load `blueprint.md` (domain weights), `tricks.md` (distractor patterns), `reading-materials.md`
- Generate domain-weighted questions using standard schema from `test-prep/engine/question-schema.json`
- Optionally inject into `test-prep/template/quiz-template.html` for a browser-based timed quiz

## Available certifications

| Cert | Folder | Questions |
|------|--------|-----------|
| NVIDIA NCA-AIIO | `test-prep/certifications/nca-aiio/` | 20 (50 target) |

## Output

- `quiz-output.json` — generated quiz in standard schema
- Or a ready-to-open HTML file if the user wants a browser quiz

## Adding a new cert

See `test-prep/scripts/new-cert.md` for the full protocol.
