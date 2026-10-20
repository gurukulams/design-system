import TextAnnotation from './TextAnnotation';
import ImageAnnotation from './ImageAnnotation';
import { ColorPickerManager } from './ColorPickerManager';
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { createTextAnnotator } from "@recogito/text-annotator";

export default class NotesMaker {
  constructor(_articleContainer, _notiFyFn) {
    const article = _articleContainer.querySelector("article:not(.side-article)");

    this.textanno = new TextAnnotation(article);
    this.imageAnno = new ImageAnnotation(article);

    this.setEditable(false);
    this.init();

    this.handleInnerTagging();
  }

  init() {
    const pencilToggle = document.getElementById("notes-pencil-toggle");

    if (pencilToggle) {
      pencilToggle.addEventListener("change", (e) => {
        this.setEditable(e.target.checked);
        console.log("Editor Enabled " + e.target.checked);
      });
    }

    // Initialize Color Picker module and hook up callbacks
    this.colorPickerManager = new ColorPickerManager({
      onColorChange: (computedHex, userTriggered) => {
        if (userTriggered && pencilToggle && !pencilToggle.checked) {
          pencilToggle.checked = true;
          pencilToggle.dispatchEvent(new Event('change'));
        }
      },
      onIntentChange: (intent) => {
        this.setNotesIntent(intent);
      }
    });
  }


  handleInnerTagging() {
    document.addEventListener('click', (event) => {
      // Find the closest anchor tag whose href starts with '$'
      const anchor = event.target.closest('a[href^="$"]');

      // Only react to answer links that live inside the article we manage
      // (the article may have been relocated into the offcanvas body, so
      // check against the live contentRoot reference rather than a fixed container)
      if (!anchor || !this.textanno.contentRoot.contains(anchor)) return;

      // Prevent default link navigation (page jump)
      event.preventDefault();

      // Extract the ID (e.g., "$design-system" becomes "design-system")
      const hrefValue = anchor.getAttribute('href');
      const targetId = hrefValue.slice(1).trim();
      const questionTxt = anchor.textContent.trim();

      if (!targetId) return;

      this.textanno.highlightAnswer(questionTxt, targetId);
    });
  }

  setNotesIntent(_intent) {
    this.textanno.setNotesIntent(_intent);
    this.imageAnno.setNotesIntent(_intent);
  }

  setEditable(_editable) {
    this.textanno.setAnnotatingEnabled(_editable);
    this.imageAnno.setAnnotatingEnabled(_editable);
  }
}