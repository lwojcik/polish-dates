# AGENTS.md

`polish-dates` reads dates and clock times from Polish text. ESM, Node 24+, no runtime dependencies.

## Commands

- `npm ci` to install
- `npm test` (runs with `TZ=UTC`; tests must not depend on the machine's zone)
- `npm run typecheck`, `npm run lint`, `npm run format:check`
- `npm run build` writes `dist/` (gitignored)

Run test, typecheck and lint before finishing a change.

## Layout

- `index.ts` re-exports the public API; `src/*.ts` holds the code, imported as `@polish/<name>`
- `test/unit/*.test.ts` has vitest tests, one file per module
- `src/parse.ts` (`parseDate`) is the entry point; `span.ts` and `spans.ts` read dates, `clock.ts` reads times

## Rules

- Public functions never throw and never read the system clock. `today` is always an argument.
- Strict by default. Forgiving behaviour goes behind `tolerant: true` (`src/tolerance.ts`).
- A new date form needs a unit test with a positive case and a near-miss that must stay `null`.
- Anything added to the public API needs a line in `llms.txt` and a README entry. Lint forbids comments except `/** */` TSDoc in `src/`; keep TSDoc lines within 80 characters.
- Commits follow Conventional Commits (commitlint enforces it); use `npm run commit`.
- Releases go through `npm run release:prepare`; do not edit the version or changelog by hand.
