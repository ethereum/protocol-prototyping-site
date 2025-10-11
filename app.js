document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');
    const showMoreBtn = document.getElementById('show-more-btn');
    let showingAll = false;
    
    // Show more/less functionality
    if (showMoreBtn) {
        const hiddenItems = document.querySelectorAll('.work-item-hidden');
        const hiddenCount = hiddenItems.length;
        
        showMoreBtn.addEventListener('click', () => {
            if (!showingAll) {
                // Show all items
                hiddenItems.forEach(item => {
                    item.classList.remove('work-item-hidden');
                });
                showMoreBtn.textContent = 'Show less';
                showingAll = true;
            } else {
                // Hide extra items
                hiddenItems.forEach(item => {
                    item.classList.add('work-item-hidden');
                });
                showMoreBtn.textContent = `Show ${hiddenCount} more`;
                showingAll = false;
            }
        });
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter work items
            let visibleCount = 0;
            workItems.forEach((item, index) => {
                const matchesFilter = filter === 'all' || item.getAttribute('data-label') === filter;
                
                if (matchesFilter) {
                    item.classList.remove('hidden');
                    visibleCount++;
                    
                    // Apply show more logic
                    if (!showingAll && index >= 6) {
                        item.classList.add('work-item-hidden');
                    } else {
                        item.classList.remove('work-item-hidden');
                    }
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // Update show more button
            if (showMoreBtn) {
                const hiddenCount = document.querySelectorAll('.work-item:not(.hidden).work-item-hidden').length;
                if (hiddenCount > 0) {
                    showMoreBtn.style.display = 'inline-block';
                    showMoreBtn.textContent = showingAll ? 'Show less' : `Show ${hiddenCount} more`;
                } else {
                    showMoreBtn.style.display = 'none';
                }
            }
        });
    });
    
    // Set last updated date
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
        lastUpdated.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
});