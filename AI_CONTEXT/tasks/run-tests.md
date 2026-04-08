# TASK: Run Full Test Suite (Regression Check)

## PURPOSE
Run this task at the START of every session and BEFORE starting any new build task.
This is your safety net. Never skip it.

## BEFORE YOU START
Read:
- AI_CONTEXT/system.md
- AI_CONTEXT/skills/test-runner.md

## STEP 1 — Check What's Been Built
List every module that has been built so far by checking:
- apps/web/__tests__/
- apps/admin/__tests__/
Tell me which test files exist before running anything.

## STEP 2 — Run Tests in Order
```bash
# Layer 1: Unit tests
npx vitest run --reporter=verbose packages/

# Layer 2: API integration tests
npx vitest run --reporter=verbose apps/web/__tests__/api/
npx vitest run --reporter=verbose apps/admin/__tests__/api/

# Layer 3: Component tests
npx vitest run --reporter=verbose apps/web/__tests__/components/
npx vitest run --reporter=verbose apps/admin/__tests__/components/

# Layer 4: E2E (only if Layers 1-3 pass)
npx playwright test
```

## STEP 3 — Report Results
After running, give me a table:

| Module | Tests | Passed | Failed | Skipped |
|--------|-------|--------|--------|---------|
| Booking API | N | N | N | N |
| Amenity System | N | N | N | N |
| Location Pages | N | N | N | N |
| Admin Dashboard | N | N | N | N |

## STEP 4 — On Failure
If ANY test fails:
1. Show me the exact error message
2. Identify which file and line
3. Propose the fix
4. DO NOT proceed to any new build task until all tests pass

## DONE WHEN
- [ ] All existing tests pass
- [ ] Results table presented
- [ ] No regressions from previous session
- [ ] Safe to proceed to next build task