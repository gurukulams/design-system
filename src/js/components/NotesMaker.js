import "@recogito/text-annotator/text-annotator.css";
import { createTextAnnotator } from "@recogito/text-annotator";

import TextAnnotation from './TextAnnotation'

export default class NotesMaker {

  constructor(_contentRoot, _notiFyFn) {
    console.log("Taking Notes");

    this.textanno = new TextAnnotation(_contentRoot)
    

    this.setEditable(false);
  }

  setEditable(_editable) {
    this.textanno.setAnnotatingEnabled(_editable)
    
  }

}


