---
title: "Multi Choice"
---
The **Multiple Choice Questions (MCQ)** with more than one answer—often called **Multi-Select**—are used to test a deeper level of understanding. Instead of just identifying a single fact, the learner must evaluate each option independently to determine its validity. In the Gurukulams Design System, this is essential for topics like "Best Practices" or "Feature Sets" where multiple rules apply simultaneously.

---

## What is "Multi-Select"?

In this format, the learner is presented with a list of options where **two or more** choices are correct. To earn full marks, the learner must select all correct answers and none of the incorrect ones.

### Key Components:
1.  **Metadata Block:** The `answers` section in the YAML header contains multiple entries.
2.  **The Question:** Usually phrased to imply multiple possibilities (e.g., "Which of the following apply..." or "Select all that...").
3.  **The Rationale:** Explains the relationship between the correct choices and clarifies why the distractors failed.

---

## Usage Examples

Here are examples based on the **Documentation Module** and **Practices Module**.

### Example 1: Typography Best Practices
This tests the creator's knowledge of multiple style guidelines.

```markdown
---
choices:
  - "Keep paragraphs short (3-4 sentences)."
  - "Use descriptive links like 'Read the Guide' instead of 'Click Here'."
  - "Use All-Caps for entire paragraphs to ensure they are read."
  - "Maintain a consistent heading hierarchy (do not skip levels)."
answers:
  - "Keep paragraphs short (3-4 sentences)."
  - "Use descriptive links like 'Read the Guide' instead of 'Click Here'."
  - "Maintain a consistent heading hierarchy (do not skip levels)."
---

## Which of the following are considered Best Practices for Gurukulams documentation?

#### Good documentation relies on scannability and accessibility. Short paragraphs and descriptive links help users navigate, while a strict heading hierarchy supports screen readers. All-Caps should be avoided as it hinders readability.
```

### Example 2: Mathematical Notation
Testing the rules for writing math in Markdown.

```markdown
---
choices:
  - "Use $...$ for inline expressions."
  - "Use $$...$$ to center formulas on a new line."
  - "Use backticks ( ` ) for complex equations."
  - "Use curly braces { } to group terms in fractions."
answers:
  - "Use $...$ for inline expressions."
  - "Use $$...$$ to center formulas on a new line."
  - "Use curly braces { } to group terms in fractions."
---

## Select the correct methods for formatting math in our system.

#### Our system uses standard LaTeX-style math: single dollar signs for inline text, double dollar signs for standalone display blocks, and curly braces for grouping mathematical logic. Backticks are reserved strictly for code, not math.
```

---

## Best Practices for Content Creators
* **Indicate Multiple Choices:** Always tell the user that more than one answer may be correct (e.g., "Select all that apply").
* **Independent Options:** Each choice should be a standalone statement so that one answer doesn't give away the other.
* **Comprehensive Rationale:** Since multiple answers are correct, ensure the rationale touches upon each correct point to reinforce learning.

