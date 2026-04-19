---
title: "Mathematical Expressions"
description: "Rendering equations using KaTeX or MathJax."
---

For any educational platform, being able to present clear and accurate math is essential. The **Gurukulams Design System** uses a standardized way to display mathematical formulas, ensuring they look professional, align perfectly with your text, and remain readable on any screen size.

---

## Writing Math in Markdown

You don’t need special software to include math in your documents. You can write expressions directly in your text files using a simple syntax.

### 1. Inline Expressions
If you want to include a math symbol or a short formula inside a sentence, wrap it in single dollar signs: `$ ... $`.

**Example:**
The formula for the area of a circle is $A = \pi r^2$, where $r$ is the radius.

---

### 2. Display Expressions (Centered)
If you have a complex equation that needs its own line and should be centered for emphasis, wrap it in double dollar signs: `$$...$$`.

**Example:**
The quadratic formula is used to find the roots of a polynomial:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

---

### 3. Common Symbols and Formatting
Our system supports standard notation used in science and mathematics. Here are a few examples of how to write common elements:

| Result | How to write it |
| :--- | :--- |
| **Exponents** ($x^2$) | `x^2` |
| **Subscripts** ($H_2O$) | `H_2O` |
| **Fractions** ($\frac{1}{2}$) | `\frac{1}{2}` |
| **Square Root** ($\sqrt{x}$) | `\sqrt{x}` |
| **Greek Letters** ($\alpha, \beta, \Delta$) | `\alpha, \beta, \Delta` |

---

## Why Use This Format?

* **Consistency:** Every formula across the entire site will use the same font and spacing, making the content feel unified.
* **High Quality:** Formulas are rendered as crisp vector graphics, meaning they won't become "blurry" when a user zooms in or views them on a high-resolution tablet.
* **Searchable:** Unlike images of math, this text-based math can be read by screen readers for accessibility and indexed by search engines.

## Best Practices
* **Keep it Simple:** Use "Inline" math for brief mentions and "Display" math for formulas that the student needs to study closely.
* **Don't Overuse:** Only wrap actual mathematical symbols in dollar signs. Use regular bold or italics for standard emphasis in your sentences.
* **Check Your Braces:** Most complex parts (like fractions) use curly braces `{ }` to group numbers together. Ensure every opening brace has a closing one!