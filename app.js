document.addEventListener('DOMContentLoaded', () => {
    // Ensure page starts at top
    window.scrollTo(0, 0);
    
    // Theme management
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    
    // Scroll indicator functionality
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const projectsSection = document.getElementById('projects');
    
    if (scrollIndicator && projectsSection) {
        scrollIndicator.addEventListener('click', () => {
            projectsSection.scrollIntoView({ behavior: 'smooth' });
        });
        
        // Hide scroll indicator when user scrolls
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }
    
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
    // Delay initial nav update to prevent any scrolling on load
    setTimeout(updateActiveNav, 100);
    
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
    
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');
    const showMoreBtn = document.getElementById('show-more-btn');
    let showingAll = false;
    
    // Show more/less functionality
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            const hiddenItems = document.querySelectorAll('.work-item:not(.hidden).work-item-hidden');
            
            if (!showingAll) {
                // Show all items
                hiddenItems.forEach(item => {
                    item.classList.remove('work-item-hidden');
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
            workItems.forEach(item => {
                const matchesFilter = filter === 'all' || item.getAttribute('data-label') === filter;
                
                if (matchesFilter) {
                    item.classList.remove('hidden');
                    visibleCount++;
                    
                    // Reset show more state when filtering
                    if (visibleCount <= 6) {
                        item.classList.remove('work-item-hidden');
                    } else {
                        item.classList.add('work-item-hidden');
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
                    showMoreBtn.textContent = `Show ${hiddenCount} more`;
                    showingAll = false;
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
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});