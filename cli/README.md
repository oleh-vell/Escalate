# rentoleh

CLI for asking Oleh a question, checking its status, and waiting for the answer.

```sh
pip install -e cli/
rentoleh --help
```

Workflow:

```sh
id=$(rentoleh ask "Should we use Postgres or SQLite?")
rentoleh messages wait "$id"   # prints the answer; exits 2 if still pending — re-run it
```

Backend defaults to `http://localhost:3000`; override with `RENTOLEH_BACKEND` or `--backend`.
All commands accept `-o json`. Exit codes: 0 success, 1 error, 2 still pending, 130 interrupted.
