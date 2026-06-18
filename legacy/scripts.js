/* ==========================================================================
   RAJA RAJESHWARA ENGINEERINGS - WEBSITE INTERACTIVITY
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. STICKY HEADER & ACTIVE NAVIGATION LINK
  // ==========================================================================
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Scroll header background transition
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll active link highlight
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================================================
  // 2. MOBILE MENU TOGGLE
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    // Change menu icon to X if active
    if (navMenu.classList.contains('active')) {
      mobileMenuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      `;
    } else {
      mobileMenuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      `;
    }
  });

  // Close mobile menu when nav links are clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileMenuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      `;
    });
  });

  // ==========================================================================
  // 3. ABOUT US TABS
  // ==========================================================================
  const tabButtons = document.querySelectorAll('.about-tab-btn');
  const tabContents = document.querySelectorAll('.about-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // ==========================================================================
  // 4. PRODUCT CATALOG SEARCH & FILTERING (Statically Rendered Cards)
  // ==========================================================================
  const productsGrid = document.getElementById('products-grid');
  const searchInput = document.getElementById('product-search-input');
  const filterTabsContainer = document.getElementById('filter-tabs');
  const productCards = document.querySelectorAll('.product-card');
  let activeFilter = 'all';
  let activeSearch = '';

  // Message container for "No products found"
  let noProductsMsg = document.createElement('div');
  noProductsMsg.className = 'no-products-msg';
  noProductsMsg.style.display = 'none';
  noProductsMsg.innerHTML = '<p>No pumps matching search criteria were found.</p>';
  productsGrid.appendChild(noProductsMsg);

  function filterProducts() {
    let visibleCount = 0;
    
    productCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const name = card.getAttribute('data-name');
      const desc = card.querySelector('.product-desc').textContent;
      const brand = card.querySelector('.product-brand-tag').textContent;
      
      const matchesCategory = activeFilter === 'all' || category === activeFilter;
      const matchesSearch = name.toLowerCase().includes(activeSearch.toLowerCase()) || 
                            desc.toLowerCase().includes(activeSearch.toLowerCase()) ||
                            brand.toLowerCase().includes(activeSearch.toLowerCase());
                            
      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        card.classList.add('active'); // triggers fade-in reveal animation
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCount === 0) {
      noProductsMsg.style.display = 'block';
    } else {
      noProductsMsg.style.display = 'none';
    }
  }

  // Handle category filtering
  filterTabsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-tab-btn')) {
      document.querySelectorAll('.filter-tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      filterProducts();
    }
  });

  // Handle Search Input
  searchInput.addEventListener('input', (e) => {
    activeSearch = e.target.value;
    filterProducts();
  });

  // ==========================================================================
  // 5. MODAL SYSTEM (Inquiry / Contact Success / Lightbox)
  // ==========================================================================
  const inquiryModalOverlay = document.getElementById('inquiry-modal-overlay');
  const inquiryClose = document.getElementById('inquiry-close');
  const inquiryForm = document.getElementById('inquiry-form');
  const inquiryProdDisplay = document.getElementById('inquiry-prod-display');
  const inquiryProductNameHidden = document.getElementById('inquiry-product-name');

  const successModalOverlay = document.getElementById('success-modal-overlay');
  const successClose = document.getElementById('success-close');
  const successTitle = document.getElementById('success-title');
  const successMsg = document.getElementById('success-msg');

  const lightboxModalOverlay = document.getElementById('lightbox-modal-overlay');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');

  // Close modals clicking outside
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Re-bind click handlers to products directly
  function bindInquiryButtons() {
    document.querySelectorAll('.product-inquiry-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodName = btn.getAttribute('data-product');
        inquiryProdDisplay.textContent = prodName;
        inquiryProductNameHidden.value = prodName;
        inquiryModalOverlay.classList.add('active');
      });
    });
  }

  // Run initial filter and bindings
  filterProducts();
  bindInquiryButtons();


  inquiryClose.addEventListener('click', () => {
    inquiryModalOverlay.classList.remove('active');
  });

  successClose.addEventListener('click', () => {
    successModalOverlay.classList.remove('active');
  });

  // Inquiry Form submit simulation
  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const customerName = document.getElementById('inquiry-name').value;
    const prodName = inquiryProductNameHidden.value;
    
    inquiryModalOverlay.classList.remove('active');
    inquiryForm.reset();

    // Trigger Success feedback
    successTitle.textContent = "Inquiry Submitted!";
    successMsg.textContent = `Thank you, ${customerName}. We have received your structural pump inquiry for the "${prodName}". A design consultant will contact you within 2 hours.`;
    successModalOverlay.classList.add('active');
  });

  // Contact Form submit simulation
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const customerName = document.getElementById('contact-name').value;
      
      contactForm.reset();

      // Trigger Success feedback
      successTitle.textContent = "Message Received!";
      successMsg.textContent = `Hello ${customerName}, your communication has been logged successfully. A service engineer will review your water network requirements.`;
      successModalOverlay.classList.add('active');
    });
  }

  // ==========================================================================
  // 6. GALLERY LIGHTBOX MODAL
  // ==========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const title = item.getAttribute('data-title') || item.querySelector('.gallery-title').textContent;
      const category = item.getAttribute('data-category');

      lightboxImage.src = src;
      lightboxCaption.textContent = `${title} (${category})`;
      lightboxModalOverlay.classList.add('active');
    });
  });

  lightboxClose.addEventListener('click', () => {
    lightboxModalOverlay.classList.remove('active');
  });

  // ==========================================================================
  // 7. TESTIMONIALS SLIDER
  // ==========================================================================
  const track = document.getElementById('testimonials-track');
  const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
  const prevBtn = document.getElementById('prev-testimonial');
  const nextBtn = document.getElementById('next-testimonial');
  const dotsContainer = document.getElementById('slider-dots');
  
  let currentSlideIndex = 0;
  let autoSlideTimer;

  // Create dot indicators
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoPlay();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.slider-dot'));

  function updateSlidePosition() {
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlideIndex);
    });
  }

  function goToSlide(index) {
    currentSlideIndex = index;
    updateSlidePosition();
  }

  function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    updateSlidePosition();
  }

  function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    updateSlidePosition();
  }

  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  // Auto-play
  function startAutoPlay() {
    autoSlideTimer = setInterval(nextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoSlideTimer);
    startAutoPlay();
  }

  if (slides.length > 0) {
    startAutoPlay();
  }

  // ==========================================================================
  // 8. SCROLL TO TOP UTILITY
  // ==========================================================================
  const scrollTopBtn = document.getElementById('scroll-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ==========================================================================
  // 9. SCROLL REVEAL ANIMATIONS (Intersection Observer & Failsafe Fallback)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  // Failsafe fallback function
  function failsafeReveal() {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
      if (!el.classList.contains('active')) {
        const rect = el.getBoundingClientRect();
        // If element has entered viewport (even slightly), activate it
        if (rect.top < windowHeight - 30) {
          el.classList.add('active');
        }
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.02, // low threshold triggers animations immediately on entering viewport
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  // Bind failsafe scroll and resize listeners
  window.addEventListener('scroll', failsafeReveal);
  window.addEventListener('resize', failsafeReveal);
  
  // Trigger initial check after page loading settles (to capture elements on first viewport)
  setTimeout(failsafeReveal, 200);
});
