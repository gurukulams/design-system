import TextAnnotation from './TextAnnotation';
import ImageAnnotation from './ImageAnnotation';
import { ColorPickerManager } from './ColorPickerManager';

export default class NotesMaker {
  constructor(_articleContainer, _notiFyFn) {
    const article = _articleContainer.querySelector("article:not(.side-article)");
    
    this.textanno = new TextAnnotation(article);
    this.imageAnno = new ImageAnnotation(article);

    this.setEditable(false);
    this.init();
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

  setNotesIntent(_intent) {
    this.textanno.setNotesIntent(_intent);
    this.imageAnno.setNotesIntent(_intent);
  }

  setEditable(_editable) {
    this.textanno.setAnnotatingEnabled(_editable);
    this.imageAnno.setAnnotatingEnabled(_editable);
  }
}