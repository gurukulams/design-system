---
title: "Images"
weight: 3
description: "Guidelines for responsive images and figures."
---


Images are a powerful way to enhance educational content, making complex ideas easier to visualize and remember. In the **Gurukulams Design System**, we ensure that images are not only easy to include but are also responsive and accessible to all learners.

---

## How to Add Images

In Markdown, adding an image is very similar to adding a link, but it starts with an exclamation mark `!`.

### 1. Basic Image Syntax
To display an image, use the following format:
`![Alternative Text](Image URL)`

**Example:**
`![Guru](guru.jpeg)`

![Guru](guru.jpeg)

> In case if the language does not have this image it will be taken from default language ( `content.en` folder )

---

## Important Features

### 1. Descriptive "Alt Text"
The text inside the brackets `[...]` is called **Alternative Text**. It is crucial for two reasons:
* **Accessibility:** Screen readers read this text aloud to visually impaired students.
* **Fallback:** If the image fails to load due to a poor internet connection, this text appears in its place.

**Best Practice:** Instead of writing `![Image]`, write something descriptive like `![Diagram showing the parts of a plant cell]`.

### 2. Responsive Sizing
You don't need to worry about images being too wide for mobile screens. The design system automatically ensures that:
* Images never overflow the edges of the screen.
* Images maintain their original proportions (they won't look stretched).

---

## Organizing Your Images

To keep your documentation clean, it is best to follow a standard folder structure. Usually, images are stored in a central `images` or `static` folder.

* **Local Images:** `![Sample](/images/photo.png)` (Refers to a file within your project).
* **External Images:** `![Sample](https://example.com/photo.png)` (Refers to an image hosted on another website).

---

## Best Practices for Content Creators

* **Use High Quality, Low Weight:** Use images that are clear, but try to keep file sizes small (e.g., using `.webp` or compressed `.jpg`) so the page loads quickly for students on mobile data.
* **Consistency:** Use a similar style for diagrams and illustrations across a single module to provide a unified learning experience.
* **Alignment:** By default, images are aligned to the left. If an image is very small, consider if it needs a caption below it to explain its relevance to the text.

> **Pro-Tip:** If you are documenting a process, use a series of small screenshots or icons to guide the student step-by-step.