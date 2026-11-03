# Publish this UI to your GitHub account

The project is a local Git repository with the `main` branch and a starting commit. No remote has been configured.

Using GitHub CLI on your computer (after `gh auth login`):

```bash
gh repo create genesis-kiddies-corner-ui --private --source=. --remote=origin --push
```

Or create an empty repository in GitHub's website, then run:

```bash
git remote add origin https://github.com/oboikanyego/genesis-kiddies-corner-ui.git
git push -u origin main
```

Edit `src/environments/environment.production.ts` to point to your Render backend URL before Netlify deployment.
