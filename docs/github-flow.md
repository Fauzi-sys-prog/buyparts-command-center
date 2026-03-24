# GitHub Flow

## Branches

- `main` holds release-ready code.
- `develop` is the shared integration branch.
- feature work should branch from `develop`.

## Pull request direction

- `feature/*` -> `develop`
- `fix/*` -> `develop`
- `develop` -> `main` for release promotion

## Automation

- `.github/workflows/ci.yml` runs typecheck, API build, web build, and worker validation on pushes and pull requests.
- `.github/workflows/delivery.yml` builds release artifacts on `main`, `develop`, and manual dispatch.

## Next GitHub-side recommendations

After the first push, configure these in the repository settings:

1. Protect `main` and require pull requests.
2. Require the `CI / verify` check before merge.
3. Optionally protect `develop` with the same check.
4. Add environment secrets before wiring true deployment targets.
