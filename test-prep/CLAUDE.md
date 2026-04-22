# TestPrep

## What This Is
An AI-powered interactive quiz platform. Users enter a topic (or upload materials / search the web) and receive a timed, multiple-format quiz with instant per-question feedback and explanations. Built to mimic real test conditions while enabling active learning.

## Slash Commands
- `/generate-quiz` — Generate a quiz interactively from the CLI (topic, materials, difficulty, format)

## Tech Stack
- **Next.js 16 (App Router)** + **TypeScript** (strict) + **Tailwind CSS v4**
- **Claude API** (`claude-sonnet-4-6`) — quiz generation + web search for materials
- **Anthropic SDK** (`@anthropic-ai/sdk`) — do not use other AI providers

## Dev Commands
```bash
npm install          # First time setup
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check

cp .env.example .env.local   # Set up env vars (do this first)
```

**Never commit `.env.local`.**

## Project Structure
```
test-prep/
├── .claude/
│   └── commands/
│       └── generate-quiz.md   # /generate-quiz skill
├── app/
│   ├── page.tsx               # Landing + quiz setup
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── generate/route.ts  # POST — generate quiz via Claude
│       └── search/route.ts    # POST — web search for materials
├── components/
│   ├── ui/                    # Button, Badge
│   └── quiz/                  # QuizSetup, QuizSession, QuizQuestion,
│                              # QuizTimer, QuizFeedback, QuizResults
├── lib/
│   ├── ai/
│   │   ├── quiz-generator.ts  # Claude API quiz generation
│   │   └── prompts/quiz.ts    # Prompt template
│   └── utils/cn.ts
└── types/quiz.ts              # All TypeScript types
```

## Conventions
- TypeScript strict mode — no `any`, no `@ts-ignore`
- All Claude API calls live in `lib/ai/` — never inline in routes/components
- All types in `types/` — no inline type definitions
- Tailwind only — no CSS modules, no inline styles
- `'use client'` only when needed (event handlers, hooks, browser APIs)
- Server Components by default

## Quiz Features
- **Multiple formats**: multiple-choice (4 options), true/false, short-answer
- **Timed**: per-question countdown with color urgency indicator
- **Instant feedback**: right/wrong + full explanation after every answer
- **Materials**: paste text, upload file, or web search via Claude
- **Results**: score, per-question review with explanations

## Guardrails
- Never auto-submit answers without user action
- Explanations must be educational — explain WHY, not just WHAT
- Web search results go through Claude summarization before quiz use
- Short-answer grading is case-insensitive, trimmed
