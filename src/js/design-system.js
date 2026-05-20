import Dropdown from "bootstrap/js/dist/dropdown";
import Collapse from "bootstrap/js/dist/collapse";
import Offcanvas from "bootstrap/js/dist/offcanvas";

// // Optional: Manual initialization if you want to trigger it via JS
// document.addEventListener('DOMContentLoaded', () => {
//     const offcanvasElementList = document.querySelectorAll('.offcanvas');
//     const offcanvasList = [...offcanvasElementList].map(offcanvasEl => new Offcanvas(offcanvasEl));
// });

class DesignSystem {
  constructor() {
    this.handleTheme();
    this.handleSecurity();
    this.handleCodeBlocks();
  }

  handleTheme() {
    const theme = localStorage.getItem("theme");
    const themeDropdownButton = document.getElementById("themeDropdown");
    const icons = {
      light: "sun-fill",
      dark: "moon-stars-fill",
      auto: "circle-half",
    };

    if (theme) {
      const setTheme = (theme) => {
        document.documentElement.setAttribute("data-bs-theme", theme);
        themeDropdownButton.innerHTML = `<svg class="bi my-1 theme-icon-active" width="1em" height="1em"><use href="#${icons[theme]}"></use></svg>`;
        localStorage.setItem("theme", theme);
      };

      setTheme(theme);

      const themeDropdownItems = document.querySelectorAll(
        ".dropdown-item[data-theme]"
      );

      themeDropdownItems.forEach((item) => {
        item.addEventListener("click", function (event) {
          event.preventDefault();
          const selectedTheme = this.getAttribute("data-theme");
          setTheme(selectedTheme);
        });
      });
    } else {
      localStorage.setItem("theme", "auto");
    }
  }

  handleSecurity() {
    const loginsBtn = document.getElementById("login-btn");
    // If User is Logged in
    if (sessionStorage.auth) {
      const userAuth = JSON.parse(sessionStorage.auth);

      if (loginsBtn) {
        // 3. Generate the dynamic HTML layout using values from userAuth
        const dropdownHtml = `
          <div class="d-flex bd-highlight">
            <!-- Wrap the trigger and menu inside a relative dropdown container -->
            <div class="dropdown">
              <a id="userBtn" class="me-1 dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" role="button">
                <div id="userMenu" class="flex-shrink-1 bd-highlight d-inline-block">
                  <img src="${userAuth.profilePicture}" 
                      class="img-circle img-thumbnail avatar" 
                      style="vertical-align:middle;border-radius:50%;width:3rem" 
                      alt="${userAuth.displayName}'s avatar">
                </div>
              </a>
              
              <ul class="dropdown-menu" aria-labelledby="userBtn">
                <li><span class="dropdown-item-text fw-bold">Hi, ${userAuth.displayName}</span></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="/profile">Profile</a></li>
                <li><a id="logoutBtn" class="dropdown-item" href="javascript://">Logout</a></li>
              </ul>
            </div>
          </div>
        `;

        // 4. Create a temporary container wrapper to turn the string into an actual DOM node
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = dropdownHtml.trim();
        const newDropdownNode = tempContainer.firstElementChild;

        // 5. Swap out the old #login-btn element entirely
        loginsBtn.replaceWith(newDropdownNode);

        // 6. Optional: Wire up the logout action immediately
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            delete sessionStorage.auth;
            window.location.reload();
            fetch(`/api/auth/logout`, {
              method: "POST",
              headers: window.ApplicationHeader(),
            }).then((response) => {
              if (response.status === 200) {
                delete sessionStorage.auth;
                window.location.reload();
              }
            });
          });
        }
      }
    } else {
        loginsBtn.addEventListener("click", () => {
          sessionStorage.setItem("ref_page", window.location.href);
          window.location.href = loginsBtn.dataset.href;
        });
    }
  }

  handleCodeBlocks() {


      // Target all Hugo-generated highlight code blocks
      const codeBlocks = document.querySelectorAll('.highlight');
    
      codeBlocks.forEach((container) => {
        // 1. Find the actual code element inside
        const codeElement = container.querySelector('pre code') || container.querySelector('pre');
        if (!codeElement) return;
    
        // 2. Detect the coding language automatically from Hugo classes
        let lang = 'Code';
        const classes = codeElement.className.split(' ');
        for (const cls of classes) {
          if (cls.startsWith('language-')) {
            lang = cls.replace('language-', '');
            break;
          }
        }
        // Fallback: Check if Hugo added a data attribute
        if (lang === 'Code' && codeElement.getAttribute('data-lang')) {
          lang = codeElement.getAttribute('data-lang');
        }
    
        // 3. Create the Header Container Row
        const headerBar = document.createElement('div');
        headerBar.className = 'code-header';
    
        // 4. Create the Language Text Label (Left side)
        const langLabel = document.createElement('span');
        langLabel.className = 'code-lang-label';
        langLabel.innerText = lang === 'js' ? 'javascript' : lang; // Optional pretty conversion
    
        // 5. Create the Copy Button (Right side)
        const button = document.createElement('button');
        button.className = 'btn btn-sm btn-outline-light copy-code-button';
        button.type = 'button';
        button.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
    
        // 6. Build the header row structure
        headerBar.appendChild(langLabel);
        headerBar.appendChild(button);
    
        // 7. Inject the entire header banner layout at the top of the .highlight box
        container.insertBefore(headerBar, container.firstChild);
    
        // 8. Clipboard handling logic
        button.addEventListener('click', async () => {
          const rawText = codeElement.innerText;
    
          try {
            await navigator.clipboard.writeText(rawText);
            
            button.innerHTML = '<i class="bi bi-check-lg text-success"></i> Copied!';
            button.classList.replace('btn-outline-light', 'btn-light');
            
            setTimeout(() => {
              button.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
              button.classList.replace('btn-light', 'btn-outline-light');
            }, 2000);
            
          } catch (err) {
            console.error('Failed to copy text: ', err);
            button.innerText = 'Error';
          }
        });
      });

  }
  
}

new DesignSystem();
