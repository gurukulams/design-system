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

    // 1. Helper function to safely fetch Bootstrap CSS variables with a default fallback
    const getBsColor = (colorName) => {
      const variableValue = getComputedStyle(document.documentElement)
        .getPropertyValue(`--bs-${colorName}`)
        .trim();
      
      // Fallback hex values just in case the CSS hasn't loaded fully when this runs
      if (!variableValue) {
        const fallbacks = { info: '#0dcaf0', success: '#198754', warning: '#ffc107', danger: '#dc3545' };
        return fallbacks[colorName] || fallbacks.info;
      }
      return variableValue;
    };

    // 2. Set your annotation style dynamically
    this.anno.setStyle((annotation, state) => {
      // Extract intent (adjust the path if it lives in annotation.body)
      const intent = annotation.intent || (annotation.body && annotation.body.intent);
      
      // Resolve the color name or default to 'info'
      const validIntents = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'];
      const targetIntent = validIntents.includes(intent) ? intent : 'info';

      // Fetch the live CSS variable color
      const fillColor = getBsColor(targetIntent);

      return {
        fill: fillColor,
        stroke: fillColor, // Matches border to fill for Bootstrap-like consistency
        strokeWidth: state.hovered ? 3 : 1.5, // Optional: Make the border thicker on hover
    
        // Default to 25% opacity (Bootstrap's bg-opacity-25), bump to 60% on hover
        fillOpacity: state.hovered ? 0.6 : 0.30
      };
    });

    // --- Core Lifecycle Hooks & Working Overlap Protection ---

    this.anno.on("createAnnotation", (annotation) => {
      if (this.isOverlapping(annotation)) {
        alert("Overlapping annotations are not allowed!");
        this.anno.removeAnnotation(annotation.id);
        this.popup.close(true);
        return;
      }

      if(this.intent !== "info") {
        annotation.intent = this.intent;
      }
      
      console.log("Created Anno {}", annotation);
      
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

  setNotesIntent(_intent) {
    console.log('Text _intent is ' + _intent);
    this.intent = _intent;
  }

  /**
   * FIX: Catch direct clicks on annotation elements when Recogito's tracking events are offline
   */
  initReadOnlyClickListener() {
    const svgOverlay = this.contentRoot.querySelector('svg, .r6o-annotation-layer');
    
    if (!svgOverlay) {
      setTimeout(() => this.initReadOnlyClickListener(), 100);
      return;
    }
  
    const handleActivation = (targetElement) => {
      const highlightShape = targetElement.closest('.r6o-annotation, [data-id]');
      if (!highlightShape || !this.anno) return;
  
      const annotationId = highlightShape.getAttribute('data-id');
      if (!annotationId) return;
  
      const matchedAnnotation = this.anno.getAnnotations().find(a => a.id === annotationId);
      if (matchedAnnotation) {
        setTimeout(() => {
          const rect = highlightShape.getBoundingClientRect();
          // Process calculations using the new viewport-aware smart handler
          const placementConfig = this.calculateSmartPlacement(rect);

          this.popup.open({
            annotation: matchedAnnotation,
            rect: placementConfig.rect,
            isDraft: false,
            editable: this.annotatingEnabled,
            usePageScroll: true,
            // Pass the calculated alignment switch down to your UI CSS class handlers
            alignment: placementConfig.alignment 
          });
        }, 50);
      }
    };
  
    svgOverlay.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      handleActivation(e.target);
    });
  
    svgOverlay.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.r6o-annotation, [data-id]')) {
        e.preventDefault();
        e.stopPropagation();
        handleActivation(e.target);
      }
    });
  
    svgOverlay.addEventListener('touchstart', (e) => {
      if (e.target.closest('.r6o-annotation, [data-id]')) {
        e.preventDefault(); 
      }
    }, { passive: false });
  }

  /**
   * NEW MECHANISM: Calculates viewport clearance thresholds to prevent cutoff issues
   * at both the top bounds and bottom bounds of the browser window.
   */
  calculateSmartPlacement(rawRect) {
    // Approximate target pixel depth expected for your popup component window 
    // Adjust this value if your design layout uses a taller input form container
    const estimatedPopupHeight = 180; 
    const marginSpacing = 12;

    // Check distance from the top boundary line of the viewport highlight box
    const spaceAtTop = rawRect.top;
    const windowHeight = window.innerHeight;
    const spaceAtBottom = windowHeight - rawRect.bottom;

    let alignment = "above"; // Default desired position
    let modifiedRect = {
      x: rawRect.x,
      y: rawRect.y,
      left: rawRect.left,
      right: rawRect.right,
      width: rawRect.width,
      height: rawRect.height,
      top: rawRect.top,
      bottom: rawRect.bottom
    };

    // SCENARIO 1: Cutoff at the bottom -> Flip it to display comfortably above the text
    if (spaceAtBottom < (estimatedPopupHeight + marginSpacing) && spaceAtTop > (estimatedPopupHeight + marginSpacing)) {
      alignment = "above";
    }
    // SCENARIO 2: Text falls close to the absolute top of the screen -> Push it down below the line safely
    else if (spaceAtTop < (estimatedPopupHeight + marginSpacing)) {
      alignment = "below";
    }

    return {
      rect: modifiedRect,
      alignment: alignment
    };
  }

  /**
   * Calculates the DOM client bounding rectangle and pops open the external manager
   */
   triggerPopupForAnnotation(annotation, isDraft = false) {
    let rect = null;

    // STEP 1: If it's an existing annotation, lookup by Recogito ID (Most reliable)
    if (annotation.id) {
      const element = this.contentRoot.querySelector(`[data-id="${annotation.id}"]`);
      if (element) {
        rect = element.getBoundingClientRect();
      }
    }

    // STEP 2: Windows Fallback - Use Recogito's underlying annotation highlight layer
    if (!rect || rect.width === 0) {
      // Find any Recogito span wrapper that contains our text chunk as a fallback
      const targetText = annotation.target?.selector?.find(s => s.exact)?.exact;
      if (targetText) {
        const highlights = this.contentRoot.querySelectorAll(".r6o-annotation, .r6o-span-highlight");
        const element = Array.from(highlights).find(el => {
          const cleanText = el.textContent.replace(/\s+/g, ' ').trim();
          return cleanText.includes(targetText.trim()) || targetText.trim().includes(cleanText);
        });
        if (element) {
          rect = element.getBoundingClientRect();
        }
      }
    }

    // STEP 3: Fallback to the active user selection range block
    if (!rect || rect.width === 0) {
      const activeSelection = window.getSelection();
      if (activeSelection && activeSelection.rangeCount > 0) {
        const range = activeSelection.getRangeAt(0);
        // Ensure the range isn't collapsed (empty cursor click)
        if (!range.collapsed) {
          rect = range.getBoundingClientRect();
        }
      }
    }

    // STEP 4: Safety Check & Execution Block
    if (rect && rect.width > 0 && rect.height > 0) {
      console.log("Going to open", annotation);
      
      const placementConfig = this.calculateSmartPlacement(rect);

      this.popup.open({
        annotation,
        rect: placementConfig.rect,
        isDraft,
        editable: this.annotatingEnabled,
        usePageScroll: true,
        alignment: placementConfig.alignment
      });
    } else {
      console.warn("Not Going to open - DOM rect calculations returned zero dimensions:", rect);
      
      // STEP 5: Emergency Windows Fallback (Centered relative to the main container)
      // If we still don't have a selection boundary box but an annotation exists, 
      // we place the popover relative to the mouse pointer position or container midpoint
      if (this.contentRoot) {
        console.log("Triggering emergency UI boundary anchor point fallback.");
        const rootRect = this.contentRoot.getBoundingClientRect();
        const fallbackRect = {
          left: rootRect.left + (rootRect.width / 2) - 10,
          top: window.innerHeight / 3, // Safely within upper central zone
          width: 20,
          height: 20,
          right: rootRect.left + (rootRect.width / 2) + 10,
          bottom: (window.innerHeight / 3) + 20
        };
        
        const placementConfig = this.calculateSmartPlacement(fallbackRect);
        this.popup.open({
          annotation,
          rect: fallbackRect,
          isDraft,
          editable: this.annotatingEnabled,
          usePageScroll: true,
          alignment: placementConfig.alignment
        });
      }
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