---
title: "Mathematical Expressions"
weight: 2
description: "Rendering equations using KaTeX or MathJax."
---

**EXAMPLE 5.1**  
Consider a parallel plate capacitor which is connected to an \(230\ \mathrm{V}\) RMS value and \(50\ \mathrm{Hz}\) frequency. If the separation distance between the plates of the capacitor and area of the plates are \(1\ \mathrm{mm}\) and \(20\ \mathrm{cm^2}\) respectively. Calculate the displacement current at \(t = 1\) s.

**Solution**  
Potential difference between the plates of the capacitor,

$$
V = V_{\mathrm{max}} \sin 2\pi ft = 230\sqrt{2} \sin (2\pi \times 50t) = 325 \sin 100\pi t
$$

\(d = 1\ \mathrm{mm} = 1\times 10^{-3}\ \mathrm{m},\quad A = 20\ \mathrm{cm^2} = 20\times 10^{-4}\ \mathrm{m^2}\)

Displacement current,

$$
i_d = \epsilon_0 \frac{d\Phi_E}{dt} = \epsilon_0 \frac{d(EA)}{dt} = \frac{\epsilon_0 A}{d} \left|\frac{dV}{dt}\right| \quad (\because E = V/d)
$$

$$
= \frac{\epsilon_0 A}{d} (325)(100\pi) \cos 100\pi t
$$

$$
= \frac{8.85\times 10^{-12} \times 20\times 10^{-4} \times 325 \times 100 \times 3.14 \times \cos(100\pi \times 1)}{1\times 10^{-3}}
$$

$$
= 1.81\times 10^{-6}\ \mathrm{A} = 1.81\ \mu\mathrm{A} \quad (\because \cos 100\pi = 1)
$$



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
The equivalent internal resistance of the battery is \(\frac{1}{r_{eq}} = \frac{1}{r} +\frac{1}{r} +\dots \frac{1}{r} (n\ \text{terms}) = \frac{n}{r}\). So \(r_{eq} = \frac{r}{n}\) and the total resistance in the circuit is \(R + \frac{r}{n}\). The total emf is the potential difference between the points A and B, which is equal to \(\epsilon\). The current in the circuit is given by

$$
\begin{array}{l}{I = \frac{\epsilon}{\frac{r}{n} + R}}\\ {I = \frac{n\epsilon}{r + nR}}\\ {\text{Case (a) If } r \gg R,\ I = \frac{n\epsilon}{r} = nI_{1}}\\ {\text{If } r \gg R,\ I = \frac{n\epsilon}{r} = nI_{2}} \end{array} \quad (2.42)
$$

where \(I_{1}\) is the current due to a single cell \(\left(\frac{\epsilon}{r}\right)\) when \(R\) is negligible. Thus, the current through the external resistance due to the whole battery is \(n\) times the current due to a single cell.

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