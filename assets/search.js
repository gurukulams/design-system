'use strict';

{{ $searchDataFile := printf "%s.search-data.json" .Language.Lang }}
{{ $searchData := resources.Get "search-data.json" | resources.ExecuteAsTemplate $searchDataFile . | resources.Minify | resources.Fingerprint }}
{{ $searchConfig := i18n "bookSearchConfig" | default "{}" }}

(function () {


  // Global elements to keep track of state
  let originalElements = []; 
  let offcanvasBody = null;

  offcanvasBody = document.querySelector('#offcanvasDocsTree .offcanvas-body');
  if (offcanvasBody) {
      // Capture the actual DOM elements, preserving their memory and event listeners
      originalElements = Array.from(offcanvasBody.childNodes);
  }

  const searchDataURL = '{{ partial "docs/links/resource-precache" $searchData }}';
  const indexConfig = Object.assign({{ $searchConfig }}, {
    includeScore: true,
    useExtendedSearch: true,
    fieldNormWeight: 1.5,
    threshold: 0.2,
    ignoreLocation: true,
    keys: [
      {
        name: 'title',
        weight: 0.7
      },
      {
        name: 'content',
        weight: 0.3
      }
    ]
  });

  const input = document.querySelector('#book-search-input');
  const results = document.querySelector('#book-search-results');

  if (!input) {
    return
  }

  input.addEventListener('focus', init);
  input.addEventListener('keyup', search);

  input.addEventListener('input', (event) => {
    // Use trim() to also detect strings that only contain spaces
    if (event.target.value.trim() === "") {
      clear();
    }
  });

  // input.addEventListener('focusout', clear);

  document.addEventListener('keypress', focusSearchFieldOnKeyPress);

  /**
   * @param {Event} event
   */
  function focusSearchFieldOnKeyPress(event) {
    if (event.target.value !== undefined) {
      return;
    }

    if (input === document.activeElement) {
      return;
    }

    const characterPressed = String.fromCharCode(event.charCode);
    if (!isHotkey(characterPressed)) {
      return;
    }

    input.focus();
    event.preventDefault();
  }

  /**
   * @param {String} character
   * @returns {Boolean} 
   */
  function isHotkey(character) {
    const dataHotkeys = input.getAttribute('data-hotkeys') || '';
    return dataHotkeys.indexOf(character) >= 0;
  }

  

  function init() {
    input.removeEventListener('focus', init); // init once
    input.required = true;

    fetch(searchDataURL)
      .then(pages => pages.json())
      .then(pages => {
        window.bookSearchIndex = new Fuse(pages, indexConfig);
      })
      .then(() => input.required = false)
      .then(search);
  }

  function search() {
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }

    if (!input.value) {
      return;
    }

    displayResults(window.bookSearchIndex.search(input.value).slice(0,10));
    
  }

  function displayResults(searchHits) {
    if (!offcanvasBody) return;

    // 1. Clear the offcanvas without destroying the original elements' memory
    offcanvasBody.innerHTML = ''; 

    if (!searchHits || searchHits.length === 0) {
        offcanvasBody.innerHTML = `<div class="text-center text-muted p-4"><p>No results found.</p></div>`;
        return;
    }

    // 2. Build and inject search results
    let resultsContainer = document.createElement('div');
    resultsContainer.className = 'list-group list-group-flush';

    searchHits.forEach(hit => {
        const item = hit.item;
        resultsContainer.innerHTML += `
            <a href="${item.href}" class="list-group-item list-group-item-action py-3">
                <strong class="text-primary d-block">${item.title}</strong>
                <small class="text-muted">${item.section}</small>
            </a>`;
    });

    offcanvasBody.appendChild(resultsContainer);
}

function clear() {
    if (!offcanvasBody || originalElements.length === 0) return;

    // Clear out the search results HTML
    offcanvasBody.innerHTML = '';

    // Re-append the exact same original DOM nodes with their events completely intact
    originalElements.forEach(node => {
        offcanvasBody.appendChild(node);
    });
}

  /**
   * @param {String} content
   * @returns {Node}
   */
  function element(content) {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.firstChild;
  }
})();
