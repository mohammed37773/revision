/*
 * Shared JavaScript for HTML Files
 * Features: TOC generation, Progress bar, Back to top, Copy code, Active section highlight
 */

// ============================================
// DOM CONTENT LOADED
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all features
  initProgressBar();
  initBackToTop();
  initTableOfContents();
  initCopyCodeButtons();
  initActiveSectionHighlight();
  
  console.log('Shared JavaScript loaded successfully');
});

// ============================================
// READING PROGRESS BAR
// ============================================
function initProgressBar() {
  // Create progress bar element
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  progressContainer.innerHTML = '<div class="progress-bar" id="progressBar"></div>';
  
  // Insert at the beginning of body
  document.body.insertBefore(progressContainer, document.body.firstChild);
  
  // Update progress on scroll
  window.addEventListener('scroll', updateProgressBar);
  
  function updateProgressBar() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }
  }
}

// ============================================
// BACK TO TOP BUTTON
// ============================================
function initBackToTop() {
  // Create back to top button
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '↑';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.title = 'Back to top';
  
  document.body.appendChild(backToTop);
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
  
  // Smooth scroll to top on click
  backToTop.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ============================================
// TABLE OF CONTENTS GENERATION
// ============================================
function initTableOfContents() {
  // Find main content area
  const mainContent = document.querySelector('.main-content') || document.querySelector('body');
  
  // Find all h2 and h3 headings in main content
  const headings = mainContent.querySelectorAll('h2, h3');
  
  if (headings.length === 0) {
    return; // No headings found, skip TOC
  }
  
  // Create TOC structure
  const toc = document.createElement('nav');
  toc.className = 'toc';
  toc.setAttribute('aria-label', 'Table of contents');
  
  const tocTitle = document.createElement('div');
  tocTitle.className = 'toc-title';
  tocTitle.textContent = '📋 Table of Contents';
  toc.appendChild(tocTitle);
  
  const tocList = document.createElement('ul');
  tocList.className = 'toc-list';
  
  headings.forEach((heading, index) => {
    // Get existing ID or generate one
    let headingId = heading.id;
    
    if (!headingId) {
      // Generate ID from heading text
      headingId = heading.textContent.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Make sure ID is unique
      let counter = 1;
      let baseId = headingId;
      while (document.getElementById(headingId)) {
        headingId = baseId + '-' + counter;
        counter++;
      }
      
      // Set the ID on the heading
      heading.id = headingId;
    }
    
    // Add data attribute for section highlighting
    heading.setAttribute('data-section', headingId);
    
    const tocItem = document.createElement('li');
    tocItem.className = 'toc-item';
    
    const tocLink = document.createElement('a');
    tocLink.className = 'toc-link';
    tocLink.href = '#' + headingId;
    tocLink.textContent = heading.textContent;
    tocLink.setAttribute('data-target', headingId);
    
    tocItem.appendChild(tocLink);
    tocList.appendChild(tocItem);
    
    // Add smooth scroll
    tocLink.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile TOC if open
        const tocMobile = document.querySelector('.toc');
        const toggleBtn = document.querySelector('.toc-toggle');
        if (tocMobile && window.innerWidth < 768) {
          tocMobile.classList.remove('open');
        }
        if (toggleBtn) {
          toggleBtn.classList.remove('active');
        }
      }
    });
  });
  
  toc.appendChild(tocList);
  
  // Find where to insert TOC (before main content or at the top)
  const contentWrapper = document.querySelector('.content-wrapper');
  const firstH1 = document.querySelector('h1');
  
  if (contentWrapper) {
    // Insert TOC in the sidebar or at the beginning of content wrapper
    const sidebar = contentWrapper.querySelector('.sidebar');
    if (sidebar) {
      sidebar.appendChild(toc);
    } else {
      // Create sidebar and add TOC
      const sidebarDiv = document.createElement('div');
      sidebarDiv.className = 'sidebar';
      sidebarDiv.appendChild(toc);
      contentWrapper.insertBefore(sidebarDiv, contentWrapper.firstChild);
    }
  } else if (firstH1) {
    // Insert after h1
    let nextElement = firstH1.nextElementSibling;
    if (nextElement && nextElement.tagName === 'HR') {
      nextElement.parentNode.insertBefore(toc, nextElement.nextSibling);
    } else {
      firstH1.parentNode.insertBefore(toc, firstH1.nextSibling);
    }
  }
}




// ============================================
// ACTIVE SECTION HIGHLIGHTING
// ============================================
function initActiveSectionHighlight() {
  // Get all sections with IDs
  const sections = document.querySelectorAll('h1[id], h2[id], h3[id]');
  
  if (sections.length === 0) {
    return;
  }
  
  // Create intersection observer
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active class from all TOC links
        document.querySelectorAll('.toc-link').forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to corresponding TOC link
        const tocLink = document.querySelector(`.toc-link[data-target="${entry.target.id}"]`);
        if (tocLink) {
          tocLink.classList.add('active');
          
          // Scroll TOC to show active link
          const tocList = document.querySelector('.toc-list');
          if (tocList) {
            const activeItem = tocLink.parentElement;
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    });
  }, observerOptions);
  
  // Observe all sections
  sections.forEach(section => {
    observer.observe(section);
  });
}

// ============================================
// MOBILE TOC TOGGLE - REMOVED
// The TOC is now always visible on mobile within the content flow
// ============================================

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.addEventListener('click', function(e) {
  if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
});

// ============================================
// KEYBOARD NAVIGATION
// ============================================
document.addEventListener('keydown', function(e) {
  // Alt + Arrow keys for section navigation
  if (e.altKey) {
    const sections = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id]'));
    const currentScroll = window.scrollY;
    const windowHeight = window.innerHeight;
    
    let currentIndex = sections.findIndex(section => {
      const rect = section.getBoundingClientRect();
      return rect.top >= 0 && rect.top < windowHeight / 2;
    });
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        const prevSection = sections[currentIndex - 1];
        prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
  
  // Ctrl/Cmd + Home for back to top
  if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// ============================================
// PRINT FUNCTIONALITY
// ============================================
function printPage() {
  window.print();
}

// ============================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================================
window.printPage = printPage;

