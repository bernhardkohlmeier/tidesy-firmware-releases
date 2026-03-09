// Tidesy Manual JavaScript Functions

// Toggle search box visibility
function toggleSearch() {
    const searchBox = document.getElementById('search-box');
    if (searchBox.style.display === 'none' || searchBox.style.display === '') {
        searchBox.style.display = 'block';
        document.getElementById('searchInput').focus();
    } else {
        searchBox.style.display = 'none';
    }
}

// Search content functionality
function searchContent() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const container = document.querySelector('.container');
    
    if (!filter) {
        // Reset all if empty search
        const allElements = container.querySelectorAll('h1, h2, h3, h4, h5, p, li, td, pre, code');
        allElements.forEach(el => {
            el.style.backgroundColor = '';
        });
        return;
    }

    // Create regex for word matching
    const regex = new RegExp(`\\b${escapeRegex(filter)}`, 'gi');
    
    // Search through all text content
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    const nodesToHighlight = [];

    while (node = walker.nextNode()) {
        if (regex.test(node.textContent)) {
            nodesToHighlight.push(node.parentElement);
        }
    }

    // Highlight parent elements
    const allElements = container.querySelectorAll('*');
    allElements.forEach(el => {
        el.style.backgroundColor = '';
        el.style.opacity = '1';
    });

    nodesToHighlight.forEach(el => {
        el.style.backgroundColor = '#ffeb3b';
        el.style.opacity = '1';
    });

    // Scroll to first result
    if (nodesToHighlight.length > 0) {
        nodesToHighlight[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Escape regex special characters
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Keyboard shortcut support
document.addEventListener('keydown', (e) => {
    // Ctrl+F or Cmd+F opens search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        toggleSearch();
    }

    // Esc closes search
    if (e.key === 'Escape') {
        const searchBox = document.getElementById('search-box');
        if (searchBox.style.display !== 'none') {
            searchBox.style.display = 'none';
        }
    }

    // Enter in search goes to first match
    if (e.key === 'Enter' && document.activeElement.id === 'searchInput') {
        searchContent();
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add keyboard shortcuts help
window.addEventListener('load', () => {
    // Create hidden help text for accessibility
    const helpText = document.createElement('div');
    helpText.style.display = 'none';
    helpText.id = 'keyboard-shortcuts-help';
    helpText.innerHTML = `
        <h3>Keyboard Shortcuts</h3>
        <ul>
            <li>Ctrl+F (Windows) or Cmd+F (Mac): Open search</li>
            <li>Escape: Close search</li>
            <li>Enter: Search for text</li>
            <li>Click links to jump to sections</li>
        </ul>
    `;
    document.body.appendChild(helpText);
});

// Table of contents scroll indicator
window.addEventListener('scroll', () => {
    updateTocHighlight();
});

function updateTocHighlight() {
    const sections = document.querySelectorAll('.manual-section, .quick-setup-section, .toc-section');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            navLinks.forEach(link => link.style.fontWeight = 'normal');
            const activeLink = document.querySelector(`.nav-menu a[href="#${section.id}"]`);
            if (activeLink) {
                activeLink.style.fontWeight = 'bold';
            }
        }
    });
}

// Print page functionality
function printManual() {
    window.print();
}

// Export as text (basic)
function exportAsText() {
    const container = document.querySelector('.container');
    const text = container.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tidesy-manual.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Mobile menu toggle (future enhancement)
function toggleMobileMenu() {
    const menu = document.querySelector('.nav-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Add accessibility labels
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.setAttribute('aria-label', 'Search the manual');
    }

    // Highlight code blocks for better readability
    document.querySelectorAll('pre').forEach(pre => {
        pre.setAttribute('tabindex', '0');
    });

    // Add copy-to-clipboard for code blocks
    document.querySelectorAll('code').forEach(code => {
        if (code.parentElement.tagName === 'PRE') {
            const btn = document.createElement('button');
            btn.textContent = 'Copy';
            btn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                padding: 5px 10px;
                background: #666;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 0.9em;
            `;
            
            btn.onclick = () => {
                const text = code.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    btn.textContent = 'Copied!';
                    setTimeout(() => {
                        btn.textContent = 'Copy';
                    }, 2000);
                });
            };
            
            code.parentElement.style.position = 'relative';
            code.parentElement.appendChild(btn);
        }
    });

    // Lazy load images if any are added
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Initialize table of contents update
    updateTocHighlight();
});

// Utility function to get reading time
function getReadingTime() {
    const container = document.querySelector('.container');
    const text = container.innerText;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
}

// Add reading time to page (optional enhancement)
window.addEventListener('load', () => {
    const readingTime = getReadingTime();
    const readingTimeElement = document.createElement('div');
    readingTimeElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 10px 15px;
        border-radius: 6px;
        font-size: 0.9em;
        z-index: 999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    readingTimeElement.textContent = `Reading time: ~${readingTime} min`;
    readingTimeElement.id = 'reading-time';
    // Uncomment to enable reading time display
    // document.body.appendChild(readingTimeElement);
});

// Accessibility: Skip to main content link
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#detailed-manual';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Initialize skip link on load
window.addEventListener('load', addSkipLink);

// Session storage for user preferences
const manualPreferences = {
    save: (key, value) => {
        sessionStorage.setItem(`tidesy-manual-${key}`, JSON.stringify(value));
    },
    
    get: (key) => {
        const stored = sessionStorage.getItem(`tidesy-manual-${key}`);
        return stored ? JSON.parse(stored) : null;
    },
    
    toggleDarkMode: () => {
        const isDark = manualPreferences.get('darkMode');
        const newState = !isDark;
        manualPreferences.save('darkMode', newState);
        applyDarkMode(newState);
    },
    
    rememberScrollPosition: () => {
        window.addEventListener('scroll', () => {
            manualPreferences.save('scrollPosition', window.scrollY);
        });
        
        // Restore on load
        const savedPosition = manualPreferences.get('scrollPosition');
        if (savedPosition) {
            window.addEventListener('load', () => {
                window.scrollTo(0, savedPosition);
            });
        }
    }
};

function applyDarkMode(enable) {
    const html = document.documentElement;
    if (enable) {
        html.style.colorScheme = 'dark';
    } else {
        html.style.colorScheme = 'light';
    }
}

// Initialize preferences on load
window.addEventListener('load', () => {
    manualPreferences.rememberScrollPosition();
});
