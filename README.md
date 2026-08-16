# Gurukulams Design System

The Gurukulams Design System serves as the unified visual and functional blueprint for our educational ecosystem. It is engineered to bridge the gap between complex automation frameworks and intuitive learning experiences, ensuring a seamless transition for users across our diverse subsystems.

## Setup

You need to install `Hugo(exteded)` and `Node JS`

This theme depends on [`@gurukulams/practice-js`](https://github.com/gurukulams/practice-js), hosted on **GitHub Packages**. GitHub Packages requires authentication even for public packages, so before your first `npm i` you need a [personal access token](https://github.com/settings/tokens) with the `read:packages` scope exported as `NODE_AUTH_TOKEN`. The registry mapping itself is already committed in `.npmrc`.

**Linux / macOS**
```bash
export NODE_AUTH_TOKEN="<your PAT with read:packages>"
export QUESTIONS_FOLDER="$PWD/exampleSite/questions"
export PUBLIC_FOLDER="$PWD/static" 
npm i
npm run dev
```

**Windows (Cmd)**
```bash
set NODE_AUTH_TOKEN=<your PAT with read:packages>
set QUESTIONS_FOLDER=%cd%\exampleSite\questions
set PUBLIC_FOLDER=%cd%\static
npm i
npm run dev
```

In GitHub Actions no PAT is needed — pass `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` and grant `permissions: packages: read`, as both workflows in `.github/workflows/` now do.

You can open the brower with `http://localhost:1234/design-system`

## Dependency automation

`@gurukulams/practice-js` updates flow in without manual intervention:

```
practice-js: git push --tags  ->  publish-package.yml  ->  GitHub Packages
                                                              |
design-system: Dependabot (daily)  ->  bump PR  ->  ci.yml  ->  auto-merge  ->  Pages deploy
```

Only `@gurukulams/*` **patch and minor** bumps auto-merge. Majors and all third-party dependencies open a PR and wait for review.

Three one-time GitHub settings are required, none of which live in this repo:

1. **Settings → Secrets and variables → Dependabot** — add `GURUKULAMS_PACKAGES_TOKEN`, a PAT with the `read:packages` scope. Dependabot cannot read Actions secrets, so this is a separate store.
2. **Settings → General** — enable *Allow auto-merge*.
3. **Settings → Branches** — protect `main` and mark the `CI / build` check as required. Without a required check, `--auto` merges immediately and the validation gate is skipped.

## Credits

This project is built upon and inspired by the following open-source technologies:

* **[Hugo](https://gohugo.io/)** - The world’s fastest framework for building websites.
* **[Bootstrap](https://getbootstrap.com/)** - The most popular front-end open-source toolkit, used for our core UI components and grid system.
* **[Hugo Book Theme](https://github.com/alex-shpak/hugo-book)** - A sleek and functional documentation theme that serves as the foundation for our content structure.

