# Travellers Crib — Claude Session Rules

## PROJECT
Full rules live at: AI_CONTEXT/system.md
Read that file before doing ANYTHING.

## REPO
UI shell on GitHub: https://github.com/NovembreRain/cribcommunity-next
When starting, read this repo structure via GitHub MCP.
Cross-reference with local AI_CONTEXT/ folder.

## MANDATORY READ ORDER (every session)
1. AI_CONTEXT/system.md
2. packages/db/schema.prisma
3. AI_CONTEXT/design-map.json
4. AI_CONTEXT/db-schema.md

## TESTING
Testing skill: AI_CONTEXT/skills/test-runner.md
Always run AI_CONTEXT/tasks/run-tests.md before starting any new build task.
A feature is NOT done until tests pass.

## HERO VIDEO
The homepage hero uses a video (not an image).
Video file lives in the GitHub repo under: public/videos/hero.mp4 (confirm path via GitHub MCP)
Never replace video with an image component on the homepage.
Hero must use Next.js <video> tag or a video component — not next/image.

## GOLDEN RULES
- Never freestyle. Always work from a task file.
- Never create mock data.
- Never create new components without checking packages/ui first.
- Always use Prisma via packages/db — never import PrismaClient directly.
- Production TypeScript only. No pseudocode.

## SUPABASE
Connected manually via .env (DATABASE_URL set to Supabase PostgreSQL connection string).
Do NOT look for Supabase MCP — it is not connected.
All DB access is via Prisma only.