# Gurukulams Design System

The Gurukulams Design System serves as the unified visual and functional blueprint for our educational ecosystem. It is engineered to bridge the gap between complex automation frameworks and intuitive learning experiences, ensuring a seamless transition for users across our diverse subsystems.

## Setup

### Question Loader

The Question Loader processes data from your `exampleSite` and prepares it for the frontend.

**Linux / macOS**
```bash
export QUESTIONS_FOLDER="$PWD/exampleSite/questions"
export PUBLIC_FOLDER="$PWD/static" 
npm i
npm run watch
```

**Windows (Cmd)**
```bash
set QUESTIONS_FOLDER=%cd%\exampleSite\questions
set PUBLIC_FOLDER=%cd%\static
npm i
npm run watch
```

### Static Server

To preview the documentation and presentations locally using Hugo:

```bash
cd exampleSite
hugo server --themesDir ../.. --disableFastRender
```

---

## Credits

This project is built upon and inspired by the following open-source technologies:

* **[Hugo](https://gohugo.io/)** - The world’s fastest framework for building websites.
* **[Bootstrap](https://getbootstrap.com/)** - The most popular front-end open-source toolkit, used for our core UI components and grid system.
* **[Hugo Book Theme](https://github.com/alex-shpak/hugo-book)** - A sleek and functional documentation theme that serves as the foundation for our content structure.

