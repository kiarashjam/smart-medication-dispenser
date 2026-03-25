# Publish this project to GitHub

**Local Git is already initialized** on `main` with commits. You only need to **create the empty repo on GitHub** (in the browser) and **push**.

Repositories live under **your GitHub username**, not your email. Use the GitHub account where **kiarash.jam@gmail.com** is verified (Settings → Emails).

### Already done on this machine (nothing required)

| Item | Status |
|------|--------|
| Git repo + `main` + history | Done |
| `.gitignore` (secrets, `node_modules`, local `*.db`, `dist`, etc.) | Done |
| Commit author for **this repo**: `Kiarash Jamishidi <kiarash.jam@gmail.com>` | Done (`git config --local`) |
| GitHub Actions **CI** (backend test + web build) | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |
| **Dependabot** (weekly PRs: Actions, web/mobile npm) | [`.github/dependabot.yml`](.github/dependabot.yml) |
| MVP product/docs/code (earlier work) | In tree |
| CI parity check | Backend `dotnet test -c Release` + web `npm run build` succeed locally |

### Only you can do (needs GitHub login)

1. Create empty repo at [github.com/new](https://github.com/new).  
2. `git remote add origin …` and `git push -u origin main` (commands below).

## 1. Create the empty repository on GitHub

1. Sign in at [github.com](https://github.com) with the account that owns **kiarash.jam@gmail.com**.
2. Open **[github.com/new](https://github.com/new)**.
3. **Owner:** your user (or an organization you control).
4. **Repository name:** e.g. `smart-medication-dispenser`.
5. **Public** or **Private**.
6. **Do not** add README, .gitignore, or license (this project already has them).
7. Click **Create repository**.

Copy the URL GitHub shows, e.g. `https://github.com/YOUR_GITHUB_USERNAME/smart-medication-dispenser.git`.

## 2. Add remote and push (this machine)

In PowerShell, from **this folder** (`smart-medication-dispenser`):

```powershell
cd "c:\Users\KiaJamishidi\Documents\repo\dispenser\smart-medication-dispenser"

git remote add origin https://github.com/YOUR_GITHUB_USERNAME/smart-medication-dispenser.git
git push -u origin main
```

If `origin` already exists, use `git remote set-url origin https://github.com/...` instead.

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

Install [GitHub CLI](https://cli.github.com/), run `gh auth login`, then create the remote and push (repo is already committed locally):

```powershell
cd "c:\Users\KiaJamishidi\Documents\repo\dispenser\smart-medication-dispenser"
gh repo create smart-medication-dispenser --private --source=. --remote=origin --push
```

Adjust visibility (`--public`) or name as needed.

## 5. Secrets (production)

Never commit `.env` files with real JWT secrets or DB passwords. This repo’s `.gitignore` excludes `.env`. Use GitHub **Actions secrets** or your host’s env config for production.
