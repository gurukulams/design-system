// ImageAnnotation.js

import { createImageAnnotator } from '@annotorious/annotorious';
import OpenSeadragon from 'openseadragon';
import { createOSDAnnotator } from '@annotorious/openseadragon';

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
      }
    }
  
    const rectBtn = document.getElementById('anno-rect-btn');
    const polyBtn = document.getElementById('anno-poly-btn');
    const deleteBtn = document.getElementById('anno-delete-btn');
  
    rectBtn.disabled = !_editable;
    polyBtn.disabled = !_editable;
  
    deleteBtn.disabled = !_editable || !this.selectedAnnotation;
  }

  bindFigures() {
    this.contentRoot.querySelectorAll('figure').forEach(figure => {
      figure.addEventListener('dblclick', () => {
        const img = figure.querySelector('img');
        if (!img) return;

        this.openImage(img, figure);
      });
    });
  }

  createOffcanvas() {
    if (document.getElementById('imageAnnotationCanvas')) {
      return;
    }

    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <div class="offcanvas offcanvas-end border-0" 
           tabindex="-1" 
           id="imageAnnotationCanvas" 
           style="width:100vw; visibility: hidden; display: block; transition: transform .3s ease-in-out;">
     
        <div class="offcanvas-header border-bottom border-secondary" style="height: 60px;">
            <h5 id="annotation-title" class="mb-0">Image Annotation</h5>

            <div class="d-flex align-items-center ms-auto me-3 gap-2">
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
                    <button id="anno-delete-btn" class="btn btn-outline-danger" disabled>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>

            <button type="button" id="anno-close-canvas-btn" class="btn-close" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body p-0 position-relative overflow-hidden" style="height: calc(100vh - 60px); width: 100vw;">
            <div class="d-flex align-items-center justify-content-center w-100 h-100">
                <img id="annotation-image" 
                     class="img-fluid" 
                     style="max-height: 100%; max-width: 100%; object-fit: contain; display: block;" />

                <div id="annotation-viewer" 
                     style="display:none; width:100%; height:100%; min-height: 100%; background: #000;">
                </div>
            </div>
        </div>
      </div>
      `
    );

    this.canvasEl = document.getElementById('imageAnnotationCanvas');
    this.imageEl = document.getElementById('annotation-image');
    this.viewerEl = document.getElementById('annotation-viewer');

    document.getElementById('anno-close-canvas-btn').addEventListener('click', () => {
      this.closeImage();
    });

    document.getElementById('anno-rect-btn').addEventListener('click', () => this.setMode('rectangle'));
    document.getElementById('anno-poly-btn').addEventListener('click', () => this.setMode('polygon'));
    document.getElementById('anno-delete-btn').addEventListener('click', () => this.deleteSelected());
    document.getElementById('viewer-mode-select').addEventListener('change', e => this.setViewerMode(e.target.value));
  }

  setViewerMode(mode) {
    if (this.viewerMode === mode) return;
    this.viewerMode = mode;
    this.initAnnotator();
  }

  openImage(img, figure) {
    this.currentImageKey = this.relativePath(img.src);
    this.pendingImageSrc = img.src;

    const caption = figure.querySelector('figcaption');
    document.getElementById('annotation-title').textContent = caption ? caption.textContent.trim() : 'Image Annotation';

    // 1. Reveal container framework instantly
    this.canvasEl.style.visibility = 'visible';
    this.canvasEl.classList.add('show');

    // 2. Assign standard container fallback element 
    if (this.pendingImageSrc) {
      this.imageEl.src = this.pendingImageSrc;
    }

    // --- FIX: DELAY MOUNT UNTIL SLIDE TRANSITION IS 100% COMPLETE ---
    // The panel slides out using a 300ms transition. We wait 320ms to ensure 
    // width calculations have locked securely at full viewport resolution.
    setTimeout(() => {
      this.initAnnotator();
      this.pendingImageSrc = null;
    }, 320);
  }

  closeImage() {
    this.canvasEl.classList.remove('show');
    setTimeout(() => {
      this.canvasEl.style.visibility = 'hidden';
      
      // Clean up viewer on close to free memory strings
      if (this.anno) { this.anno.destroy(); this.anno = null; }
      if (this.osdViewer) { this.osdViewer.destroy(); this.osdViewer = null; }
    }, 300);
  }

  initAnnotator() {
    if (this.anno) {
      this.anno.destroy();
      this.anno = null;
    }

    if (this.osdViewer) {
      this.osdViewer.destroy();
      this.osdViewer = null;
    }

    const imageSrc = this.pendingImageSrc || this.imageEl.src;

    if (this.viewerMode === 'deepzoom') {
      this.imageEl.style.display = 'none';
      this.viewerEl.style.display = 'block';

      // Initialize OpenSeadragon with strict container layout bindings
      this.osdViewer = OpenSeadragon({
        element: this.viewerEl,
        prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
        tileSources: {
          type: 'image',
          url: imageSrc
        },
        showNavigator: true,
        visibilityRatio: 1.0,
        constrainDuringPan: true
      });

      this.anno = createOSDAnnotator(this.osdViewer);
    } else {
      this.viewerEl.style.display = 'none';
      this.imageEl.style.display = 'block';

      this.anno = createImageAnnotator(this.imageEl, {
        drawingEnabled: true
      });
    }

    this.anno.setDrawingTool(this.currentMode);
    this.setAnnotatingEnabled(this.annotatingEnabled);
    this.loadAnnotations();

    // Attach life-cycle methods safely
    this.anno.on('createAnnotation', () => this.saveAnnotations());
    this.anno.on('updateAnnotation', () => this.saveAnnotations());
    this.anno.on('deleteAnnotation', () => this.saveAnnotations());

    this.anno.on('selectionChanged', selected => {
      if (selected?.length > 0) {
        this.selectedAnnotation = selected[0];
        document.getElementById('anno-delete-btn').disabled = !this.annotatingEnabled;
      } else {
        this.selectedAnnotation = null;
        document.getElementById('anno-delete-btn').disabled = true;
      }
    });
  }

  deleteSelected() {
    if (!this.selectedAnnotation || !this.anno) return;
    this.anno.removeAnnotation(this.selectedAnnotation.id);
    this.selectedAnnotation = null;
    document.getElementById('anno-delete-btn').disabled = true;
    this.saveAnnotations();
  }

  setMode(mode) {
    this.currentMode = mode;
    if (this.anno) {
      this.anno.setDrawingTool(mode);
    }

    document.getElementById('anno-rect-btn').classList.toggle('active', mode === 'rectangle');
    document.getElementById('anno-poly-btn').classList.toggle('active', mode === 'polygon');
  }

  storageKey() {
    return `image-annotations:${this.currentImageKey}`;
  }

  saveAnnotations() {
    if (!this.anno) return;
    localStorage.setItem(this.storageKey(), JSON.stringify(this.anno.getAnnotations()));
  }

  loadAnnotations() {
    const saved = localStorage.getItem(this.storageKey());
    if (!saved || !this.anno) return;
    try {
      this.anno.setAnnotations(JSON.parse(saved));
    } catch(e) {
      console.warn('Invalid saved annotations', e);
    }
  }

  relativePath(url) {
    return new URL(url, window.location.origin).pathname;
  }

  destroy() {
    if (this.anno) this.anno.destroy();
    if (this.osdViewer) this.osdViewer.destroy();
  }
}