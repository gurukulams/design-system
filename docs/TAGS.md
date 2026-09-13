# Tags in this repo — and why they can lag behind practice-js

This repo has **no Tag component of its own**. The tag chips (icon + badges
like "OOP", "Interfaces") you see next to a question are rendered entirely
by the `PracticeMaker` class from the `@gurukulams/practice-js` npm package —
this repo just instantiates it and feeds it data:

```js
// src/js/components/QuestionLoader.js
import PracticeMaker from '@gurukulams/practice-js'
...
this.practiceMaker = new PracticeMaker(contentRoot, { complexity, mode, timer, ... });
this.practiceMaker.setQuestions(questions);
```

Everything about how tags are authored, rendered, and filtered — the URL
`?tags=` state, the AND-filter logic, the click-to-add/remove badges — is
documented in `practice-js`'s own
[`docs/TAGS.md`](https://github.com/gurukulams/practice-js/blob/main/docs/TAGS.md).
This repo doesn't implement or override any of it.

## Why the behavior can differ from practice-js's own site

`@gurukulams/practice-js` is a normal registry dependency here
(`package.json` → `"@gurukulams/practice-js": "^1.0.0"`, resolved via GitHub
Packages per `.npmrc`), **not** a workspace/`file:` link. That means this
repo only ever gets whatever version was last *published* — never
`practice-js`'s live `main` branch.

`practice-js` only publishes a new version when its own `package.json`
version field changes on a push to `main` (see
`practice-js/.github/workflows/publish-package.yml`). If a feature lands on
`practice-js`'s `main` without a version bump, it simply never reaches this
repo, no matter how long ago it was merged upstream — `npm`/Dependabot has
nothing newer to see.

Concretely: tag click/filter support was added to `practice-js` after its
last version bump (v1.0.1), so this repo stayed on a build that renders
inert, non-clickable tag badges with no filtering support, while
`practice-js`'s own site already had the interactive version.

**Takeaway:** if tags (or anything else from `PracticeMaker`) behave
differently here than on practice-js's site, check
`design-system/package.json`'s `@gurukulams/practice-js` version against
`practice-js`'s latest published version first — a version lag is the most
likely cause, not a bug in this repo.
