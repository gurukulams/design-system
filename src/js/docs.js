import QuestionLoader from "./components/QuestionLoader";
import NotesMaker from "./components/NotesMaker";

class DocsManager {
  constructor() {
    
    new QuestionLoader();

    // Set Focus to the SearchBox When Side Nav Opened
    const offcanvasDocsTree = document.getElementById('offcanvasDocsTree');
    const searchInput = document.getElementById('book-search-input');

    offcanvasDocsTree.addEventListener('shown.bs.offcanvas', function () {
        searchInput.focus();
    });

    const nm = new NotesMaker(document.getElementById("document-article"), (msg) => {
      console.log("NotesMaker Notification:", msg);
    });
    const pencilToggle = document.getElementById("notes-pencil-toggle");
    pencilToggle.addEventListener("change", function () {
      nm.setEditable(this.checked);
      console.log("Editor Enabled " + this.checked);
    });

    

  }
}

new DocsManager();
