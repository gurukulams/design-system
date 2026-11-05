---
title: "Choose the Best"
weight: 1
categories:
  - choose-the-best
---

> Choose the Best is a question format where learners select the correct answer from the given options. Use this format to test their understanding of a concept, fact, or solution.

## Syntax

A Choose the Best question uses two YAML fields:

- `choices`: Lists the available options.
- `answers`: Specifies the correct answer. The **answer does not need to be repeated** in the choices.

The question can be written using any supported Markdown content.

```markdown
---
choices:
  - "Choice 1"
  - "Choice 2"
  - "Choice 3"
answers:
  - "Choice 4"
---

Write your question here?

Additional Markdown content can be added here.

---

Explanation of the correct answer.
```

## Usage Example

The following example uses a question about heading hierarchy.

```markdown
---
choices:
  - "You can skip from Heading 1 to Heading 3."
  - "All headings should be written in capital letters."
answers:
  - "Heading 1 should only be used once as the page title."
---

Which statement about heading hierarchy is correct?

---

Heading 1 is used for the main page title. Other headings should follow a proper hierarchy using Heading 2, Heading 3, and so on.
```

## Special Aspects

- **Correct answer:** Specify the correct answer in `answers`. It does not need to be included in `choices`.
- **Explanation:** Add an explanation after the horizontal separator (`---`) to help learners understand the answer.
- **Markdown support:** The question and explanation can contain Markdown formatting.

### Maths Support

Mathematical expressions can be included in questions and choices using LaTeX syntax.

**Inline mathematics:** Use `$...$` to include an expression within a sentence.

```markdown
---
choices:
  - "$2 + 3 = 6$"
  - "$2 + 3 = 7$"
answers:
  - "$2 + 3 = 5$"
---

Which expression is correct?

---

The sum of 2 and 3 is 5.
```

**Display mathematics:** Use `$$...$$` for expressions displayed on a separate line.

```markdown
---
choices:
  - "$$x^2 + 1 = (x+1)^2$$"
answers:
  - "$$x^2 + 2x + 1 = (x+1)^2$$"
---

Which mathematical identity is correct?

---

Expanding $(x+1)^2$ gives $x^2 + 2x + 1$.
```

### Image Support

Images can be included in questions and choices using standard Markdown image syntax.

**Image in a question:**

```markdown
---
choices:
  - "Square"
  - "Circle"
answers:
  - "Triangle"
---

Identify the shape shown below.

![A triangle](triangle.png)

---

A triangle is a polygon with three sides.
```

**Images in choices:**

```markdown
---
choices:
  - "![Square](square.png)"
  - "![Circle](circle.png)"
answers:
  - "![Triangle](triangle.png)"
---

Which shape has three sides?

---

A triangle has three sides and three angles.
```
