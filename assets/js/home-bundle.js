class HomeScreen {
    constructor() {
      this.STORAGE_KEY = 'selectedtopictags';
      this.tagContainer = document.getElementById('tags-cloud');
      
      if (!this.tagContainer) return;
  
      // Target .col elements within the container next to #tags-cloud
      const topicsContainer = this.tagContainer.nextElementSibling;
      this.cols = topicsContainer ? topicsContainer.querySelectorAll('.col') : document.querySelectorAll('.col');
  
      // Preserve initial count attributes if not present
      this.tagContainer.querySelectorAll('a[data-tag-id]').forEach(anchor => {
        const badge = anchor.querySelector('.badge');
        if (badge && !anchor.hasAttribute('data-count')) {
          anchor.setAttribute('data-count', badge.innerText.trim());
        }
      });
  
      // Bind event listener using class method delegation
      this.tagContainer.addEventListener('click', (event) => this.handleTagClick(event));
  
      // Initialize UI state from storage
      this.syncUI();
    }
  
    // 1. Read stored tags from localStorage
    getSelectedTags() {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
      } catch {
        return [];
      }
    }
  
    // 2. Save tags to localStorage
    setSelectedTags(tags) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tags));
    }
  
    // 3. Update active/inactive UI for a single tag element
    updateTagUI(anchorTag, isActive, count) {
      const badge = anchorTag.querySelector('.badge');
  
      if (isActive) {
        anchorTag.classList.remove('btn-outline-secondary');
        anchorTag.classList.add('btn-primary', 'active-tag');
        badge.classList.remove('bg-secondary');
        badge.classList.add('bg-white', 'text-dark');
        badge.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
        `;
      } else {
        anchorTag.classList.remove('btn-primary', 'active-tag');
        anchorTag.classList.add('btn-outline-secondary');
        badge.classList.remove('bg-white', 'text-dark');
        badge.classList.add('bg-secondary');
        badge.innerText = count;
      }
    }
  
    // 4. Filter the .col elements based on active tags (Case-Insensitive OR matching)
    filterCols(selectedTags) {
      // Normalize selected tags to lowercase for comparison
      const normalizedSelected = selectedTags.map(t => t.trim().toLowerCase());
  
      this.cols.forEach(col => {
        if (normalizedSelected.length === 0) {
          col.style.display = '';
          return;
        }
  
        const rawTags = col.getAttribute('data-tags') || '';
        // Extract, clean, and convert card tags to lowercase
        const colTags = rawTags.toLowerCase().split(/[\s,]+/).filter(Boolean);
  
        // Check if card contains ANY of the selected tags (OR condition)
        const hasMatch = normalizedSelected.some(selected => colTags.includes(selected));
  
        col.style.display = hasMatch ? '' : 'none';
      });
    }
  
    // 5. Synchronize tag UI and filter results
    syncUI() {
      const selectedTags = this.getSelectedTags();
      const tagAnchors = this.tagContainer.querySelectorAll('a[data-tag-id]');
  
      tagAnchors.forEach(anchor => {
        const tagId = anchor.getAttribute('data-tag-id');
        const count = anchor.getAttribute('data-count') || anchor.querySelector('.badge').innerText.trim();
        const isActive = selectedTags.includes(tagId);
  
        this.updateTagUI(anchor, isActive, count);
      });
  
      this.filterCols(selectedTags);
    }
  
    // 6. Handle tag selection clicks
    handleTagClick(event) {
      const anchor = event.target.closest('a[data-tag-id]');
      if (!anchor) return;
  
      event.preventDefault();
  
      const tagId = anchor.getAttribute('data-tag-id');
      let selectedTags = this.getSelectedTags();
  
      if (selectedTags.includes(tagId)) {
        selectedTags = selectedTags.filter(t => t !== tagId);
      } else {
        selectedTags.push(tagId);
      }
  
      this.setSelectedTags(selectedTags);
      this.syncUI();
    }
  }
  
  // Instantiation on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    new HomeScreen();
  });
//# sourceMappingURL=home-bundle.js.map
