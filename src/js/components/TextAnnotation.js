// TextAnnotation.js

import "@recogito/text-annotator/text-annotator.css";
import { createTextAnnotator } from "@recogito/text-annotator";

export default class TextAnnotation {
  constructor(_contentRoot) {
    this.contentRoot = _contentRoot;
    this.anno = null;
    this.annotatingEnabled = true;
    this.activePopup = null; 
    this.currentDraftSelection = null; // Holds unsaved selections
    this.init();
  }

  init() {
    this.initAnnotator();
    this.initGlobalClickListener();
    this.injectStyles(); 
  }

  initAnnotator() {
    if (this.anno) {
      this.anno.destroy();
      this.anno = null;
    }

    this.anno = createTextAnnotator(this.contentRoot);
    this.loadAnnotations();
    this.setAnnotatingEnabled(this.annotatingEnabled);

    // --- Lifecycle Event Listeners ---

    this.anno.on("updateAnnotation", () => this.saveAnnotations());
    this.anno.on("deleteAnnotation", () => {
      this.saveAnnotations();
      this.closePopup();
    });

    // --- Core Selection Interceptor ---
    this.anno.on("selectionChanged", (selections) => {
      console.log("On selectionChanged", selections);

      if (!selections || selections.length === 0) {
        if (this.currentDraftSelection) {
          this.currentDraftSelection = null;
        }
        this.closePopup();
        return;
      }

      const selectionData = selections[0];
      if (!selectionData) return;

      const isNewSelection = !selectionData.id;

      if (isNewSelection && !this.annotatingEnabled) {
        this.closePopup();
        return;
      }

      let rect = null;
      const activeSelection = window.getSelection();
      if (activeSelection && activeSelection.rangeCount > 0) {
        rect = activeSelection.getRangeAt(0).getBoundingClientRect();
      }

      if (!rect || rect.width === 0) {
        const targetText = selectionData.target?.selector?.find(s => s.exact)?.exact;
        const highlights = this.contentRoot.querySelectorAll(".r6o-annotation, .r6o-span-highlight, span");
        const element = Array.from(highlights).find(el => el.textContent.trim() === targetText?.trim());
        if (element) {
          rect = element.getBoundingClientRect();
        }
      }

      if (rect && rect.width > 0) {
        if (isNewSelection) {
          this.currentDraftSelection = selectionData;
          this.openPopup(selectionData, rect, true); 
        } else {
          this.currentDraftSelection = null;
          this.openPopup(selectionData, rect, false); 
        }
      }
    }); 
  } 

  // --- Dynamic Callout Popup Window Generation ---

  openPopup(annotation, rect, isDraft = false) {
    this.closePopup(false); // Clean any open popups without clearing Recogito selection state yet

    const popup = document.createElement("div");
    popup.className = "annotation-callout-popup";
    
    const existingCommentBody = Array.isArray(annotation.bodies)
      ? annotation.bodies.find(b => b.purpose === "commenting")
      : null;
    const initialText = existingCommentBody ? existingCommentBody.value : "";

    if (!this.annotatingEnabled) {
      popup.innerHTML = `
        <div class="popup-content">
          <textarea readonly placeholder="No comment attached." rows="3">${initialText}</textarea>
        </div>
      `;
    } else {
      popup.innerHTML = `
        <div class="popup-content">
          <textarea placeholder="Write a comment..." rows="3">${initialText}</textarea>
          <div class="popup-actions">
            <button class="btn-save">Save</button>
            <button class="btn-delete">${isDraft ? "Cancel" : "Delete"}</button>
          </div>
        </div>
      `;
    }

    popup.style.position = "fixed";
    popup.style.top = `${rect.top + window.scrollY - 10}px`; 
    popup.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
    popup.style.transform = "translate(-50%, -100%)";
    popup.style.zIndex = "99999"; 

    document.body.appendChild(popup);
    this.activePopup = popup;

    popup.addEventListener("mousedown", (e) => e.stopPropagation());
    popup.addEventListener("click", (e) => e.stopPropagation());

    if (!this.annotatingEnabled) return;

    popup.querySelector(".btn-save").addEventListener("click", () => {
      const textValue = popup.querySelector("textarea").value.trim();
      
      const targetAnnotation = JSON.parse(JSON.stringify(annotation));
      if (!Array.isArray(targetAnnotation.bodies)) {
        targetAnnotation.bodies = [];
      }

      const commentBody = textValue !== "" ? {
        type: "TextualBody",
        value: textValue,
        purpose: "commenting",
        format: "text/plain"
      } : null;

      const commentIndex = targetAnnotation.bodies.findIndex(b => b.purpose === "commenting");

      if (commentBody) {
        if (commentIndex > -1) {
          targetAnnotation.bodies[commentIndex] = commentBody;
        } else {
          targetAnnotation.bodies.push(commentBody);
        }
      } else if (commentIndex > -1) {
        targetAnnotation.bodies.splice(commentIndex, 1);
      }

      if (isDraft) {
        if (this.isOverlapping(targetAnnotation)) {
          alert("Overlapping annotations are not allowed!");
          this.closePopup();
          return;
        }
        
        targetAnnotation.id = crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`;
        this.anno.addAnnotation(targetAnnotation);
      } else {
        this.anno.updateAnnotation(targetAnnotation);
      }

      this.saveAnnotations();
      this.closePopup();
    });

    popup.querySelector(".btn-delete").addEventListener("click", () => {
      if (isDraft) {
        window.getSelection().removeAllRanges();
      } else {
        this.anno.removeAnnotation(annotation.id);
      }
      this.closePopup();
    });
  }

  // --- FIX: Clear Recogito selection programmatically on popup close ---
  closePopup(clearRecogitoSelection = true) {
    if (this.activePopup) {
      this.activePopup.remove();
      this.activePopup = null;
    }
    
    // Clear Recogito's internal state so the exact same annotation can be instantly re-clicked
    if (clearRecogitoSelection && this.anno && this.anno.setSelected) {
      this.anno.setSelected(null);
    }
  }

  initGlobalClickListener() {
    window.addEventListener("mousedown", (e) => {
      if (this.activePopup && !e.target.closest(".annotation-callout-popup")) {
        this.closePopup();
      }
    });
  }

  // --- Storage & Verification Controls ---

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

      if (targetStart < existingPosition.end && targetEnd > existingPosition.start) {
        return true; 
      }
    }
    return false;
  }

  setAnnotatingEnabled(_editable) {
    this.annotatingEnabled = _editable;
    if (!this.anno) return;
    this.anno.setAnnotatingEnabled(_editable);
    if (!_editable && this.anno.setUserSelectAction) {
      this.anno.setUserSelectAction("SELECT"); 
    } else if (this.anno.setUserSelectAction) {
      this.anno.setUserSelectAction("EDIT");
    }
  }

  destroy() {
    this.closePopup();
    if (this.anno) this.anno.destroy();
  }

  injectStyles() {
    if (document.getElementById("annotation-popup-styles")) return;
    const style = document.createElement("style");
    style.id = "annotation-popup-styles";
    style.innerHTML = `
      .annotation-callout-popup {
        background: #ffffff !important; border-radius: 8px !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.2) !important;
        padding: 12px !important; width: 240px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
      .annotation-callout-popup::after {
        content: ""; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%) rotate(45deg);
        width: 12px; height: 12px; background: #ffffff; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.05);
      }
      .popup-content textarea {
        width: 100% !important; box-sizing: border-box !important; border: 1px solid #e2e8f0 !important;
        border-radius: 4px !important; padding: 6px 8px !important; font-size: 14px !important; resize: vertical !important;
      }
      .popup-content textarea[readonly] {
        background-color: #f7fafc !important; color: #4a5568 !important; border-style: dashed !important; cursor: default !important;
      }
      .popup-actions { display: flex !important; justify-content: space-between !important; margin-top: 8px !important; }
      .popup-actions button { padding: 5px 12px !important; font-size: 12px !important; font-weight: 500 !important; border-radius: 4px !important; cursor: pointer !important; border: none !important; }
      .popup-actions .btn-save { background-color: #3182ce !important; color: #fff !important; }
      .popup-actions .btn-delete { background-color: #e53e3e !important; color: #fff !important; }
    `;
    document.head.appendChild(style);
  }
}