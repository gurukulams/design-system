---
tags:
  - testing
  - tech
  - quality
choices:
  - End-to-end user flows
  - Component rendering in isolation
  - Visual regressions
matches:
  - Playwright
  - Storybook
  - Chromatic
---

## Match each testing concern to the tool that owns it in our workflow.

```markdown
Different testing tools serve different layers:

* **Playwright:** Drives a real browser to validate end-to-end user flows.
* **Storybook:** Renders individual components in isolation for manual/dev review.
* **Chromatic:** Automates visual regression testing against Storybook snapshots.
```
