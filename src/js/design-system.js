
import Dropdown from 'bootstrap/js/dist/dropdown';
import { Collapse } from 'bootstrap';

class DesignSystem {
    constructor() {
        // this.handleTheme();
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
            ".dropdown-item[data-theme]",
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
}

new DesignSystem();

