document.addEventListener('DOMContentLoaded', () => {

    // Theme management
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);

    themeToggle?.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    mobileMenuToggle?.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section, .hero');

    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                mainNav.classList.remove('active');
                mobileMenuToggle?.classList.remove('active');
            }
        });
    });

    // Scroll animations with Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe animate-on-scroll elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });

    // Staggered animation for grid items
    function animateGridItems(items, baseDelay = 50) {
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate-in');
            }, index * baseDelay);
        });
    }

    // Initial animation for visible items
    const gridObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const grid = entry.target;
                const items = grid.querySelectorAll('.work-item, .team-member');
                animateGridItems(items);
                gridObserver.unobserve(grid);
            }
        });
    }, { threshold: 0.1 });

    const teamWork = document.getElementById('team-work');
    const teamGrid = document.getElementById('team-members-grid');

    if (teamWork) gridObserver.observe(teamWork);
    if (teamGrid) gridObserver.observe(teamGrid);

    // Search functionality
    const searchInput = document.getElementById('project-search');
    const searchClear = document.getElementById('search-clear');
    const noResults = document.getElementById('no-results');
    const authorSelect = document.getElementById('author-select');
    let searchTimeout;

    function applyAllFilters() {
        const workItems = document.querySelectorAll('.work-item');
        const searchQuery = (searchInput?.value || '').toLowerCase().trim();
        const currentCategoryFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        const currentAuthorFilter = authorSelect?.value || 'all';

        let visibleCount = 0;

        workItems.forEach(item => {
            const title = item.querySelector('.work-title')?.textContent.toLowerCase() || '';
            const description = item.querySelector('.work-description')?.textContent.toLowerCase() || '';
            const authorText = item.querySelector('.work-author')?.textContent.toLowerCase() || '';
            const label = item.getAttribute('data-label')?.toLowerCase() || '';
            const authorId = item.getAttribute('data-author') || '';

            // Check search match
            const matchesSearch = !searchQuery ||
                title.includes(searchQuery) ||
                description.includes(searchQuery) ||
                authorText.includes(searchQuery) ||
                label.includes(searchQuery);

            // Check category filter match
            const matchesCategoryFilter = currentCategoryFilter === 'all' || item.getAttribute('data-label') === currentCategoryFilter;

            // Check author filter match
            const matchesAuthorFilter = currentAuthorFilter === 'all' || authorId === currentAuthorFilter;

            if (matchesSearch && matchesCategoryFilter && matchesAuthorFilter) {
                item.classList.remove('hidden');
                item.classList.add('filtering-in');
                setTimeout(() => {
                    item.classList.remove('filtering-in');
                }, 300);
                visibleCount++;
            } else {
                item.classList.add('hidden');
            }
        });

        // Reset show more state and update UI
        showingAll = false;
        updateShowMoreButton();
        updateNoResults(visibleCount);
    }

    function performSearch(query) {
        applyAllFilters();
    }

    function updateNoResults(visibleCount) {
        if (noResults) {
            if (visibleCount === 0) {
                noResults.classList.add('visible');
            } else {
                noResults.classList.remove('visible');
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;

            // Show/hide clear button
            if (searchClear) {
                searchClear.classList.toggle('visible', query.length > 0);
            }

            // Debounce search
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 150);
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchClear.classList.remove('visible');
                performSearch('');
                searchInput.focus();
            }
        });
    }

    // Author filter functionality
    if (authorSelect) {
        authorSelect.addEventListener('change', () => {
            applyAllFilters();
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-select');

    function sortItems(sortBy) {
        const container = document.getElementById('team-work');
        if (!container) return;

        const items = Array.from(container.querySelectorAll('.work-item'));
        const showMoreContainer = container.querySelector('.show-more-container');

        items.sort((a, b) => {
            const dateA = a.getAttribute('data-date') || '';
            const dateB = b.getAttribute('data-date') || '';
            const titleA = a.querySelector('.work-title')?.textContent.toLowerCase() || '';
            const titleB = b.querySelector('.work-title')?.textContent.toLowerCase() || '';

            switch (sortBy) {
                case 'date-desc':
                    return dateB.localeCompare(dateA);
                case 'date-asc':
                    return dateA.localeCompare(dateB);
                case 'alpha-asc':
                    return titleA.localeCompare(titleB);
                case 'alpha-desc':
                    return titleB.localeCompare(titleA);
                default:
                    return 0;
            }
        });

        // Reorder items with animation
        items.forEach((item, index) => {
            item.classList.add('filtering-out');
        });

        setTimeout(() => {
            items.forEach((item) => {
                container.appendChild(item);
                item.classList.remove('filtering-out');
                item.classList.add('filtering-in');
            });

            // Keep show more container at the end
            if (showMoreContainer) {
                container.appendChild(showMoreContainer);
            }

            // Remove animation class after animation completes
            setTimeout(() => {
                items.forEach(item => {
                    item.classList.remove('filtering-in');
                });
            }, 300);

            // Update visibility
            updateShowMoreButton();
        }, 200);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortItems(e.target.value);
        });
    }

    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const showMoreBtn = document.getElementById('show-more-btn');
    let showingAll = false;

    function updateShowMoreButton() {
        if (!showMoreBtn) return;

        const visibleItems = document.querySelectorAll('.work-item:not(.hidden)');
        let hiddenCount = 0;

        visibleItems.forEach((item, index) => {
            if (index >= 6) {
                if (!showingAll) {
                    item.classList.add('work-item-hidden');
                }
                hiddenCount++;
            } else {
                item.classList.remove('work-item-hidden');
            }
        });

        if (hiddenCount > 0) {
            showMoreBtn.style.display = 'inline-block';
            showMoreBtn.textContent = showingAll ? 'Show less' : `Show ${hiddenCount} more`;
        } else {
            showMoreBtn.style.display = 'none';
        }
    }

    // Show more/less functionality
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            const hiddenItems = document.querySelectorAll('.work-item:not(.hidden).work-item-hidden');

            if (!showingAll) {
                // Show all items with staggered animation
                hiddenItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.remove('work-item-hidden');
                        item.classList.add('filtering-in');
                        setTimeout(() => {
                            item.classList.remove('filtering-in');
                        }, 300);
                    }, index * 50);
                });
                showMoreBtn.textContent = 'Show less';
                showingAll = true;
            } else {
                // Hide extra items
                const visibleItems = document.querySelectorAll('.work-item:not(.hidden)');
                visibleItems.forEach((item, index) => {
                    if (index >= 6) {
                        item.classList.add('work-item-hidden');
                    }
                });
                showMoreBtn.textContent = `Show ${Math.max(0, visibleItems.length - 6)} more`;
                showingAll = false;

                // Scroll to projects section if we're below it
                const projectsSection = document.getElementById('projects');
                if (projectsSection && window.scrollY > projectsSection.offsetTop + 200) {
                    projectsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Apply all filters (search, category, author)
            applyAllFilters();
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

    // Keyboard navigation for filters
    filterButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const next = filterButtons[index + 1] || filterButtons[0];
                next.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = filterButtons[index - 1] || filterButtons[filterButtons.length - 1];
                prev.focus();
            }
        });
    });

});
