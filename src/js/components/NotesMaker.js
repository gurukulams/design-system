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

    const cleanPath = window.location.pathname.replace(/\/+$/, '');
    const annoUrl = `${window.location.origin}${cleanPath}.anno.json`;

    fetch(annoUrl)
      .then(response => {
        if (response.status === 404) {
          console.warn(`.anno file not found (404) at: ${annoUrl}`);
          return null;
        }
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(annotationData => {
        if (!annotationData) return; // Exit if 404

        // Continue working with annotationData...
        console.log("Loaded annotations:", annotationData);

        this.handleInnerTagging(_articleContainer, annotationData);

      })
      .catch(error => {
        console.error("Failed to load annotation data:", error);
      });

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

  
  handleInnerTagging(articleContainer, annotationData) {
    const offcanvasElement = document.getElementById("innerTagOffcanvas");
    const offcanvasTitle = document.getElementById("offcanvasLabel");
    const offcanvasBody = document.getElementById("innerTagOffcanvasBody");


    if (!articleContainer || !offcanvasElement || !offcanvasTitle || !offcanvasBody) {
      return;
    }

    const offcanvasInstance = new Offcanvas(offcanvasElement);
    const article = articleContainer.querySelector("article:not(.side-article)");
    if (!article) return;

    const handleQuestionClick = (event) => {
      const anchor = event.target.closest?.('a[href^="$"]');
      if (!anchor || !event.currentTarget.contains(anchor)) return;

      const targetValue = anchor.getAttribute("href");
      const answerId = targetValue?.slice(1).trim();
      if (!answerId) return;

      event.preventDefault();
      offcanvasTitle.textContent = anchor.textContent.trim();
      offcanvasBody.innerHTML = article.innerHTML ;

      const annoTagId = anchor.getAttribute('href').slice(1);

      // Place the Annotation Here
      const annonation = annotationData[annoTagId];

      const anno = createTextAnnotator(offcanvasBody);
      anno.setAnnotations(annonation);


      offcanvasInstance.show();
    };

    articleContainer.addEventListener("click", handleQuestionClick);
    offcanvasBody.addEventListener("click", handleQuestionClick);
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