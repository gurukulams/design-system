// AnnotationPopup.js

export default class AnnotationPopup {
    constructor(options = {}) {
      this.activePopup = null;
      this.onSave = options.onSave || (() => {});
      this.onDelete = options.onDelete || (() => {});
      this.onCancel = options.onCancel || (() => {});
      this.onCloseMemory = options.onCloseMemory || (() => {});
  
      this.initGlobalClickListener();
      this.injectStyles();
    }
  
    open({ annotation, rect, isDraft = false, editable = true, usePageScroll = false }) {
      this.close(false);
  
      const popup = document.createElement("div");
      popup.className = "annotation-callout-popup";
  
      const existingCommentBody = Array.isArray(annotation.bodies)
        ? annotation.bodies.find(b => b.purpose === "commenting")
        : null;
      const initialText = existingCommentBody ? existingCommentBody.value : "";
  
      if (!editable) {
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
  
      // Apply viewport tracking offsets depending on selection system target
      const scrollTopOffset = usePageScroll ? window.scrollY : 0;
      const scrollLeftOffset = usePageScroll ? window.scrollX : 0;
  
      popup.style.position = "fixed";
      popup.style.top = `${rect.top + scrollTopOffset - 10}px`;
      popup.style.left = `${rect.left + scrollLeftOffset + (rect.width / 2)}px`;
      popup.style.transform = "translate(-50%, -100%)";
      popup.style.zIndex = "99999";
  
      document.body.appendChild(popup);
      this.activePopup = popup;
  
      popup.addEventListener("mousedown", (e) => e.stopPropagation());
      popup.addEventListener("click", (e) => e.stopPropagation());
  
      if (!editable) return;
  
      popup.querySelector(".btn-save").addEventListener("click", () => {
        const textValue = popup.querySelector("textarea").value.trim();
        this.onSave(annotation, textValue, isDraft);
        this.close(true);
      });
  
      popup.querySelector(".btn-delete").addEventListener("click", () => {
        if (isDraft) {
          this.onCancel();
        } else {
          this.onDelete(annotation.id);
        }
        this.close(true);
      });
    }
  
    close(clearSelectionMemory = true) {
      if (this.activePopup) {
        this.activePopup.remove();
        this.activePopup = null;
      }
      if (clearSelectionMemory) {
        this.onCloseMemory();
      }
    }
  
    initGlobalClickListener() {
      window.addEventListener("mousedown", (e) => {
        if (this.activePopup && !e.target.closest(".annotation-callout-popup")) {
          this.close(true);
        }
      });
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