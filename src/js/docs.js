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
          
          const videoId = this.getAttribute('data-video-id');
          const videoTitle = this.getAttribute('data-video-title');
          
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
                          <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                                  title="YouTube video player" 
                                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                                  frameborder="0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                  allowfullscreen>
                          </iframe>
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
    const headings = Array.from(articleEl.querySelectorAll('h1, h2, h3'));
    if (headings.length === 0) return; // Exit if no headings exist
    
    // Helper function to update the active class in the sidebar
    const updateSidebarActiveState = (targetId) => {
      if (!targetId) return;
  
      const currentActive = asideEl.querySelector('a.active');
      if (currentActive) {
        currentActive.classList.remove('active');
      }
  
      const matchingLink = asideEl.querySelector(`a[href="#${targetId}"]`);
      if (matchingLink) {
        matchingLink.classList.add('active');
      }
    };
  
    // --- REQUIREMENT 2: Handle Page Load ---
    if (window.location.hash) {
      const cleanHash = window.location.hash.replace('#', '');
      updateSidebarActiveState(cleanHash);
    }
  
    // --- REQUIREMENT 1: Handle Active State on Scroll ---
    const options = {
      // Triggers when heading is in the top 30% of the viewport
      rootMargin: '-0px 0px -70% 0px', 
      threshold: 0
    };
  
    const observer = new IntersectionObserver((entries) => {
      // Only update via observer if we are NOT at the very bottom of the page
      const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 5;
      if (isAtBottom) return;
  
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id) {
            if (window.location.hash !== `#${id}`) {
              history.replaceState(null, null, `#${id}`);
            }
            updateSidebarActiveState(id);
          }
        }
      });
    }, options);
  
    headings.forEach((heading) => observer.observe(heading));
  
    // --- FIX: Bottom of Page Catch ---
    window.addEventListener('scroll', () => {
      // Check if user has scrolled to the absolute bottom of the window
      // (We subtract 5 pixels as a safety buffer for minor browser rounding errors)
      const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 5;
      
      if (isAtBottom) {
        // Grab the very last heading in the article
        const lastHeading = headings[headings.length - 1];
        if (lastHeading && lastHeading.id) {
          if (window.location.hash !== `#${lastHeading.id}`) {
            history.replaceState(null, null, `#${lastHeading.id}`);
          }
          updateSidebarActiveState(lastHeading.id);
        }
      }
    });
  }
}

new DocsManager();
