import { beforeEach, describe, expect, it, vi } from "vitest";

class MockIntersectionObserver {
  observe() {}
}

globalThis.IntersectionObserver = MockIntersectionObserver;
globalThis.renderMathInElement = () => {};

vi.mock("../src/js/components/QuestionLoader", () => ({
  default: class QuestionLoader {},
}));

vi.mock("../src/js/components/NotesMaker", () => ({
  default: class NotesMaker {
    setEditable() {}
  },
}));

vi.mock("bootstrap/js/dist/offcanvas", () => ({
  default: class Offcanvas {
    constructor(element) {
      this.element = element;
    }

    show() {
      this.element.dataset.shown = "true";
    }
  },
}));

describe("documentation answer links", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = `
      <button id="offcanvasDocsTree"></button>
      <input id="book-search-input">
      <input id="notes-pencil-toggle" type="checkbox">
      <section id="article-container">
        <article>
          <p><span data-answer-id="10">Welcome to the heart of the Gurukulams Design System.</span></p>
          <p><span data-answer-id="10">The Documentation Module defines the foundational DNA.</span> This sentence is not part of answer 10.</p>
          <h2>Core Pillars</h2>
          <p><span data-answer-id="20">Typography and iconography are also part of this article.</span></p>
          <a id="question" href="$10">What is Documentation Module?</a>
          <a href="$20">What is Iconography?</a>
        </article>
      </section>
      <aside id="article-container-toc"></aside>
      <div id="innerTagOffcanvas">
        <h5 id="offcanvasLabel"></h5>
        <article id="innerTagOffcanvasBody"></article>
      </div>
    `;
  });

  it("intercepts $10 and opens the entire documentation article", async () => {
    await import("../src/js/docs.js");

    const question = document.getElementById("question");
    const clickWasNotCancelled = question.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );

    const offcanvas = document.getElementById("innerTagOffcanvas");
    const title = document.getElementById("offcanvasLabel");
    const body = document.getElementById("innerTagOffcanvasBody");

    expect(clickWasNotCancelled).toBe(false);
    expect(offcanvas.dataset.shown).toBe("true");
    expect(title.textContent).toBe("What is Documentation Module?");
    expect(body.textContent).toContain("Welcome to the heart of the Gurukulams Design System.");
    expect(body.textContent).toContain("The Documentation Module defines the foundational DNA.");
    expect(body.textContent).toContain("Core Pillars");
    expect(body.textContent).toContain("Typography and iconography are also part of this article.");

    const highlightedPassages = body.querySelectorAll(
      '[data-answer-id="10"].bg-warning-subtle',
    );
    expect(highlightedPassages).toHaveLength(2);
    expect(
      body.querySelector('[data-answer-id="20"]').classList.contains("bg-warning-subtle"),
    ).toBe(false);

    const copiedQuestion = Array.from(body.querySelectorAll('a[href="$20"]'))
      .find((link) => link.textContent === "What is Iconography?");
    const copiedClickWasNotCancelled = copiedQuestion.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );

    expect(copiedClickWasNotCancelled).toBe(false);
    expect(title.textContent).toBe("What is Iconography?");
    expect(body.querySelectorAll('[data-answer-id="20"].bg-warning-subtle')).toHaveLength(1);
    expect(body.querySelectorAll('[data-answer-id="10"].bg-warning-subtle')).toHaveLength(0);
  });
});
