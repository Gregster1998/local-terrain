// ============================================
// MAIN APPLICATION JAVASCRIPT
// Shared utilities and helper functions
// ============================================

/**
 * Create an item card element (Polaroid style)
 */
function createItemCard(item, index = 0) {
    const card = document.createElement('div');
    card.className = 'craft-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Determine status
    const isAvailable = item.status === 'available';
    const statusClass = isAvailable ? 'status-available' : 'status-claimed';
    const statusText = isAvailable ? 'Available' : 'Claimed';
    
    // Add decorative elements randomly
    const addTape = Math.random() > 0.5;
    const addSeal = Math.random() > 0.6 && item.artisan_name;
    
    // Format date
    const dateFound = item.date_found ? new Date(item.date_found).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : '';
    
    card.innerHTML = `
        ${addTape ? '<div class="tape"></div>' : ''}
        ${addSeal ? `<div class="wax-seal">${item.artisan_name.charAt(0)}</div>` : ''}
        
        <div class="photo-frame">
            ${item.image_urls && item.image_urls.length > 0 
                ? `<img src="${item.image_urls[0]}" alt="${window.CraftCaravanAPI.utils.sanitize(item.title)}" loading="lazy">`
                : `<svg width="100%" height="100%" viewBox="0 0 400 400">
                    <rect width="400" height="400" fill="#d4c5b0"/>
                    <circle cx="200" cy="150" r="80" fill="#8B9A6C" opacity="0.3"/>
                    <ellipse cx="200" cy="280" rx="120" ry="60" fill="#5B8FA3" opacity="0.4"/>
                  </svg>`
            }
            ${dateFound ? `<div class="photo-date">${dateFound} • ${item.location_found.split(',')[0].toUpperCase()}</div>` : ''}
        </div>
        
        <div class="craft-details">
            <h3 class="craft-title">${window.CraftCaravanAPI.utils.sanitize(item.title)}</h3>
            <p class="craft-location">${window.CraftCaravanAPI.utils.sanitize(item.location_found)}</p>
            <p class="craft-story">${window.CraftCaravanAPI.utils.sanitize(item.artisan_story)}</p>
            
            <div class="craft-footer">
                <span class="price">€${item.price_eur.toFixed(2)}</span>
                ${isAvailable 
                    ? `<button class="claim-btn" onclick="openClaimModal('${item.id}', '${window.CraftCaravanAPI.utils.sanitize(item.title)}')">Claim This Piece</button>`
                    : `<span class="status-badge ${statusClass}">${statusText}</span>`
                }
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Create a blog card element
 */
function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    
    const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <a href="pages/blog-post.html?slug=${post.slug}">
            ${post.featured_image 
                ? `<img src="${post.featured_image}" alt="${window.CraftCaravanAPI.utils.sanitize(post.title)}" class="blog-image" loading="lazy">`
                : '<div class="blog-image" style="background: linear-gradient(135deg, var(--azure), var(--olive));"></div>'
            }
            <div class="blog-content">
                <span class="blog-category">${post.category}</span>
                <h3 class="blog-title">${window.CraftCaravanAPI.utils.sanitize(post.title)}</h3>
                <p class="blog-excerpt">${window.CraftCaravanAPI.utils.sanitize(post.excerpt)}</p>
                <p class="blog-date">${publishedDate}</p>
            </div>
        </a>
    `;
    
    return card;
}

/**
 * Open the claim modal for an item
 */
function openClaimModal(itemId, itemTitle) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('claim-modal');
    
    if (!modal) {
        modal = createClaimModal();
        document.body.appendChild(modal);
    }
    
    // Set the item info
    document.getElementById('claim-item-title').textContent = itemTitle;
    document.getElementById('claim-item-id').value = itemId;
    
    // Show modal
    modal.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Close the claim modal
 */
function closeClaimModal() {
    const modal = document.getElementById('claim-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const form = document.getElementById('claim-form');
        if (form) {
            form.reset();
        }
        
        // Hide messages
        document.getElementById('claim-error').style.display = 'none';
        document.getElementById('claim-success').style.display = 'none';
    }
}

/**
 * Create the claim modal element
 */
function createClaimModal() {
    const modal = document.createElement('div');
    modal.id = 'claim-modal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeClaimModal()" aria-label="Close">&times;</button>
            
            <h2 style="font-family: var(--font-handwriting); color: var(--terracotta); margin-bottom: 0.5rem;">
                Interested in: <span id="claim-item-title"></span>
            </h2>
            
            <p style="margin-bottom: 1.5rem; color: #6b635c;">
                Fill out the form below and we'll send you a PayPal/Stripe invoice. 
                We'll also send photos and details about shipping.
            </p>
            
            <form id="claim-form">
                <input type="hidden" id="claim-item-id">
                
                <div class="form-group">
                    <label for="claim-name">Your Name *</label>
                    <input type="text" id="claim-name" required>
                </div>
                
                <div class="form-group">
                    <label for="claim-email">Email Address *</label>
                    <input type="email" id="claim-email" required>
                </div>
                
                <div class="form-group">
                    <label for="claim-country">Shipping Country *</label>
                    <select id="claim-country" required>
                        <option value="">Select country...</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Netherlands">Netherlands</option>
                        <option value="Belgium">Belgium</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Austria">Austria</option>
                        <option value="Australia">Australia</option>
                        <option value="New Zealand">New Zealand</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="claim-message">Questions or special requests (optional)</label>
                    <textarea id="claim-message" rows="3" placeholder="Any questions about shipping, the item, or the artisan?"></textarea>
                </div>
                
                <div id="claim-error" class="form-error"></div>
                <div id="claim-success" class="success-message" style="display: none;">
                    Your interest has been submitted! We'll email you within 24 hours with invoice and shipping details.
                </div>
                
                <button type="submit" class="form-submit">Submit Interest</button>
            </form>
        </div>
    `;
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeClaimModal();
        }
    });
    
    // Handle form submission
    const form = modal.querySelector('#claim-form');
    form.addEventListener('submit', handleClaimSubmit);
    
    return modal;
}

/**
 * Handle claim form submission
 */
async function handleClaimSubmit(e) {
    e.preventDefault();
    
    const errorDiv = document.getElementById('claim-error');
    const successDiv = document.getElementById('claim-success');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Clear previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Get form data
    const itemId = document.getElementById('claim-item-id').value;
    const name = document.getElementById('claim-name').value;
    const email = document.getElementById('claim-email').value;
    const country = document.getElementById('claim-country').value;
    const message = document.getElementById('claim-message').value;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Submit claim
    const { data, error } = await window.CraftCaravanAPI.claims.submit(
        itemId,
        name,
        email,
        country,
        message
    );
    
    if (error) {
        errorDiv.textContent = error;
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Interest';
    } else {
        successDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Interest';
        
        // Reset form after 2 seconds
        setTimeout(() => {
            closeClaimModal();
        }, 3000);
    }
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Show loading state
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading">Loading...</div>';
    }
}

/**
 * Show error message
 */
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

/**
 * Get URL parameter
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Populate archive collections dropdown
 * (Call this on page load for navigation)
 */
async function populateArchiveCollections() {
    const dropdown = document.getElementById('archive-collections');
    if (!dropdown) return;
    
    const { data: collections } = await window.CraftCaravanAPI.collections.getAll();
    
    if (!collections) return;
    
    // Filter out current collection
    const archived = collections.filter(c => !c.is_current);
    
    if (archived.length === 0) {
        dropdown.innerHTML = '<a href="#" style="color: #999; cursor: default;">No archives yet</a>';
        return;
    }
    
    dropdown.innerHTML = archived.map(c => `
        <a href="pages/collection.html?slug=${c.slug}">${c.name}</a>
    `).join('');
}

/**
 * Setup mobile navigation with touch support
 */
function setupMobileNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (!menuToggle || !navLinks) return;
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Handle dropdown toggles on mobile
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        
        // On mobile, first click toggles dropdown, second click goes to link
        if (window.innerWidth <= 768) {
            link.addEventListener('click', (e) => {
                if (!dropdown.classList.contains('active')) {
                    e.preventDefault();
                    
                    // Close other dropdowns
                    dropdowns.forEach(d => {
                        if (d !== dropdown) d.classList.remove('active');
                    });
                    
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
    
    // Re-initialize on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                dropdowns.forEach(d => d.classList.remove('active'));
            }
        }, 250);
    });
}

/**
 * Prevent zoom on double-tap for specific elements
 */
function preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            // Double tap detected
            const target = e.target;
            if (target.matches('button, a, .craft-card, input, select, textarea')) {
                e.preventDefault();
            }
        }
        lastTouchEnd = now;
    }, { passive: false });
}

/**
 * Add touch feedback to interactive elements
 */
function addTouchFeedback() {
    const interactiveElements = document.querySelectorAll('button, .claim-btn, .cta-button, .craft-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', () => {
            element.style.opacity = '0.8';
        }, { passive: true });
        
        element.addEventListener('touchend', () => {
            setTimeout(() => {
                element.style.opacity = '';
            }, 100);
        }, { passive: true });
    });
}

/**
 * Optimize images for mobile viewport
 */
function optimizeImagesForMobile() {
    if ('IntersectionObserver' in window && window.innerWidth <= 768) {
        const images = document.querySelectorAll('img');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Add loading attribute for better performance
                    if (!img.hasAttribute('loading')) {
                        img.setAttribute('loading', 'lazy');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Run on all pages
document.addEventListener('DOMContentLoaded', () => {
    // Populate archive collections dropdown
    if (window.CraftCaravanAPI) {
        populateArchiveCollections();
    }
    
    // Setup mobile navigation
    setupMobileNavigation();
    
    // Mobile optimizations
    if (window.innerWidth <= 768) {
        preventDoubleTapZoom();
        addTouchFeedback();
        optimizeImagesForMobile();
    }
});

// ============================================
// ACCESSIBILITY HELPERS
// ============================================

/**
 * Trap focus within modal
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
        
        if (e.key === 'Escape') {
            closeClaimModal();
        }
    });
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

/**
 * Lazy load images when they come into viewport
 */
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Run lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);