# Whisper starter (empty mode)

You get **only** the contract and the plumbing — no scaffolding for your code.

**Provided:**
- `package.json`, `.env.example`, `.gitignore`, `deno.jsonc`
- `config/db.js` — Mongoose connection helper
- `server.js` — minimal Express stub (only `/health` works)
- `tester/` — the grading harness (**do not modify**)
- `public/` — static demo frontend (will work once your API is green)
- `docs/` — the API and validation specs

**Empty for you to design:**
- `controllers/`, `models/`, `routes/`, `middleware/`, `validations/`

## Where to start

1. Read `docs/API.md` and `docs/VALIDATION.md`. They are the full contract.
2. Read `README.md` for the full project brief (stack, data model, auth rules).
3. `cp .env.example .env` and fill it in. `npm install`.
4. `npm start` → verify `GET /health` works.
5. Run the tester to see everything red: `node tester/run.js http://localhost:3000`.
6. Build out models → middleware → controllers → routes. Mount routes in `server.js`.

The tester is non-negotiable — it defines "done". Design your files however you like, as long as the HTTP contract matches.
