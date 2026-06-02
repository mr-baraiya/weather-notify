# Weather Notify — Roadmap

This roadmap gives contributors a quick view of project goals and where help is most useful.

## Project Purpose

Weather Notify fetches live weather data and delivers alerts to subscribers over WhatsApp. It aims to be a small, deployable project that demonstrates integrating OpenWeather, Twilio, and a simple MongoDB-backed subscription flow.

## Short-term (now — 3 months)

- Improve robustness: guard against incomplete API responses and add better error UI. (good first issues)
- Improve subscription validation and international phone support. (beginner → intermediate)
- Add basic automated tests for the API routes and key components. (intermediate)
- Improve docs: setup, CONTRIBUTING, issue templates, and README.

## Medium-term (3 — 9 months)

- Add production-ready Twilio integration and webhook handling improvements. (intermediate)
- Implement role-based admin access for the dashboard.
- Improve alerting rules and allow user-configurable thresholds.

## Long-term (9+ months)

- Multi-region deployments, queueing for large subscriber bases, and monitoring/observability.
- Official Twilio WhatsApp approval flow support and paid production sender.

## How to contribute

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) and pick a task labeled `good first issue` or `help wanted`.
2. Follow the issue template when opening new issues.
3. Create a branch with a descriptive name: `feature/xxx` or `fix/xxx`.
4. Open a PR using the provided template. Link issues and include testing notes.

## Where to look for tasks

- Issues labeled `good first issue` — great for first contributions.
- Issues labeled `help wanted` or `level:beginner`.

## Contact / Communication

Open issues or PRs on GitHub; maintainers will triage and respond. Be patient — maintainers are volunteers.
