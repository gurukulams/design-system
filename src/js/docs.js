import QuestionLoader from "./components/QuestionLoader";
import NotesMaker from 'notes-js'
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;

class DocsManager {
  constructor() {
    new QuestionLoader();
    const nm = new NotesMaker(document.getElementById("document-article"), (msg) => {
      console.log("NotesMaker Notification:", msg);
    });
    const pencilToggle = document.getElementById("notes-pencil-toggle");
    pencilToggle.addEventListener("change", function () {
      console.log('DDDD');
      nm.setEditable(this.checked);
    });
  }
}

new DocsManager();
