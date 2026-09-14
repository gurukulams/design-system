---
tags:
  - accessibility
  - quality
choices:
  - Conveying state changes with color alone
  - Skipping alt text for decorative icons since they're "obvious"
answers:
  - Using semantic HTML elements wherever possible
---

## Which practice best keeps the Gurukulams Design System accessible to screen reader users?

```markdown
Accessibility isn't optional — it's part of "Good Material":

* **Semantic HTML:** Use native elements (`<button>`, `<nav>`) instead of styled `<div>`s.
* **ARIA labels:** Only added when semantic HTML alone can't convey meaning.
* **Color contrast:** All text meets WCAG AA contrast ratios.

*Note: Relying on color alone to convey a state change excludes colorblind users.*
```
