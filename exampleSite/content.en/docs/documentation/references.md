---
title: "References"
weight: 5
description: "How to display references."
---

> References provide additional learning resources related to the content of a page. They can be used to direct readers to videos, external websites, or books for deeper understanding of a topic.

The `references` section is defined in the page front matter.

## Videos

Videos can be added from YouTube or from custom video URLs.

### Example

```yaml
references:
  videos:
    - youtube: dX8396ADdto

    - custom:
        title: "Electric Charge - Historical Background"
        desc: "Electric Charge - Historical Background"
        url: "https://d1fiv8ydi7ukjo.cloudfront.net/manarkeni/video/70e56da0-d70f-11ef-9591-cb3e87f486ed.mp4"
```

### Supported Types

| Type      | Description                                                                    |
| --------- | ------------------------------------------------------------------------------ |
| `youtube` | Embeds a YouTube video using the video ID.                                     |
| `custom`  | Displays a custom-hosted video using the provided URL, title, and description. |

---

## Web Links

Web links allow you to provide additional online resources that readers can explore.

### Example

```yaml
references:
  links:
    - "[Google Fonts Knowledge Base](https://fonts.google.com/knowledge)"

    - "[W3C Typography Accessibility](https://www.w3.org/WAI/tutorials/page-structure/headings/)"
```

### Usage

Use web links to reference:

* Official documentation
* Tutorials and guides
* Research articles
* Standards and specifications
* External learning resources

---

## Books

Books can be added as recommended reading materials with author, publisher, edition, and purchase/reference links.

### Example

```yaml
references:
  books:
    - b1:
        title: "On Web Typography"
        authors:
          - "Jason Santa Maria"
        publisher: "A Book Apart"
        url: "https://www.amazon.com/s?k=On+Web+Typography+Jason+Santa+Maria"

    - b2:
        title: "Better Web Typography for a Better Web"
        authors:
          - "Matej Latin"
        publisher: "Self-Published"
        edition: "2nd Edition"
        url: "https://www.amazon.com/s?k=Better+Web+Typography+for+a+Better+Web+Matej+Latin"
```

### Supported Fields

| Field       | Description                                      |
| ----------- | ------------------------------------------------ |
| `title`     | Title of the book.                               |
| `authors`   | List of authors.                                 |
| `publisher` | Name of the publisher.                           |
| `edition`   | Edition of the book (optional).                  |
| `url`       | Link to additional information or purchase page. |

---

## Complete Example

```yaml
references:
  videos:
    - youtube: dX8396ADdto

  links:
    - "[Google Fonts Knowledge Base](https://fonts.google.com/knowledge)"

  books:
    - b1:
        title: "On Web Typography"
        authors:
          - "Jason Santa Maria"
        publisher: "A Book Apart"
```

This configuration allows a page to include videos, external resources, and recommended books in a structured and consistent manner.
