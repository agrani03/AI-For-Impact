# Repository Standards & Best Practices — ARIA Knowledge Base

> Used by the GitHub Repo Auditor to evaluate repository quality against engineering best practices.

---

## Architecture Patterns

### Good Patterns
- Clear separation of concerns (controllers, services, models)
- Consistent folder structure (`src/`, `lib/`, `utils/`, `components/`)
- Single responsibility per file/module
- API routes grouped by domain
- Shared utilities extracted to common modules

### Anti-Patterns
- God files (single file with 500+ lines handling multiple concerns)
- Circular dependencies between modules
- Business logic in route handlers / controllers
- Deep nesting (more than 4 levels of directory depth)
- Mixed concerns (UI logic in data layer, API calls in components)

---

## Code Quality

### Good Practices
- Consistent naming conventions (camelCase, snake_case, PascalCase used appropriately)
- Functions under 50 lines, files under 300 lines
- Meaningful variable and function names
- Type annotations (TypeScript, Python type hints)
- Error handling with try-catch/try-except blocks
- Early returns to reduce nesting
- DRY (Don't Repeat Yourself) — shared utilities for common logic

### Anti-Patterns
- Magic numbers and hardcoded strings
- Console.log / print statements left in production code
- Commented-out code blocks
- Inconsistent code style (mixed tabs/spaces, inconsistent quotes)
- Overly complex ternary expressions
- Unused imports and variables

---

## Security

### Good Practices
- Environment variables for secrets (API keys, DB credentials)
- `.env` file listed in `.gitignore`
- Input validation on all API endpoints
- Parameterized queries (no SQL injection)
- CORS configured with specific origins (not wildcard in production)
- Authentication middleware on protected routes
- Rate limiting on public endpoints
- HTTPS enforced

### Anti-Patterns
- Hardcoded API keys, passwords, or tokens in source code
- `.env` file committed to git
- No input validation (trusting client data)
- SQL string concatenation
- Wildcard CORS in production (`allow_origins=["*"]`)
- No authentication on sensitive endpoints
- Secrets in frontend code (visible to users)

---

## Testing

### Good Practices
- Test files exist (`*.test.js`, `*.spec.ts`, `test_*.py`, `*_test.go`)
- Unit tests for business logic
- Integration tests for API endpoints
- Test fixtures and mocks for external dependencies
- CI/CD pipeline runs tests on every push
- Code coverage above 60%

### Anti-Patterns
- No test files in the entire repository
- Tests that depend on external services without mocking
- Flaky tests (pass/fail randomly)
- Testing implementation details instead of behavior
- No test for error/edge cases

---

## Documentation

### Good Practices
- README.md with project description, setup instructions, and usage
- API documentation (Swagger/OpenAPI for REST APIs)
- Inline comments for complex logic
- CONTRIBUTING.md for open source projects
- Changelog maintained

### Anti-Patterns
- No README or empty README
- Outdated documentation that doesn't match current code
- No setup/installation instructions
- No API documentation for backend services

---

## Dependency Management

### Good Practices
- Lock file committed (`package-lock.json`, `poetry.lock`, `Cargo.lock`)
- Dependencies pinned to specific versions
- Regular dependency updates (no 2+ year old packages)
- Minimal dependency count (avoid dependency bloat)
- Dev dependencies separated from production dependencies

### Anti-Patterns
- No lock file in repository
- Wildcard version ranges (`"*"`, `">=1.0"`)
- Outdated dependencies with known vulnerabilities
- Unnecessary dependencies (using a library for trivial tasks)

---

## DevOps & Configuration

### Good Practices
- `.gitignore` properly configured
- CI/CD configuration present (GitHub Actions, Jenkins, etc.)
- Docker support (`Dockerfile`, `docker-compose.yml`)
- Environment-specific configuration (dev, staging, production)
- Linting and formatting configured (ESLint, Prettier, Black, Ruff)

### Anti-Patterns
- Build artifacts committed to git (`node_modules/`, `dist/`, `__pycache__/`)
- No `.gitignore` file
- No CI/CD pipeline
- Manual deployment process only

---

## Tech Stack Detection Rules

| File/Pattern | Detected Technology |
|-------------|-------------------|
| `package.json` | Node.js |
| `requirements.txt` / `pyproject.toml` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `pom.xml` / `build.gradle` | Java |
| `*.tsx` / `*.jsx` | React |
| `*.vue` | Vue.js |
| `*.svelte` | Svelte |
| `next.config.*` | Next.js |
| `vite.config.*` | Vite |
| `tailwind.config.*` | Tailwind CSS |
| `tsconfig.json` | TypeScript |
| `Dockerfile` | Docker |
| `*.prisma` | Prisma |
| `.github/workflows/` | GitHub Actions |

---

## Scoring Rubric

| Metric | Weight | 90+ (Excellent) | 70-89 (Good) | 50-69 (Fair) | <50 (Needs Work) |
|--------|--------|-----------------|--------------|--------------|-------------------|
| Code Quality | 25% | Clean, typed, well-structured | Minor issues | Some concerns | Major issues |
| Security | 20% | No exposed secrets, validated inputs | Minor gaps | Some vulnerabilities | Critical issues |
| Maintainability | 20% | Clear architecture, modular | Mostly clean | Mixed patterns | Hard to navigate |
| Best Practices | 15% | Follows all standards | Most standards | Some standards | Few standards |
| Test Coverage | 10% | 80%+ coverage | 50-80% | 20-50% | <20% or none |
| Documentation | 10% | Complete README + API docs | Good README | Basic README | No docs |
