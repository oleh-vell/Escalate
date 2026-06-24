# escalate

CLI for asking Oleh a question, checking its status, and waiting for the answer.

```sh
pip install -e cli/
escalate --help
```

Workflow:

```sh
id=$(escalate ask "Should we use Postgres or SQLite?")
escalate messages wait "$id"   # prints the answer; exits 2 if still pending — re-run it
```

Backend defaults to the deployed Vercel URL (`ESCALATE_API_URL` / `--backend` override).
`wait` polls with exponential backoff (2s → 15s) for up to 15 min; `--timeout 0` waits forever.
All commands accept `-o json`. Exit codes: 0 success, 1 error, 2 still pending, 130 interrupted.
