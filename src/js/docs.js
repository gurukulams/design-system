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

    const articleEl = document.getElementById("document-article");

    const nm = new NotesMaker(articleEl, (msg) => {
      console.log("NotesMaker Notification:", msg);
    });
    const pencilToggle = document.getElementById("notes-pencil-toggle");
    pencilToggle.addEventListener("change", function () {
      nm.setEditable(this.checked);
      console.log("Editor Enabled " + this.checked);
    });

    this.handleVideos();

    this.handleScrolling(articleEl,
        document.getElementById("document-article-toc"));

  }

  handleVideos() {
    document.querySelectorAll('[data-action="play-video"]').forEach(trigger => {
      trigger.addEventListener('click', function (e) {
          e.preventDefault();
          // CRITICAL FIX: Stop the click event from bubbling up to the parent figure element
          e.stopPropagation();
          
          const videoType = this.getAttribute('data-video-type') || 'youtube';
          const videoTitle = this.getAttribute('data-video-title') || 'Watch Video';
          
          // Determine player markup based on video type
          let playerHtml = '';
          
          if (videoType === 'custom') {
              const videoUrl = this.getAttribute('data-video-url');
              playerHtml = `
                  <video src="${videoUrl}" 
                         controls 
                         autoplay 
                         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain;">
                      Your browser does not support the video tag.
                  </video>
              `;
          } else {
              const videoId = this.getAttribute('data-youtube-id');
              playerHtml = `
                  <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                          title="YouTube video player" 
                          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                          frameborder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowfullscreen>
                  </iframe>
              `;
          }
          
          // 1. Create a high z-index fullscreen overlay container
          const overlay = document.createElement('div');
          overlay.id = 'videoOverlay';
          overlay.className = 'd-flex align-items-center justify-content-center p-3';
          overlay.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0, 0, 0, 0.85);
              z-index: 99999;
          `;
          
          // 2. Inject the custom Bootstrap Card layout right into the overlay
          overlay.innerHTML = `
              <div class="card bg-dark text-white shadow-lg w-100" style="max-width: 850px; border: 1px solid #333;">
                  <div class="card-header d-flex align-items-center justify-content-between border-secondary py-3">
                      <h5 class="card-title mb-0 fw-bold">${videoTitle}</h5>
                      <button type="button" class="btn-close btn-close-white" id="closeVideoBtn" aria-label="Close"></button>
                  </div>
                  <div class="card-body p-3 bg-black">
                      <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; overflow: hidden; border-radius: 4px;">
                          ${playerHtml}
                      </div>
                  </div>
              </div>
          `;
          
          // Append the fresh overlay element directly to the body
          document.body.appendChild(overlay);
          
          // Prevent background page body from scrolling while looking at the video
          document.body.style.overflow = 'hidden';
  
          // Define escape key tracker FIRST so removePlayer can access it safely
          const handleEscape = (event) => {
              if (event.key === 'Escape') {
                  removePlayer();
              }
          };
  
          // Function to safely destroy the player view
          const removePlayer = () => {
              // If it's a custom video element, pause it manually before removal to prevent phantom audio bugs in some browsers
              const customVideo = overlay.querySelector('video');
              if (customVideo) {
                  customVideo.pause();
                  customVideo.src = "";
                  customVideo.load();
              }
              
              overlay.remove();
              document.body.style.overflow = '';
              document.removeEventListener('keydown', handleEscape);
          };
  
          // Close handling on the 'X' click
          overlay.querySelector('#closeVideoBtn').addEventListener('click', removePlayer);
  
          // Close handling if they click anywhere on the dark overlay background space
          overlay.addEventListener('click', function (event) {
              if (event.target === overlay) {
                  removePlayer();
              }
          });
  
          // Register the escape key listener
          document.addEventListener('keydown', handleEscape);
      });
    });
  }

  handleScrolling(articleEl, asideEl) {
    // A flag to keep track of whether a sidebar click is currently driving the scroll position
    this.isClickScrolling = false;
    this.clickTimeout = null;

    if (window.location.hash) {
        this.setActiveHeading(asideEl, window.location.hash);
    }

    const headings = articleEl.querySelectorAll('h1, h2, h3');
  
    const options = {
      rootMargin: '0px 0px -75% 0px',
      threshold: 0
    };
  
    const observer = new IntersectionObserver((entries) => {
      // FIX 1: If we are scrolling due to a sidebar click, ignore observer triggers entirely!
      if (this.isClickScrolling) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
  
          if (id && window.location.hash !== `#${id}`) {
            history.replaceState(null, null, `#${id}`);
            this.setActiveHeading(asideEl, id);
          }
        }
      });
    }, options);
  
    headings.forEach((heading) => observer.observe(heading));

    const setActiveAnchor = (link) => {
      link.addEventListener("click", () => {
        const hashValue = link.hash || link.getAttribute('href');
        
        console.log("Click " + link.href + " -> Hash: " + hashValue);

        if (hashValue) {
            // FIX 2: Set the flag to true immediately on click to lock out the observer
            this.isClickScrolling = true;
            
            this.setActiveHeading(asideEl, hashValue);

            // FIX 3: Clear any lingering timeouts and reset the flag after the scroll finishes.
            // 500ms is usually the sweet spot for smooth scrolling transitions.
            clearTimeout(this.clickTimeout);
            this.clickTimeout = setTimeout(() => {
                this.isClickScrolling = false;
            }, 500); 
        }
    });
    };

    const asideLinks = asideEl.querySelectorAll('a');

    asideLinks.forEach((link) => {
      setActiveAnchor(link);
    });

    const articleLinks = articleEl.querySelectorAll(
      'h1 a.anchor, h2 a.anchor, h3 a.anchor, h4 a.anchor, h5 a.anchor, h6 a.anchor'
    );
    
    articleLinks.forEach((link) => {
      setActiveAnchor(link);
    });
}

setActiveHeading(asideEl, hashValue) {
    console.log("setActiveHeading " + hashValue);
    if (!asideEl || !hashValue) return;
  
    const cleanHash = `#${hashValue.replace(/^#+/, '')}`;
  
    const currentActive = asideEl.querySelector('a.active');
    if (currentActive) {
      currentActive.classList.remove('active');
    }
  
    const targetLink = asideEl.querySelector(`a[href="${cleanHash}"]`);
    if (targetLink) {
      targetLink.classList.add('active');

      // scrollIntoView moves the link into the scrollable viewport of asideEl
      targetLink.scrollIntoView({
        behavior: 'smooth', // 'smooth' for a pleasant transition, 'auto' for instant jumping
        block: 'nearest',   // Minimizes scrolling; only moves it if it is out of view
        inline: 'nearest'
      });

    }
}
  
}

new DocsManager();
