import QuestionLoader from "./components/QuestionLoader";
// import NotesMaker from 'notes-js'
// import * as bootstrap from 'bootstrap';
// window.bootstrap = bootstrap;

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
    });

    

  }
}

new DocsManager();
