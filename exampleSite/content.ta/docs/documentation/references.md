---
title: "குறிப்புகள்"
weight: 5
description: "ஒரு பக்கத்திற்கான காணொளிகள், இணைய இணைப்புகள் மற்றும் புத்தகங்களை மேற்கோள் வளங்களாக அமைப்பது."
---

> குறிப்புகள் (References) என்பது ஒரு பக்கத்தின் உள்ளடக்கத்துடன் தொடர்புடைய கூடுதல் கற்றல் வளங்களை வழங்க பயன்படுகின்றன. ஒரு தலைப்பைப் பற்றி மேலும் ஆழமாக அறிய வாசகர்களை காணொளிகள், இணையதளங்கள் அல்லது புத்தகங்களுக்குத் திசைதிருப்ப இவை உதவுகின்றன.

`references` பகுதி பக்கத்தின் Front Matter-ல் வரையறுக்கப்படுகிறது.

## காணொளிகள்

YouTube அல்லது தனிப்பயன் (Custom) காணொளி இணைப்புகளை மேற்கோள்களாகச் சேர்க்கலாம்.

### எடுத்துக்காட்டு

```yaml
references:
  videos:
    - youtube: dX8396ADdto

    - custom:
        title: "Electric Charge - Historical Background"
        desc: "Electric Charge - Historical Background"
        url: "https://d1fiv8ydi7ukjo.cloudfront.net/manarkeni/video/70e56da0-d70f-11ef-9591-cb3e87f486ed.mp4"
```

### ஆதரிக்கப்படும் வகைகள்

| வகை       | விளக்கம்                                                                       |
| --------- | ------------------------------------------------------------------------------ |
| `youtube` | YouTube காணொளியை அதன் Video ID மூலம் இணைக்கிறது.                               |
| `custom`  | வழங்கப்பட்ட URL, தலைப்பு மற்றும் விளக்கத்துடன் தனிப்பயன் காணொளியை காட்டுகிறது. |

---

## இணைய இணைப்புகள்

இணைய இணைப்புகள் (Web Links) மூலம் வாசகர்கள் மேலும் ஆய்வு செய்யக்கூடிய வெளிப்புற வளங்களை வழங்கலாம்.

### எடுத்துக்காட்டு

```yaml
references:
  links:
    - "[Google Fonts Knowledge Base](https://fonts.google.com/knowledge)"

    - "[W3C Typography Accessibility](https://www.w3.org/WAI/tutorials/page-structure/headings/)"
```

### பயன்பாடுகள்

இணைய இணைப்புகளை பின்வரும் வகை வளங்களுக்கு பயன்படுத்தலாம்:

* அதிகாரப்பூர்வ ஆவணங்கள் (Official Documentation)
* பயிற்சி வழிகாட்டிகள் (Tutorials & Guides)
* ஆராய்ச்சி கட்டுரைகள்
* தரநிலைகள் மற்றும் விவரக்குறிப்புகள் (Standards & Specifications)
* வெளிப்புற கற்றல் வளங்கள்

---

## புத்தகங்கள்

புத்தகங்களை பரிந்துரைக்கப்பட்ட வாசிப்பு வளங்களாக சேர்க்கலாம். இதில் ஆசிரியர்கள், பதிப்பகம், பதிப்பு (Edition) மற்றும் வாங்குதல் அல்லது தகவல் பெறும் இணைப்புகள் வழங்கப்படலாம்.

### எடுத்துக்காட்டு

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

### ஆதரிக்கப்படும் புலங்கள்

| புலம்       | விளக்கம்                                                  |
| ----------- | --------------------------------------------------------- |
| `title`     | புத்தகத்தின் தலைப்பு                                      |
| `authors`   | ஆசிரியர்களின் பட்டியல்                                    |
| `publisher` | பதிப்பகத்தின் பெயர்                                       |
| `edition`   | பதிப்பு விவரம் (விருப்பத் தேர்வு)                         |
| `url`       | புத்தகத்தைப் பற்றிய கூடுதல் தகவல் அல்லது வாங்கும் இணைப்பு |

---

## முழுமையான எடுத்துக்காட்டு

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

இந்த அமைப்பு மூலம் ஒரு பக்கத்தில் காணொளிகள், இணைய வளங்கள் மற்றும் பரிந்துரைக்கப்பட்ட புத்தகங்களை ஒரே மாதிரியான கட்டமைப்பில் வழங்க முடியும்.
