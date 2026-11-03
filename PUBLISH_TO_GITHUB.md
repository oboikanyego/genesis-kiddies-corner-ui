# Publishing this UI repository to GitHub

This handoff includes its own Git history with a `main` commit. The connected GitHub integration can read and edit existing repositories, but couldn't create new ones from this session. To publish with GitHub CLI:

```bash
gh auth login
cd genesis-kiddies-corner-ui
gh repo create oboikanyego/genesis-kiddies-corner-ui --private --source=. --remote=origin --push
```

Alternative: create an empty repository called `genesis-kiddies-corner-ui` under `oboikanyego` in github.com, then run:

```bash
git remote add origin https://github.com/oboikanyego/genesis-kiddies-corner-ui.git
git push -u origin main
```

After publishing, connect the repo to Netlify. Set the production API URL in `src/environments/environment.production.ts` before the frontend build. Don't commit credentials.
