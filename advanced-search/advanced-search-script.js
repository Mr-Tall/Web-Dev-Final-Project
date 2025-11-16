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