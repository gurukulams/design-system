---
title: "Code Block"
description: "How to display automation scripts and config files."
---


For a technical design system, displaying code clearly is as important as the code itself. The **Gurukulams Design System** uses syntax highlighting to make programming scripts, configuration files, and terminal commands easy to read and understand.

---

## How to Write Code Blocks

In Markdown, we distinguish between code that sits inside a sentence and code that stands as its own block.

### 1. Inline Code
Use single backticks `` ` `` to highlight a small piece of code, a filename, or a variable name within a paragraph.

**Example:**
To start the server, use the `hugo server` command in your terminal.

---

### 2. Multi-line Code Blocks
To display a full block of code, wrap it in triple backticks ` ``` `. To enable **Syntax Highlighting** (which adds colors to keywords), specify the language name immediately after the first set of backticks.

**Example:**

<pre>
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Welcome to Gurukulams!");
    }
}
```
</pre>

---

## Supported Languages

Our system supports highlighting for a wide variety of languages commonly used in our projects:
* **Web:** `html`, `css`, `javascript`, `typescript`
* **Backend:** `java`, `python`, `sql`
* **Data:** `json`, `yaml`, `xml`
* **Terminal:** `bash` or `shell`

---

## Why Use Code Blocks?

* **Readability:** Colors help students quickly distinguish between functions, variables, and comments.
* **Copy-Friendly:** Code blocks use a "Monospaced" font (where every letter is the same width), ensuring that indentation and alignment remain perfect.
* **Visual Separation:** It clearly separates technical instructions from general explanatory text.

## Best Practices for Content Creators

* **Always Specify the Language:** Writing ` ```java ` is much better than just ` ``` `, as it tells the system exactly how to color the text.
* **Avoid Very Long Lines:** If your code is too wide, try to break it into multiple lines so students don't have to scroll horizontally on mobile devices.
* **Use Comments:** Include comments within your code blocks (e.g., `// This is a comment` in Java) to explain what specific lines are doing.

> **Pro-Tip:** For terminal commands, use the `bash` language hint. It helps users recognize that the text should be typed into a command prompt.


