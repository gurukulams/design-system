// TextAnnotation.js

import "@recogito/text-annotator/text-annotator.css";
import { createTextAnnotator } from "@recogito/text-annotator";

export default class TextAnnotation {
  constructor(_contentRoot) {
    this.contentRoot = _contentRoot;
    this.anno = null;
    this.annotatingEnabled = true;
    this.init();
  }

  init() {
    this.initAnnotator();
  }

  initAnnotator() {
    if (this.anno) {
      this.anno.destroy();
      this.anno = null;
    }

    this.anno = createTextAnnotator(this.contentRoot);
    this.loadAnnotations();
    this.setAnnotatingEnabled(this.annotatingEnabled);

    // --- Overlap Prevention Logic ---

    this.anno.on("createAnnotation", (annotation) => {
      if (this.isOverlapping(annotation)) {
        // Alert the user and immediately remove the overlapping annotation from the UI
        alert("Overlapping annotations are not allowed!");
        this.anno.removeAnnotation(annotation.id);
        return;
      }
      this.saveAnnotations();
    });

    this.anno.on("updateAnnotation", (annotation, previous) => {
      if (this.isOverlapping(annotation)) {
        alert("This change causes an overlap and cannot be saved.");
        // Revert to the previous state if it overlaps
        this.anno.addAnnotation(previous, true); 
        return;
      }
      this.saveAnnotations();
    });

    this.anno.on("deleteAnnotation", () => this.saveAnnotations());
  }

  storageKey() {
    return `text-annotations:${window.location.pathname}`;
  }

  saveAnnotations() {
    if (!this.anno) return;

    localStorage.setItem(
      this.storageKey(),
      JSON.stringify(this.anno.getAnnotations())
    );
  }

  loadAnnotations() {
    if (!this.anno) return;

    const saved = localStorage.getItem(this.storageKey());

    if (!saved) return;

    try {
      this.anno.setAnnotations(JSON.parse(saved));
    } catch (e) {
      console.warn("Invalid saved annotations", e);
    }
  }

  /**
   * Checks if a target annotation overlaps with any existing annotations
   */
   isOverlapping(targetAnno) {
    if (!this.anno) return false;

    // Recogito selectors are wrapped inside an array
    const targetSelectors = targetAnno.target?.selector;
    if (!targetSelectors || !Array.length) return false;

    // Find the selector element that holds text offsets (start & end)
    const targetPosition = targetSelectors.find(s => s.start !== undefined);
    if (!targetPosition) return false;

    const targetStart = targetPosition.start;
    const targetEnd = targetPosition.end;

    // Grab all currently active annotations
    const allAnnotations = this.anno.getAnnotations();

    for (const existingAnno of allAnnotations) {
      // Don't compare the annotation against itself
      if (existingAnno.id === targetAnno.id) continue;

      const existingSelectors = existingAnno.target?.selector;
      if (!existingSelectors) continue;

      const existingPosition = existingSelectors.find(s => s.start !== undefined);
      if (!existingPosition) continue;

      const existingStart = existingPosition.start;
      const existingEnd = existingPosition.end;

      // Checking for exact matching indices or partial bounding overlap
      if (targetStart < existingEnd && targetEnd > existingStart) {
        return true; // Overlap confirmed!
      }
    }

    return false; // Safe to create
  }

  setAnnotatingEnabled(_editable) {
    this.annotatingEnabled = _editable;

    if (!this.anno) return;

    // enable/disable creating annotations
    this.anno.setAnnotatingEnabled(_editable);

    // optional hard readonly
    if (!_editable && this.anno.setUserSelectAction) {
      this.anno.setUserSelectAction("NONE");
    } else if (this.anno.setUserSelectAction) {
      this.anno.setUserSelectAction("EDIT");
    }
  }

  destroy() {
    if (this.anno) {
      this.anno.destroy();
    }
  }
}
