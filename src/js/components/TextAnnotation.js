// TextAnnotation.js

import "@recogito/text-annotator/text-annotator.css";
import { createTextAnnotator } from "@recogito/text-annotator";
import AnnotationPopup from "./AnnotationPopup";

export default class TextAnnotation {
  constructor(_contentRoot) {
    this.contentRoot = _contentRoot;
    this.anno = null;
    this.annotatingEnabled = true;

    // Initialize shared popup control using the decoupled external module template
    this.popup = new AnnotationPopup({
      onSave: (annotation, textValue, isDraft) => this.handleSaveComment(annotation, textValue, isDraft),
      onDelete: (id) => this.handleDeleteAnnotation(id),
      onCancel: () => this.handleCancelDraft(),
      onCloseMemory: () => this.clearEngineSelection()
    });

    this.init();
  }

  init() {
    this.initAnnotator();
    this.initReadOnlyClickListener(); // Add native fallback handler for read-only view
  }

  initAnnotator() {
    if (this.anno) {
      this.anno.destroy();
      this.anno = null;
    }

    this.anno = createTextAnnotator(this.contentRoot);
    this.loadAnnotations();
    this.setAnnotatingEnabled(this.annotatingEnabled);

    // --- Core Lifecycle Hooks & Working Overlap Protection ---

    this.anno.on("createAnnotation", (annotation) => {
      if (this.isOverlapping(annotation)) {
        alert("Overlapping annotations are not allowed!");
        this.anno.removeAnnotation(annotation.id);
        this.popup.close(true);
        return;
      }
      
      this.saveAnnotations();
      
      setTimeout(() => {
        this.triggerPopupForAnnotation(annotation, true);
      }, 50);
    });

    this.anno.on("updateAnnotation", (annotation, previous) => {
      if (this.isOverlapping(annotation)) {
        alert("This change causes an overlap and cannot be saved.");
        this.anno.addAnnotation(previous, true);
        this.popup.close(true);
        return;
      }
      this.saveAnnotations();
    });

    this.anno.on("deleteAnnotation", () => {
      this.saveAnnotations();
    });

    // --- Selection Event Handler for Popup Display (Editable Mode) ---
    this.anno.on("selectionChanged", (selections) => {
      if (!selections || selections.length === 0) {
        if (!document.activeElement.closest('.annotation-callout-popup')) {
          this.popup.close(false);
        }
        return;
      }

      const selectionData = selections[0];
      if (!selectionData) return;

      const isNewSelection = !selectionData.id;

      if (isNewSelection && !this.annotatingEnabled) {
        this.popup.close(true);
        return;
      }

      if (!isNewSelection) {
        this.triggerPopupForAnnotation(selectionData, false);
      }
    }); 
  }

  /**
   * FIX: Catch direct clicks on annotation elements when Recogito's tracking events are offline
   */
   initReadOnlyClickListener() {
    // Prevent long-press touch selections on smartboards completely
    this.contentRoot.addEventListener('touchstart', (e) => {
      // Only block if they hit an annotation span to preserve scrolling/swiping elsewhere
      if (e.target.closest('.r6o-annotation')) {
        // Prevents the smartboard engine from bringing up native selection pins
        e.preventDefault(); 
      }
    }, { passive: false });
  
    const handleAnnotationActivation = (targetElement) => {
      const annotationSpan = targetElement.closest(".r6o-annotation");
      if (!annotationSpan || !this.anno) return;
  
      const annotationId = annotationSpan.getAttribute("data-id");
      if (!annotationId) return;
  
      const matchedAnnotation = this.anno.getAnnotations().find(a => a.id === annotationId);
      if (matchedAnnotation) {
        setTimeout(() => {
          const rect = annotationSpan.getBoundingClientRect();
          this.popup.open({
            annotation: matchedAnnotation,
            rect,
            isDraft: false,
            editable: this.annotatingEnabled,
            usePageScroll: true
          });
        }, 50);
      }
    };
  
    // Fast-response listener
    this.contentRoot.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      handleAnnotationActivation(e.target);
    });
  }

  /**
   * Calculates the DOM client bounding rectangle and pops open the external manager
   */
  triggerPopupForAnnotation(annotation, isDraft = false) {
    let rect = null;

    const targetText = annotation.target?.selector?.find(s => s.exact)?.exact;
    if (targetText) {
      const highlights = this.contentRoot.querySelectorAll(".r6o-annotation, .r6o-span-highlight, span");
      const element = Array.from(highlights).find(el => el.textContent.trim() === targetText.trim());
      if (element) {
        rect = element.getBoundingClientRect();
      }
    }

    if (!rect || rect.width === 0) {
      const activeSelection = window.getSelection();
      if (activeSelection && activeSelection.rangeCount > 0) {
        rect = activeSelection.getRangeAt(0).getBoundingClientRect();
      }
    }

    if (rect && rect.width > 0) {
      this.popup.open({
        annotation,
        rect,
        isDraft,
        editable: this.annotatingEnabled,
        usePageScroll: true
      });
    }
  }

  handleSaveComment(annotation, textValue, isDraft) {
    const targetAnnotation = JSON.parse(JSON.stringify(annotation));
    if (!Array.isArray(targetAnnotation.bodies)) targetAnnotation.bodies = [];

    const commentBody = textValue !== "" ? {
      type: "TextualBody",
      value: textValue,
      purpose: "commenting",
      format: "text/plain"
    } : null;

    const commentIndex = targetAnnotation.bodies.findIndex(b => b.purpose === "commenting");

    if (commentBody) {
      if (commentIndex > -1) targetAnnotation.bodies[commentIndex] = commentBody;
      else targetAnnotation.bodies.push(commentBody);
    } else if (commentIndex > -1) {
      targetAnnotation.bodies.splice(commentIndex, 1);
    }

    this.anno.updateAnnotation(targetAnnotation);
    this.saveAnnotations();
  }

  handleDeleteAnnotation(id) {
    this.anno.removeAnnotation(id);
    this.saveAnnotations();
  }

  handleCancelDraft() {
    window.getSelection().removeAllRanges();
  }

  clearEngineSelection() {
    if (this.anno && this.anno.setSelected) {
      this.anno.setSelected(null);
    }
  }

  isOverlapping(targetAnno) {
    if (!this.anno) return false;

    const targetSelectors = targetAnno.target?.selector;
    if (!targetSelectors || !targetSelectors.length) return false;

    const targetPosition = targetSelectors.find(s => s.start !== undefined);
    if (!targetPosition) return false;

    const targetStart = targetPosition.start;
    const targetEnd = targetPosition.end;

    const allAnnotations = this.anno.getAnnotations();

    for (const existingAnno of allAnnotations) {
      if (existingAnno.id === targetAnno.id) continue;

      const existingSelectors = existingAnno.target?.selector;
      if (!existingSelectors) continue;

      const existingPosition = existingSelectors.find(s => s.start !== undefined);
      if (!existingPosition) continue;

      const existingStart = existingPosition.start;
      const existingEnd = existingPosition.end;

      if (targetStart < existingEnd && targetEnd > existingStart) {
        return true; 
      }
    }

    return false;
  }

  storageKey() {
    return `text-annotations:${window.location.pathname}`;
  }

  saveAnnotations() {
    if (!this.anno) return;
    localStorage.setItem(this.storageKey(), JSON.stringify(this.anno.getAnnotations()));
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

  setAnnotatingEnabled(_editable) {
    this.annotatingEnabled = _editable;
    if (!this.anno) return;
    
    this.anno.setAnnotatingEnabled(_editable);
    
    if (!_editable && this.anno.setUserSelectAction) {
      // CRITICAL FIX: "SELECT" keeps the highlight span wrappers in the DOM 
      // while preventing the creation of new annotations or edit changes.
      this.anno.setUserSelectAction("SELECT"); 
    } else if (this.anno.setUserSelectAction) {
      this.anno.setUserSelectAction("EDIT");
    }
  }
  destroy() {
    this.popup.close(true);
    if (this.anno) this.anno.destroy();
  }
}