---
title: "Match the Following"
weight: 3
categories:
    - match-the-following
---

> Match the Following is a dynamic assessment tool used to test a learner’s ability to identify relationships between different concepts, patterns, or components. Use this format to map specific tools to their underlying architectural patterns or to connect terms with their definitions.

## Syntax

A Match the Following question uses two YAML fields:

* `choices`: Lists the items to be matched (the premises or source terms).
* `matches`: Lists the corresponding targets or definitions. **The number of items in `matches` can be equal to or greater than the number of items in `choices**`, allowing you to include extra distractor options.

The question can be written using any supported Markdown content.

```markdown
---
choices:
- "Choice 1"
- "Choice 2"
matches:
- "Match 1"
- "Match 2"
- "Extra Distractor"
---

Write your question here?

Additional Markdown content can be added here.

---

Explanation of the correct relationships and matches.

```

## Usage Example

The following example maps Java components and APIs to their corresponding design patterns, including an additional distractor in the matches list.

```markdown
---
choices:
- "Collection Streams API"
- "Buffered Reader"
- "Container"
matches:
- "Builder"
- "Decorator"
- "Composite"
- "Singleton"
---

Match each Java component or API to its corresponding design pattern.

---

- **Collection Streams API** maps to **Builder** (enables fluent composition and configuration of pipeline operations).
- **Buffered Reader** maps to **Decorator** (wraps an underlying reader stream to add buffering behavior).
- **Container** maps to **Composite** (allows individual items and nested component structures to be treated uniformly).

```