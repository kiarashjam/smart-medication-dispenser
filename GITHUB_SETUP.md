# Publish this project to GitHub

Your machine has **no Git repo** and **no `gh` CLI** by default. Follow one path below.

## 1. Create the empty repository on GitHub

1. Open [github.com/new](https://github.com/new).
2. **Repository name:** e.g. `smart-medication-dispenser` (or any name you like).
3. Choose **Public** or **Private**.
4. **Do not** add README, .gitignore, or license (this repo already has files).
5. Click **Create repository**.

Copy the URL GitHub shows, e.g. `https://github.com/YOUR_USER/smart-medication-dispenser.git`.

## 2. Initialize Git and push (first time)

In PowerShell, from **this folder** (`smart-medication-dispenser` — the one that contains `backend/`, `web/`, `mobile/`):

```powershell
cd "c:\Users\KiaJamishidi\Documents\repo\dispenser\smart-medication-dispenser"

git init
git branch -M main
git add .
git status
git commit -m "Initial commit: Smart Medication Dispenser MVP"

git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Use **SSH** instead if you prefer:

```powershell
git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## 3. What runs on GitHub after you push

The workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pushes and PRs to `main` / `master`:

- **backend:** `dotnet restore`, `build`, `test`
- **web:** `npm ci`, `npm run build`

Mobile is not in CI yet (Expo needs more setup); add it later if you want.

## 4. Optional: GitHub CLI next time

Install [GitHub CLI](https://cli.github.com/), run `gh auth login`, then you can create and push in one go:

```powershell
cd "c:\Users\KiaJamishidi\Documents\repo\dispenser\smart-medication-dispenser"
git init
git add .
git commit -m "Initial commit"
gh repo create smart-medication-dispenser --private --source=. --remote=origin --push
```

## 5. Secrets (production)

Never commit `.env` files with real JWT secrets or DB passwords. This repo’s `.gitignore` excludes `.env`. Use GitHub **Actions secrets** or your host’s env config for production.
