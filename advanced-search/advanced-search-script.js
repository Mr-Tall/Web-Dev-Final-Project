function initializeFilters() {
    const filterHeaders = document.querySelectorAll('.filter-header');
    
    filterHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('data-expanded') === 'true';
            const targetId = header.getAttribute('data-target');
            const filterContent = document.getElementById(targetId);
            
            if (filterContent) {
                if (isExpanded) {
                    header.setAttribute('data-expanded', 'false');
                    filterContent.hidden = true;
                } else {
                    header.setAttribute('data-expanded', 'true');
                    filterContent.hidden = false;
                }
            }
        });
    });
}

function initializeSearch() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('search-input');
    const dropdownButton = document.querySelector('.dropdown-button');
    
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                performSearch(searchTerm);
            }
        });
    }
    
    // Dropdown functionality (basic - can be expanded)
    if (dropdownButton) {
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Could add dropdown menu here
            console.log('Search category dropdown clicked');
        });
    }
}