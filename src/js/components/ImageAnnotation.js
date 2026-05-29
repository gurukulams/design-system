// ImageAnnotation.js

import { createImageAnnotator } from '@annotorious/annotorious';
import OpenSeadragon from 'openseadragon';
import { createOSDAnnotator } from '@annotorious/openseadragon';
import AnnotationPopup from './AnnotationPopup';

export default class ImageAnnotation {
  constructor(_contentRoot) {
    this.contentRoot = _contentRoot;
    this.anno = null;
    this.currentMode = 'rectangle';
    this.currentImageKey = null;
    this.pendingImageSrc = null;
    this.selectedAnnotation = null;
    this.annotatingEnabled = false;
    this.viewerMode = 'standard';
    this.osdViewer = null;

    // Initialize shared popup control
    this.popup = new AnnotationPopup({
      onSave: (annotation, textValue) => this.handleSaveComment(annotation, textValue),
      onDelete: (id) => this.handleDeleteAnnotation(id),
      onCloseMemory: () => this.clearEngineSelection()
    });

    this.init();
  }

  init() {
    this.createOffcanvas();
    this.bindFigures();
  }

  setAnnotatingEnabled(_editable) {
    this.annotatingEnabled = _editable;
    if (this.anno) {
      this.anno.setDrawingEnabled(_editable);
      if (_editable) {
        this.anno.setDrawingTool(this.currentMode);
      } else {
        this.popup.close(true);
      }
    }
    const rectBtn = document.getElementById('anno-rect-btn');
    const polyBtn = document.getElementById('anno-poly-btn');
    if (rectBtn && polyBtn) {
      rectBtn.disabled = !_editable;
      polyBtn.disabled = !_editable;
    }
  }

  bindFigures() {
    this.contentRoot.querySelectorAll('figure').forEach(figure => {
      const img = figure.querySelector('img');
      if (!img) return;
  
      // Original behavior: Double click anywhere on the figure opens the image
      figure.addEventListener('dblclick', () => {
        this.openImage(img, figure);
      });
  
      // New behavior: Clicking the specific zoom icon opens the image
      const zoomIcon = figure.querySelector('[data-action="zoom-image"]');
      if (zoomIcon) {
        zoomIcon.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering any parent click events
          this.openImage(img, figure);
        });
      }
    });
  }

  createOffcanvas() {
    if (document.getElementById('imageAnnotationCanvas')) return;

    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <div class="offcanvas offcanvas-end border-0" 
           tabindex="-1" 
           id="imageAnnotationCanvas" 
           style="width:100vw; visibility: hidden; display: block; transition: transform .3s ease-in-out;">
     
        <div class="offcanvas-header border-bottom border-secondary" style="height: 60px;">
            <h5 id="annotation-title" class="mb-0">Image Annotation</h5>
            <div class="d-flex align-items-center ms-auto gap-2">
                <select id="viewer-mode-select" class="form-select form-select-sm" style="width:auto;">
                    <option value="standard">Standard</option>
                    <option value="deepzoom">Deep Zoom</option>
                </select>
                <div class="btn-group btn-group-sm">
                    <button id="anno-rect-btn" class="btn btn-outline-primary active">
                        <i class="bi bi-square me-1"></i> Rectangle
                    </button>
                    <button id="anno-poly-btn" class="btn btn-outline-primary">
                        <i class="bi bi-pentagon me-1"></i> Polygon
                    </button>
                </div>
            </div>
            <button type="button" id="anno-close-canvas-btn" class="btn-close ms-3" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body p-0 position-relative overflow-hidden" style="height: calc(100vh - 60px); width: 100vw;">
            <div class="d-flex align-items-center justify-content-center w-100 h-100">
                <img id="annotation-image" class="img-fluid" style="max-height: 100%; max-width: 100%; object-fit: contain; display: block;" />
                <div id="annotation-viewer" style="display:none; width:100%; height:100%; min-height: 100%; background: #000;"></div>
            </div>
        </div>
      </div>
      `
    );

    this.canvasEl = document.getElementById('imageAnnotationCanvas');
    this.imageEl = document.getElementById('annotation-image');
    this.viewerEl = document.getElementById('annotation-viewer');

    document.getElementById('anno-close-canvas-btn').addEventListener('click', () => this.closeImage());
    document.getElementById('anno-rect-btn').addEventListener('click', () => this.setMode('rectangle'));
    document.getElementById('anno-poly-btn').addEventListener('click', () => this.setMode('polygon'));
    document.getElementById('viewer-mode-select').addEventListener('change', e => this.setViewerMode(e.target.value));
  }

  setViewerMode(mode) {
    if (this.viewerMode === mode) return;
    this.viewerMode = mode;
    this.popup.close(true);
    this.initAnnotator();
  }

  openImage(img, figure) {
    this.currentImageKey = this.relativePath(img.src);
    this.pendingImageSrc = img.src;

    const caption = figure.querySelector('figcaption');
    document.getElementById('annotation-title').textContent = caption ? caption.textContent.trim() : 'Image Annotation';

    this.canvasEl.style.visibility = 'visible';
    this.canvasEl.classList.add('show');

    if (this.pendingImageSrc) {
      this.imageEl.src = this.pendingImageSrc;
    }

    setTimeout(() => {
      this.initAnnotator();
      this.pendingImageSrc = null;
    }, 320);
  }

  closeImage() {
    this.canvasEl.classList.remove('show');
    this.popup.close(true);
    setTimeout(() => {
      this.canvasEl.style.visibility = 'hidden';
      if (this.anno) { this.anno.destroy(); this.anno = null; }
      if (this.osdViewer) { this.osdViewer.destroy(); this.osdViewer = null; }
    }, 300);
  }

  initAnnotator() {
    if (this.anno) { this.anno.destroy(); this.anno = null; }
    if (this.osdViewer) { this.osdViewer.destroy(); this.osdViewer = null; }

    const imageSrc = this.pendingImageSrc || this.imageEl.src;

    if (this.viewerMode === 'deepzoom') {
      this.imageEl.style.display = 'none';
      this.viewerEl.style.display = 'block';

      this.osdViewer = OpenSeadragon({
        element: this.viewerEl,
        prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
        tileSources: { type: 'image', url: imageSrc },
        showNavigator: true,
        visibilityRatio: 1.0,
        constrainDuringPan: true
      });

      this.anno = createOSDAnnotator(this.osdViewer);
    } else {
      this.viewerEl.style.display = 'none';
      this.imageEl.style.display = 'block';

      this.anno = createImageAnnotator(this.imageEl, {
        drawingEnabled: this.annotatingEnabled
      });
    }

    this.anno.setDrawingTool(this.currentMode);
    this.setAnnotatingEnabled(this.annotatingEnabled);
    this.loadAnnotations();

    this.anno.on('createAnnotation', (annotation) => {
      this.saveAnnotations();
      this.positionAndOpenPopup(annotation, true);
    });
    
    this.anno.on('updateAnnotation', () => this.saveAnnotations());
    this.anno.on('deleteAnnotation', () => this.saveAnnotations());

    this.anno.on('selectionChanged', selected => {
      if (selected?.length > 0) {
        this.selectedAnnotation = selected[0];
        this.positionAndOpenPopup(this.selectedAnnotation, false);
      } else {
        this.selectedAnnotation = null;
        this.popup.close(false);
      }
    });
  }

  positionAndOpenPopup(annotation, isDraft = false) {
    let rect = null;

    if (this.viewerMode === 'deepzoom' && this.osdViewer) {
      const bounds = annotation.target?.selector?.geometry?.bounds;
      if (bounds) {
        const imagePoint = new OpenSeadragon.Point(
          bounds.minX + (bounds.maxX - bounds.minX) / 2, 
          bounds.minY
        );
        const viewportPoint = this.osdViewer.viewport.imageToViewportElementByPixels(imagePoint);
        rect = { top: viewportPoint.y, left: viewportPoint.x, width: 0 };
      }
    } else {
      const element = this.canvasEl.querySelector(`[data-id="${annotation.id}"]`);
      if (element) {
        rect = element.getBoundingClientRect();
      }
    }

    if (!rect) {
      rect = { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0 };
    }

    this.popup.open({
      annotation,
      rect,
      isDraft,
      editable: this.annotatingEnabled,
      usePageScroll: false // OpenSeadragon & Offcanvas use fixed containers
    });
  }

  handleSaveComment(annotation, textValue) {
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

  clearEngineSelection() {
    if (this.anno && this.anno.setSelected) {
      this.anno.setSelected(null);
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (this.anno) this.anno.setDrawingTool(mode);
    document.getElementById('anno-rect-btn').classList.toggle('active', mode === 'rectangle');
    document.getElementById('anno-poly-btn').classList.toggle('active', mode === 'polygon');
  }

  storageKey() { return `image-annotations:${this.currentImageKey}`; }
  saveAnnotations() { if (this.anno) localStorage.setItem(this.storageKey(), JSON.stringify(this.anno.getAnnotations())); }
  loadAnnotations() {
    const saved = localStorage.getItem(this.storageKey());
    if (!saved || !this.anno) return;
    try { this.anno.setAnnotations(JSON.parse(saved)); } catch(e) { console.warn('Invalid saved annotations', e); }
  }
  relativePath(url) { return new URL(url, window.location.origin).pathname; }
  destroy() { this.popup.close(true); if (this.anno) this.anno.destroy(); if (this.osdViewer) this.osdViewer.destroy(); }
}