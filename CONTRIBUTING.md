# Contributing

Thanks for helping improve Weather Notify.

## How to Set Up the Project

1. Clone the repository.
2. Run `npm install`.
3. Create `.env.local` in the project root.
4. Fill in the values listed in [docs/ENV.md](docs/ENV.md).
5. Start the app with `npm run dev`.
6. If you need local alert processing, run `npm run cron` in a separate terminal.

## How to Create a Branch

1. Pull the latest changes from `main`.
2. Create a focused branch for your change.
3. Use a descriptive branch name, such as `feature/whatsapp-subscription-fix` or `docs/readme-update`.

Example:

```bash
git checkout -b feature/your-change
```

## How to Submit a Pull Request

1. Make your changes on a feature branch.
2. Run the relevant checks, especially `npm run lint` and `npm run build` when applicable.
3. Push your branch to your fork or remote.
4. Open a pull request against `main`.
5. Include a short summary, testing notes, and screenshots if the UI changed.

## Coding Standards

- Keep changes small and focused.
- Match the existing code style and component structure.
- Use clear, descriptive names for variables, functions, and branches.
- Prefer readable React components and avoid unnecessary abstraction.
- Run linting before submitting changes.
- Update docs when behavior, setup, or scripts change.