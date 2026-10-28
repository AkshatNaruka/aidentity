# AGENTS — FastAPI

## Stack

- Python 3.12, `uv` for dependencies, FastAPI, Pydantic v2.
- SQLAlchemy 2.x async or raw asyncpg — use what is already in the project.
- pytest + httpx for tests.

## Rules

1. **Async all the way down.** No blocking calls in request handlers; run sync work in a threadpool explicitly.
2. **Pydantic models at the boundary.** Request and response models are separate. Never return ORM objects directly.
3. **Dependencies for cross-cutting concerns** (auth, db session, pagination). Not middleware, unless it applies to every route.
4. **Errors are typed.** Raise `HTTPException` with a stable `detail` shape; do not leak stack traces or SQL.
5. **No global mutable state.** Settings come from `pydantic-settings`; clients are created in lifespan and injected.
6. **Tests hit the app, not the database.** Use dependency overrides for the session; keep at least one integration test against a real Postgres.
7. **Migrations via Alembic.** Never `create_all` in production.

## Commands

```bash
uv sync
uv run uvicorn app.main:app --reload
uv run pytest -q
uv run ruff check .
uv run mypy app
```

## Definition of done

- `pytest` passes.
- New endpoint → request/response models + error cases + one test.
- No `print`; use structured logging.
- No secret read from code; only settings.
