---
title: "Choose the Best"
---


The **Choose the Best** (Multiple Choice) format is a primary tool in our assessment strategy. It focuses on identifying the most accurate statement among several plausible alternatives. This method is highly effective for testing a learner's grasp of nuanced rules within the **Gurukulams Design System**, such as typography hierarchies or specific Markdown syntax.

## What is "Choose the Best"?

Unlike standard quizzes that might have multiple correct answers, "Choose the Best" challenges the learner to evaluate all options and select the single most technically sound statement. 

### Key Components:
1.  **Metadata Block:** Defined in the header (YAML), it lists the `choices` and the correct `answers`.
2.  **The Question:** A clear, concise heading or sentence using the `##` format.
3.  **The Rationale:** A follow-up explanation (often in a code block or formatted text) that explains *why* the answer is correct and why others were incorrect.

---

## Usage Examples

Below are examples of how to format these questions based on the **Documentation Module** standards we have established.

### Example 1: Typography Hierarchy
This example tests the creator's understanding of structural standards.

```markdown
---
choices:
  - "You can skip from # Heading 1 to ### Heading 3 for sub-sections."
  - "Heading 1 (#) should only be used once as the page title."
  - "All headings should be written in ALL CAPS for better visibility."
answers:
  - "Heading 1 (#) should only be used once as the page title."
---

## Which statement regarding heading hierarchy is correct?

#### In our design system, # Heading 1 is reserved for the primary page title to ensure a clear structure. Skipping levels (like H1 to H3) breaks accessibility, and ALL CAPS is avoided to maintain readability.
```

### Example 2: Mathematical Expressions
This example tests the technical syntax for rendering math.

```markdown
---
choices:
  - "Use single dollar signs ($) to center a formula on its own line."
  - "Use double dollar signs ($$) for inline math within a sentence."
  - "Double dollar signs ($$) are used for centered 'Display' expressions."
answers:
  - "Double dollar signs ($$) are used for centered 'Display' expressions."
---

## How should you format a complex, standalone equation?

#### While single dollar signs are for inline math, double dollar signs ($$) trigger 'Display Mode,' which centers the equation and provides necessary vertical spacing for complex formulas.
```

### Example 3: Image Accessibility
This example focuses on the functional purpose of Alt Text.

```markdown
---
choices:
  - "Alt text is used to set the width and height of an image."
  - "Alt text provides a description for screen readers and fallback text."
  - "Alt text is the URL where the image is stored."
answers:
  - "Alt text provides a description for screen readers and fallback text."
---

## What is the primary role of Alt Text in an image tag?

#### Alt text (the text in brackets `[...]`) is an accessibility requirement. It describes the image to visually impaired users and appears if the image file fails to load.
```

---

## Best Practices for Content Creators
* **Avoid "None of the Above":** Try to make the correct answer a positive statement of fact.
* **Keep Choices Balanced:** Ensure all choices are roughly the same length so the correct answer doesn't stand out just by being longer.
* **Provide a Strong Rationale:** The explanation at the end is where the real learning happens. Always clarify the logic behind the correct choice.
