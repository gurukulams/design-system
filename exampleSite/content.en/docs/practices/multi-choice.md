---
title: "Multiple Choice"
weight: 2
categories:
    - multi-choice
---

> Multiple Choice is a question format where learners can select one or more correct answers from the given options. Use this format to test comprehensive understanding where multiple conditions, facts, or attributes apply.

## Syntax

A Multiple Response question uses two YAML fields:

* `choices`: Lists all available options, including both correct and incorrect choices.
* `answers`: Specifies all correct answers.  The **answer does not need to be repeated** in the choices.

The question can be written using any supported Markdown content.

```markdown
---
choices:
- "Choice 1"
- "Choice 2"
answers:
- "Choice 3"
- "Choice 4"
---

Write your question here?

Additional Markdown content can be added here.

---

Explanation of the correct answers.

```

## Usage Example

The following example uses a question about block-level HTML elements.

```markdown
---
choices:
- "`<span>`"
- "`<a>`"
answers:
- "`<div>`"
- "`<p>`"
---

Which of the following HTML elements are block-level elements?

---

Both `<div>` and `<p>` are block-level elements that start on a new line, whereas `<span>` and `<a>` are inline elements.

```