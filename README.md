# PotMock (internal)

Intentionally buggy mock of our collection-pot product. Used as a take-home exercise for QA/Tester candidates — they write automated tests against this image.

**Do NOT ship this to production. Do NOT "fix" the seeded bugs.** See `../docs/superpowers/specs/2026-04-13-potmock-qa-exercise-design.md` §3.5 for the bug list and rationale.

## Run

```
docker build -t potmock:latest .
docker run --rm -p 3000:3000 potmock:latest
```

UI: http://localhost:3000 · API base: http://localhost:3000/api

## Internal tests (non-bug paths)

```
npm install
npm test
```

These cover only behavior that is *not* one of the seeded bugs. If a test here starts failing, you probably broke the mock.

## Distribution

Push the built image to your internal registry. Candidates pull it with:

```
docker pull <registry>/potmock:latest
docker run -p 3000:3000 <registry>/potmock:latest
```
