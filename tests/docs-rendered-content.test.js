import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outputDirectory = mkdtempSync(join(tmpdir(), "design-system-hugo-"));
let renderedDocument;

describe("rendered documentation question mappings", () => {
  beforeAll(() => {
    execFileSync(
      "hugo",
      [
        "-s",
        "exampleSite",
        "--themesDir",
        "../..",
        "--destination",
        outputDirectory,
        "--cleanDestinationDir",
      ],
      { cwd: process.cwd(), stdio: "pipe" },
    );

    const html = readFileSync(
      join(outputDirectory, "docs/documentation/index.html"),
      "utf8",
    );
    renderedDocument = new DOMParser().parseFromString(html, "text/html");
  });

  afterAll(() => {
    rmSync(outputDirectory, { recursive: true, force: true });
  });

  it("maps the Iconography question to only the Iconography answer", () => {
    const question = Array.from(renderedDocument.querySelectorAll("a")).find(
      (link) => link.textContent.trim() === "What is Iconography ?",
    );
    const answers = renderedDocument.querySelectorAll('[data-answer-id="20"]');

    expect(question.getAttribute("href")).toBe("$20");
    expect(answers).toHaveLength(1);
    expect(answers[0].textContent.replace(/\s+/g, " ").trim()).toBe(
      "Iconography: Utilizing Bootstrap Icons to provide visual cues for navigation and actions.",
    );
  });
});
