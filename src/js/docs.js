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

  handleScrolling(articleEl,asideEl) {

    // Check for an initial hash on page load and highlight it
    if (window.location.hash) {
        this.setActiveHeading(asideEl, window.location.hash);
    }

    // 1. Grab all the headings within the article that have an ID
    const headings = articleEl.querySelectorAll('h1, h2, h3');
  
    // 2. Configure the observer options
    const options = {
      // Treat the top section of the viewport as the "active detection zone"
      rootMargin: '0px 0px -75% 0px',
      threshold: 0
    };
  
    // 3. Define what happens when a heading enters the zone
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Check if the heading has crossed into our active top zone
        if (entry.isIntersecting) {
          const id = entry.target.id;
  
          // Only update if the heading has an ID and it's different from the current hash
          if (id && window.location.hash !== `#${id}`) {
            // Updates the URL string without jumping the screen or breaking browser history
            history.replaceState(null, null, `#${id}`);
            this.setActiveHeading(asideEl, id)
          }
        }
      });
    }, options);
  
    // 4. Start tracking every heading
    headings.forEach((heading) => observer.observe(heading));

    // 1. Select all anchor tags inside the aside that have an href starting with '#'
    const asideLinks = asideEl.querySelectorAll('a');

    asideLinks.forEach((link) => {
        link.addEventListener("click", () => {
            // Extract the hash component (e.g., "#my-heading")
            const hashValue = link.hash || link.getAttribute('href');
            
            console.log("Click " + link.href + " -> Hash: " + hashValue);
    
            // Call setActiveHeading with the hash value if it exists
            if (hashValue) {
                this.setActiveHeading(asideEl, hashValue);
            }
        });
    });

  }

  setActiveHeading(asideEl, hashValue) {
    // 1. Return early if inputs are missing
    if (!asideEl || !hashValue) return;
  
    // 2. Ensure hashValue starts with exactly one '#' character
    // (e.g., converts 'my-heading' or '#my-heading' cleanly into '#my-heading')
    const cleanHash = `#${hashValue.replace(/^#+/, '')}`;
  
    // 3. Find and remove 'active' from the currently highlighted link in this sidebar
    const currentActive = asideEl.querySelector('a.active');
    if (currentActive) {
      currentActive.classList.remove('active');
    }
  
    // 4. Find the link matching our hash and add the 'active' class
    const targetLink = asideEl.querySelector(`a[href="${cleanHash}"]`);
    if (targetLink) {
      targetLink.classList.add('active');
    }
  }
  
}

new DocsManager();
