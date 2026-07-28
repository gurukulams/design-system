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

    const articleContainer = document.getElementById("article-container");



    this.handleNotes(articleContainer);
    

    this.handleVideos();

    this.handleScrolling(articleContainer,
        document.getElementById("article-container-toc"));

    this.handleMaths();    

    this.handleSideContent();

  }

  handleSideContent() {
    const dropdown = document.getElementById("fullscreen-translate-dropdown");
    const container = document.getElementById("article-container");
    
    if (!dropdown || !container) return;
  
    // Locate the actual trigger button inside the dropdown container wrapper
    const triggerBtn = dropdown.querySelector("button") || dropdown;
    const toggleIcon = dropdown.querySelector("i.bi");
    dropdown.addEventListener("click", async (e) => {
      // 1. CLOSE TRACKER: If close icon 'X' is active, close the layout split
      if (toggleIcon && toggleIcon.classList.contains("bi-x-lg")) {
        e.preventDefault();
        e.stopPropagation();
        container.classList.remove("split-active");
        toggleIcon.classList.remove("bi-x-lg");
        toggleIcon.classList.add("bi-translate");
        return;
      }
    
      // 2. OPEN TRACKER: Intercept click on language link
      const selectedLangItem = e.target.closest(".dropdown-item");
      if (!selectedLangItem) return;
    
      e.preventDefault(); // Stop standard page navigation
    
      const targetUrl = selectedLangItem.getAttribute("href");
      const languageName = selectedLangItem.textContent.trim();
      const sideArticle = container.querySelector(".side-article");
    
      if (!sideArticle || !targetUrl) return;
    
      // Render temporary Bootstrap spinner loading UI
      sideArticle.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-muted">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p>Loading ${languageName} translation...</p>
        </div>
      `;
    
      // Turn on CSS splits and change button icons
      container.classList.add("split-active");
      if (toggleIcon) {
        toggleIcon.classList.remove("bi-translate");
        toggleIcon.classList.add("bi-x-lg"); 
      }
    
      // Engage browser native fullscreen layout
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        container.requestFullscreen?.() || container.webkitRequestFullscreen?.();
      }
    
      // 3. THE LIVE ASYNC FETCH & INJECTION
      try {
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error("Network response failed.");
    
        const htmlString = await response.text();
        
        // Parse the retrieved text string into an actionable DOM document object
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");
        
        // Extract the exact core target node from the foreign translation page
        const remoteMainContent = doc.querySelector(".main-content-panel") || doc.querySelector("article");
    
        if (remoteMainContent) {
          sideArticle.innerHTML = remoteMainContent.innerHTML;
          this.handleMaths();    
        } else {
          sideArticle.innerHTML = `<div class="alert alert-warning m-3">Could not locate main article container on fetched page.</div>`;
        }
      } catch (error) {
        console.error("Translation Fetch Error:", error);
        sideArticle.innerHTML = `<div class="alert alert-danger m-3">Failed to load translation data.</div>`;
      }
    });
    // Helper function to force reset UI elements back to standard defaults
    const resetUIElements = () => {
      container.classList.remove("split-active");
      if (toggleIcon) {
        toggleIcon.classList.remove("bi-x-lg");
        toggleIcon.classList.add("bi-translate");
      }
    };
  
    // Cleanup: If the user presses 'ESC' to exit fullscreen completely, reset the layout state
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        resetUIElements();
      }
    });
    
    document.addEventListener("webkitfullscreenchange", () => {
      if (!document.webkitFullscreenElement) {
        resetUIElements();
      }
    });
  }

  handleMaths() {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '\\[', right: '\\]', display: true},   // block
        {left: '$$', right: '$$', display: true},     // block
        {left: '\\(', right: '\\)', display: false},  // inline
        {left: '$', right: '$', display: false},     // inline
      ],
      throwOnError : false
    });
  }

  handleNotes(articleContainer) {
    const nm = new NotesMaker(articleContainer, (msg) => {
      console.log("NotesMaker Notification:", msg);
    });
    const pencilToggle = document.getElementById("notes-pencil-toggle");
    pencilToggle.addEventListener("change", function () {
      nm.setEditable(this.checked);
      console.log("Editor Enabled " + this.checked);
    });
    const wrapper = document.getElementById('colorPickerDropdownWrapper');
    const menuList = document.getElementById('presetColorsList');
    const inputProxy = document.getElementById('noteLineCmb');
    const toggleCheckbox = document.getElementById('notes-pencil-toggle');
    const menuButton = document.getElementById('colorPickerMenuButton');
    const indicator = wrapper ? wrapper.querySelector('.underline-indicator') : null;
    
    if (!wrapper || !menuList || !inputProxy || !indicator || !toggleCheckbox || !menuButton) return;
  
    // 1. Helper function to extract the real computed color from the element's Bootstrap bg-* class
    function getComputedHexColor(element) {
      // 1. Find the full class name
      const fullClass = Array.from(element.classList).find(c => c.startsWith('bg-'));

      // 2. Remove the "bg-" prefix
      const intent = fullClass ? fullClass.replace('bg-', '') : undefined;
      nm.setNotesIntent(intent)
      const rgb = window.getComputedStyle(element).backgroundColor;
      // Convert standard rgb(r, g, b) strings to pristine Hex strings for consistency
      const rgbValues = rgb.match(/\d+/g);
      if (!rgbValues || rgbValues.length < 3) return rgb; 
      return "#" + rgbValues.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }

    // Fallback to the computed value of the .bg-info swatch if sessionStorage is blank
    const infoSwatch = menuList.querySelector('.bg-info');
    const fallbackColor = infoSwatch ? getComputedHexColor(infoSwatch) : "#0dcaf0";
    const savedColor = sessionStorage.getItem("selectedNotesLine") || fallbackColor;
  
    // 2. Locate matching node by evaluating actual computed styles 
    let initialActive = null;
    const allSwatches = menuList.querySelectorAll('.color-swatch');
    
    for (const swatch of allSwatches) {
      if (getComputedHexColor(swatch) === savedColor) {
        initialActive = swatch;
        break;
      }
    }

    if (initialActive) {
      applySelectedColor(initialActive, false);
    } else {
      indicator.style.backgroundColor = savedColor;
      inputProxy.value = savedColor;
    }
  
    allSwatches.forEach(swatch => {
      swatch.addEventListener('click', function(e) {
        // Removed e.stopPropagation() here to fix the automatic layout close bug
        applySelectedColor(this, true);
      });
    });
  
    function applySelectedColor(element, shouldToggleOn = false) {
      menuList.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      element.classList.add('active');
      
      // 3. Drive color mapping dynamically from browser styles
      const computedHex = getComputedHexColor(element);
      inputProxy.value = computedHex;
      indicator.style.backgroundColor = computedHex;
      
      if (shouldToggleOn && !toggleCheckbox.checked) {
        toggleCheckbox.checked = true;
        toggleCheckbox.dispatchEvent(new Event('change'));
      }
      
      sessionStorage.setItem("selectedNotesLine", computedHex);
      inputProxy.dispatchEvent(new Event('change'));
  
      if (shouldToggleOn) {
        // Fallback method to force drop menu shut across browsers
        if (menuButton.classList.contains('show') || menuButton.getAttribute('aria-expanded') === 'true') {
          menuButton.click();
        }
      }
    }
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

  handleScrolling(articleContainer, asideEl) {
    // A flag to keep track of whether a sidebar click is currently driving the scroll position
    this.isClickScrolling = false;
    this.clickTimeout = null;

    if (window.location.hash) {
        this.setActiveHeading(asideEl, window.location.hash);
    }

    const headings = articleContainer.querySelectorAll('h1, h2, h3');
  
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

    const articleLinks = articleContainer.querySelectorAll(
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
