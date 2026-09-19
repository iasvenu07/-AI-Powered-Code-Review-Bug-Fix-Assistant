# -AI-Powered-Code-Review-Bug-Fix-Assistant
# Prism Review

An AI-assisted pull-request review workspace. It presents prioritized bugs, explains impact in plain language, offers patch directions, and can generate a regression-test seed.

## Included

- Responsive React review UI with active finding detail, review state, patch-copy feedback, and test generation interaction
- FastAPI API scaffold for GitHub OAuth, PR review creation, review retrieval, and regression-test generation
- PostgreSQL service and Docker Compose setup
- Clear places to connect GitHub's pull-request diff API and an LLM provider

## Run with Docker

```bash
docker compose up --build
```

Open `http://localhost:5173` for the interface and `http://localhost:8000/docs` for the API reference.

## Production integration path

1. Complete the GitHub OAuth callback and store encrypted access tokens.
2. Fetch changed files and diffs from GitHub for the requested pull request.
3. Chunk diffs by file/function, send structured prompts to an LLM, then validate returned locations against the source diff.
4. Persist reviews, findings, and user dispositions in PostgreSQL.
5. Post accepted findings or patch suggestions back to GitHub as review comments.
