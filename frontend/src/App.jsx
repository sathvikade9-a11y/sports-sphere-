import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  // Navigation & UI States
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [aboutTab, setAboutTab] = useState('tab-overview');

  // Products & Filter States
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Smart Pump Selector States
  const [selectorHead, setSelectorHead] = useState('');
  const [selectorFlow, setSelectorFlow] = useState('');
  const [selectorCategory, setSelectorCategory] = useState('all');
  const [selectorHours, setSelectorHours] = useState(4);
  const [selectorRate, setSelectorRate] = useState(7);
  const [selectorResults, setSelectorResults] = useState(null);
  const [loadingSelector, setLoadingSelector] = useState(false);
  const [selectorError, setSelectorError] = useState('');

  // Modals States
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successContent, setSuccessContent] = useState({ title: '', message: '' });
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState('');
  
  // Gallery Lightbox States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxContent, setLightboxContent] = useState({ src: '', title: '', category: '' });

  // Testimonials Slider
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const testimonials = [
    {
      stars: 5,
      quote: "The engineering consultation supplied by Raja Rajeshwara team was spectacular. They mapped out our dynamic head, chose the Tormac booster series, and solved a critical low pressure issue in our 8-story commercial site. Outstanding service!",
      client: "K. Madhav Rao",
      designation: "Project Manager, Skyline Builders"
    },
    {
      stars: 5,
      quote: "Purchased two Falcon V6 high-discharge submersible pumps for our family farm. Even under voltage fluctuations, they perform efficiently. The dealer provided genuine warranty papers and fast delivery.",
      client: "Ramakrishnan G.",
      designation: "Agriculturist, Green Acres Farm"
    },
    {
      stars: 5,
      quote: "We source our high capacity centrifugal process pumps exclusively from Raja Rajeshwara. Their technical assistance during dynamic alignment saved us days of downtime. Extremely professional outfit.",
      client: "Vikas Deshmukh",
      designation: "Operations Lead, Deccan Chem-Synthetics"
    }
  ];

  // Form States
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submittingContact, setSubmittingContact] = useState(false);

  // User Authentication & Portal States
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('rr_user');
    return saved ? 'site' : 'login';
  });
  const [userHistory, setUserHistory] = useState({ inquiries: [], contacts: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', email: '' });
  const [loginError, setLoginError] = useState('');

  // Route safeguard: force login if user is not authenticated
  useEffect(() => {
    if (!currentUser && currentView !== 'login') {
      setCurrentView('login');
    }
  }, [currentUser, currentView]);

  // Fetch history when user is logged in
  useEffect(() => {
    if (currentUser && currentUser.email) {
      fetchUserHistory(currentUser.email);
    }
  }, [currentUser]);

  const fetchUserHistory = async (email) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/history?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setUserHistory(data);
      }
    } catch (err) {
      console.error("Error fetching user history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Auto-fill forms for logged-in user
  useEffect(() => {
    if (currentUser) {
      setContactForm(prev => ({
        ...prev,
        name: prev.name || currentUser.name,
        email: prev.email || currentUser.email
      }));
      setInquiryForm(prev => ({
        ...prev,
        name: prev.name || currentUser.name,
        email: prev.email || currentUser.email
      }));
    } else {
      setContactForm(prev => ({ ...prev, name: '', email: '' }));
      setInquiryForm(prev => ({ ...prev, name: '', email: '' }));
    }
  }, [currentUser]);

  // Handle customer login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const { name, email } = loginForm;
    if (!name.trim() || !email.trim()) {
      setLoginError('Both Name and Email are required.');
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setLoginError('Please enter a valid Gmail address (ending in @gmail.com).');
      return;
    }

    const userData = { name: name.trim(), email: email.trim().toLowerCase() };
    localStorage.setItem('rr_user', JSON.stringify(userData));
    setCurrentUser(userData);
    setLoginForm({ name: '', email: '' });
    
    // Set success modal welcome message
    setSuccessContent({
      title: "Welcome to Raja Rajeshwara Engineerings",
      message: `Hello ${name.trim()}, you have successfully signed into the portal. You can now explore our pump solutions and view your submission history.`
    });
    setSuccessModalOpen(true);
    setCurrentView('site');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('rr_user');
    setCurrentUser(null);
    setUserHistory({ inquiries: [], contacts: [] });
    setCurrentView('login');
  };

  // References for Scroll Observer
  const sectionRefs = {
    home: useRef(null),
    about: useRef(null),
    brands: useRef(null),
    products: useRef(null),
    'pump-selector': useRef(null),
    services: useRef(null),
    'why-choose-us': useRef(null),
    industries: useRef(null),
    testimonials: useRef(null),
    gallery: useRef(null),
    contact: useRef(null)
  };

  // Gallery items metadata
  const galleryItems = [
    { src: '/assets/images/hero-bg.png', title: 'Industrial Showroom Setup', category: 'Installations' },
    { src: '/assets/images/products/product-centrifugal.png', title: 'Centrifugal Pump Close-Up', category: 'Pumps' },
    { src: '/assets/images/products/product-submersible.png', title: 'Borewell Submersible', category: 'Pumps' },
    { src: '/assets/images/products/product-booster.png', title: 'Dual Pressure Booster System', category: 'Installations' },
  ];

  // Fetch products from Express server on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (err) {
      console.error("Error connecting to products API:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle Scroll animations, Sticky header, and active nav link
  useEffect(() => {
    const handleScroll = () => {
      // Sticky header check
      if (window.scrollY > 50) {
        setHeaderScrolled(true);
      } else {
        setHeaderScrolled(false);
      }

      // Scroll spy active link highlight
      let currentSection = 'home';
      for (const section in sectionRefs) {
        const ref = sectionRefs[section].current;
        if (ref) {
          const top = ref.offsetTop - 120;
          const height = ref.offsetHeight;
          if (window.scrollY >= top && window.scrollY < top + height) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter products when filter or search query changes
  useEffect(() => {
    let result = [...products];
    if (activeFilter !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === activeFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      );
    }
    setFilteredProducts(result);
  }, [activeFilter, searchQuery, products]);

  // Testimonial auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Handle Smart Pump Recommendation
  const handleCalculateSelector = async (e) => {
    e.preventDefault();
    setSelectorError('');
    setSelectorResults(null);

    const head = parseFloat(selectorHead);
    const flow = parseFloat(selectorFlow);

    if (isNaN(head) || head <= 0 || isNaN(flow) || flow <= 0) {
      setSelectorError('Please enter valid positive numbers for both dynamic head and flow rate.');
      return;
    }

    setLoadingSelector(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          head,
          flow,
          application: selectorCategory,
          dailyHours: selectorHours,
          electricityRate: selectorRate
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectorResults(data);
      } else {
        const errData = await response.json();
        setSelectorError(errData.error || 'Failed to calculate recommendations.');
      }
    } catch (err) {
      setSelectorError('Unable to connect to the smart calculator service. Make sure backend servers are running.');
      console.error(err);
    } finally {
      setLoadingSelector(false);
    }
  };

  // Helper to format 10-digit Indian numbers with 91 country code
  const formatWhatsAppPhone = (phoneStr) => {
    const cleaned = (phoneStr || '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  };

  // Inquiry Form Submission — saves to Supabase first, then opens WhatsApp to owner
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, message } = inquiryForm;
    const OWNER_PHONE = '917396162006';

    // Step 1: Save to Supabase via the backend API
    let savedOk = false;
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          productName: selectedProductForInquiry,
          message
        })
      });
      if (response.ok) savedOk = true;
    } catch (err) {
      console.error('Inquiry save error:', err);
    }

    // Step 2: Close modal and reset form
    setInquiryModalOpen(false);
    setInquiryForm({ name: '', email: '', phone: '', message: '' });

    // Step 3: Show success modal — always show success to customer
    setSuccessContent({
      title: 'Inquiry Submitted!',
      message: `Thank you, ${name}. Your inquiry for "${selectedProductForInquiry}" has been received. We are now redirecting you to WhatsApp to notify our team.`
    });
    setSuccessModalOpen(true);

    // Step 4: Store WhatsApp URL — opened on 'Okay, Great' click (avoids popup blocker)
    const waText =
      `Hello,\n\nNew product inquiry from the website:\n\n` +
      `*Product:* ${selectedProductForInquiry}\n` +
      `*Name:* ${name}\n` +
      `*Email:* ${email || 'N/A'}\n` +
      `*Phone:* ${phone || 'N/A'}\n` +
      `*Message:* ${message || 'N/A'}\n\n` +
      `${savedOk ? '\u2705 Saved to database.' : '\u26a0\ufe0f Note: DB save failed \u2014 please check Supabase.'}`;
    setPendingWhatsAppUrl(`https://wa.me/917396162006?text=${encodeURIComponent(waText)}`);

    // Step 5: Send email copy to customer if email provided
    if (email) {
      const mailBody =
        `Hello ${name},\n\nThank you for your inquiry for "${selectedProductForInquiry}".\n\n` +
        `Our team will contact you shortly.\n\n` +
        `Product: ${selectedProductForInquiry}\nName: ${name}\nPhone: ${phone || 'N/A'}\nMessage: ${message || 'N/A'}`;
      window.open(
        `mailto:${email}?subject=${encodeURIComponent('Inquiry Confirmation - ' + selectedProductForInquiry)}&body=${encodeURIComponent(mailBody)}`,
        '_blank'
      );
    }
  };

  // Contact Form Submission — saves to Supabase first, then opens WhatsApp to owner
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmittingContact(true);
    const { name, email, phone, message } = contactForm;
    const OWNER_PHONE = '917396162006';

    // Step 1: Save to Supabase via the backend API
    let savedOk = false;
    let analysis = {};
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      });
      if (response.ok) {
        const data = await response.json();
        analysis = data?.contact?.analysis || {};
        savedOk = true;
      }
    } catch (err) {
      console.error('Contact save error:', err);
    }

    // Step 2: Clear the form
    setContactForm({ name: '', email: '', phone: '', message: '' });

    // Step 3: Show success modal — always show success to customer
    setSuccessContent({
      title: 'Message Logged!',
      message: `Hello ${name}, your message has been received. We are now redirecting you to WhatsApp to notify our team directly.`
    });
    setSuccessModalOpen(true);

    // Step 4: Store WhatsApp URL — opened on 'Okay, Great' click (avoids popup blocker)
    const waText =
      `Hello,\n\nNew contact message from the website:\n\n` +
      `*Name:* ${name}\n` +
      `*Email:* ${email || 'N/A'}\n` +
      `*Phone:* ${phone || 'N/A'}\n` +
      `*Message:* ${message}\n\n` +
      (analysis.category ? `*Category:* ${analysis.category}\n*Urgency:* ${analysis.urgency}\n` : '') +
      `${savedOk ? '\u2705 Saved to database.' : '\u26a0\ufe0f Note: DB save failed \u2014 please check Supabase.'}`;
    setPendingWhatsAppUrl(`https://wa.me/917396162006?text=${encodeURIComponent(waText)}`);

    // Step 5: Send email copy to customer if email provided
    if (email) {
      const mailBody =
        `Hello ${name},\n\nThank you for contacting Raja Rajeshwara Engineerings.\n\n` +
        `We have received your message and our team will get back to you shortly.\n\n` +
        `Your message: ${message}`;
      window.open(
        `mailto:${email}?subject=${encodeURIComponent('Thank you for contacting us - Raja Rajeshwara Engineerings')}&body=${encodeURIComponent(mailBody)}`,
        '_blank'
      );
    }

    setSubmittingContact(false);
  };

  const openInquiryModal = (productName) => {
    setSelectedProductForInquiry(productName);
    setInquiryModalOpen(true);
  };

  const openLightbox = (item) => {
    setLightboxContent(item);
    setLightboxOpen(true);
  };

  return (
    <div>
      {/* ==========================================
           HEADER / NAVIGATION
           ========================================== */}
      {currentUser && currentView !== 'login' && (
        <header className={`header ${headerScrolled ? 'scrolled' : ''}`} id="header">
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="#home" className="logo">
              <div className="logo-icon">RR</div>
              <div className="logo-text">
                <span className="logo-title" style={{color: 'white'}}>Raja Rajeshwara</span>
                <span className="logo-subtitle">Engineerings</span>
              </div>
            </a>
            
            <nav className={`nav-container ${mobileMenuOpen ? 'active' : ''}`} id="nav-container" style={{ flex: 1 }}>
              <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`} id="nav-menu">
                <li><a href="#home" className={`nav-link ${currentView === 'site' && activeSection === 'home' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Home</a></li>
                <li><a href="#about" className={`nav-link ${currentView === 'site' && activeSection === 'about' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>About</a></li>
                <li><a href="#brands" className={`nav-link ${currentView === 'site' && activeSection === 'brands' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Brands</a></li>
                <li><a href="#products" className={`nav-link ${currentView === 'site' && activeSection === 'products' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Products</a></li>
                <li><a href="#pump-selector" className={`nav-link ${currentView === 'site' && activeSection === 'pump-selector' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Smart Selector</a></li>
                <li><a href="#services" className={`nav-link ${currentView === 'site' && activeSection === 'services' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Services</a></li>
                <li><a href="#why-choose-us" className={`nav-link ${currentView === 'site' && activeSection === 'why-choose-us' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Why Us</a></li>
                <li><a href="#industries" className={`nav-link ${currentView === 'site' && activeSection === 'industries' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Sectors</a></li>
                <li><a href="#testimonials" className={`nav-link ${currentView === 'site' && activeSection === 'testimonials' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Reviews</a></li>
                <li><a href="#gallery" className={`nav-link ${currentView === 'site' && activeSection === 'gallery' ? 'active' : ''}`} onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}>Gallery</a></li>
                <li>
                  <button onClick={() => { setCurrentView('portal'); setMobileMenuOpen(false); }} className={`nav-link ${currentView === 'portal' ? 'active' : ''}`} style={{ background: '#6b7280', border: 'none', color: 'white', font: 'inherit', cursor: 'pointer', padding: '9px 16px', borderRadius: '6px', fontSize: '0.88rem', fontWeight: '600' }}>My Portal</button>
                </li>
              </ul>
            </nav>

            {/* Right-side action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <a
                href="#contact"
                className="btn btn-primary"
                style={{ padding: '9px 20px', fontSize: '0.88rem', borderRadius: '6px', fontWeight: '600', whiteSpace: 'nowrap' }}
                onClick={() => { setCurrentView('site'); setMobileMenuOpen(false); }}
              >
                Contact Us
              </a>
              <button
                onClick={handleLogout}
                style={{ background: '#ef4444', border: 'none', color: 'white', font: 'inherit', cursor: 'pointer', borderRadius: '6px', padding: '9px 16px', fontSize: '0.88rem', fontWeight: '600', whiteSpace: 'nowrap' }}
              >
                Logout
              </button>
            </div>

            <button 
              className="mobile-menu-btn" 
              id="mobile-menu-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </header>
      )}

      {currentUser && currentView === 'site' && (
        <>
          {/* ==========================================
               1. HERO SECTION
               ========================================== */}
          <section className="hero" id="home" ref={sectionRefs.home}>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.244 5.622-4 4a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L5.5 8.293l3.646-3.647a.5.5 0 0 1 .708.708"/>
              </svg>
              Authorized Falcon & Tormac Pumps Dealer
            </div>
            <h1 className="hero-title">Reliable Pumping Solutions <span>for Every Need</span></h1>
            <p className="hero-description">Delivering high-quality water pumping solutions for residential, agricultural, commercial, and industrial applications. Backed by expert engineering support and reliable service.</p>
            <div className="hero-actions">
              <a href="#products" className="btn btn-primary">Explore Products</a>
              <a href="#pump-selector" className="btn btn-secondary">Smart Pump Selector</a>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           2. ABOUT US SECTION
           ========================================== */}
      <section className="about" id="about" ref={sectionRefs.about}>
        <div className="container">
          <div className="about-grid">
            <div className="about-visual">
              <div className="about-img-container">
                {/* Fallback pattern if asset is slow */}
                <div style={{ background: '#172a45', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <img 
                    src="/assets/images/hero-bg.png" 
                    alt="Engineering pump showroom" 
                    onError={(e) => { e.target.style.display = 'none' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span>Raja Rajeshwara Engineering Depot</span>
                </div>
              </div>
              <div className="about-experience-badge">
                <span className="experience-years">15+</span>
                <span className="experience-text">Years of Excellence</span>
              </div>
            </div>
            
            <div className="about-content">
              <span className="section-tag">About Us</span>
              <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Engineered Pumping Excellence</h2>
              
              <div className="about-tabs">
                <button className={`about-tab-btn ${aboutTab === 'tab-overview' ? 'active' : ''}`} onClick={() => setAboutTab('tab-overview')}>Overview</button>
                <button className={`about-tab-btn ${aboutTab === 'tab-mission' ? 'active' : ''}`} onClick={() => setAboutTab('tab-mission')}>Mission</button>
                <button className={`about-tab-btn ${aboutTab === 'tab-vision' ? 'active' : ''}`} onClick={() => setAboutTab('tab-vision')}>Vision</button>
              </div>
              
              {aboutTab === 'tab-overview' && (
                <div id="tab-overview" className="about-tab-content active">
                  <p>Raja Rajeshwara Engineerings is a premier trading and support firm specializing in state-of-the-art water pumping systems and industrial fluid management solutions. As an authorized partner of industry giants <strong>Falcon Pumps</strong> and <strong>Tormac Pumps</strong>, we bring unmatched reliability and precision engineering to your doorstep.</p>
                  <p style={{ marginTop: '14px' }}>We combine decade-long domain experience with robust after-sales and installation consulting to provide scalable solutions suited to standard and highly complex demands.</p>
                </div>
              )}
              
              {aboutTab === 'tab-mission' && (
                <div id="tab-mission" className="about-tab-content active">
                  <p>Our mission is to empower residential, agricultural, and industrial communities by offering energy-efficient, long-lasting pumping systems. We strive to maintain absolute product authenticity, competitive pricing, and immediate technical response to ensure our client's operations never grind to a halt.</p>
                </div>
              )}
              
              {aboutTab === 'tab-vision' && (
                <div id="tab-vision" className="about-tab-content active">
                  <p>Our vision is to become the absolute leader in premium pump distribution and water management solutions across the region, recognized for technical innovation, sustainable water engineering, and setting new benchmarks in reliable product lifecycle support.</p>
                </div>
              )}
              
              <ul className="about-list">
                <li className="about-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                  Authorized Direct Dealership
                </li>
                <li className="about-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                  Certified Maintenance Technicians
                </li>
                <li className="about-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                  Eco-Saver Models
                </li>
                <li className="about-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                  Active Field Dispatch
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           3. BRANDS WE DEAL WITH
           ========================================== */}
      <section className="brands section-bg-light" id="brands" ref={sectionRefs.brands}>
        <div className="container">
          <div className="section-header">
            <span class="section-tag">Authorized Partner</span>
            <h2 className="section-title">Brands We Deal With</h2>
            <p className="section-subtitle">We partner with premier pumping equipment manufacturers to guarantee long-lasting performance and compliance with industrial standards.</p>
          </div>
          
          <div className="brands-grid">
            {/* Brand 1: Falcon */}
            <div className="brand-card">
              <div className="brand-header">
                <div className="brand-logo-mock falcon-color">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.283 2.341a1 1 0 0 0-1.244-.244L3.5 5.5v2L8.4 6.1a1 1 0 0 1 .73 0l4.336 1.83a1 1 0 0 0 1.344-.944V4.5a1 1 0 0 0-.156-.532zM3.5 12V8.5L8.4 9.6a1 1 0 0 0 .73 0l4.336-1.83a1 1 0 0 1 1.344.944v2.532a1 1 0 0 1-.512.872L9.039 14.8a1 1 0 0 1-1.244-.244z"/>
                  </svg>
                  Falcon Pumps
                </div>
                <span className="brand-badge">Authorized Dealer</span>
              </div>
              <p className="brand-description">Falcon Pumps is renowned for manufacturing highly efficient, stainless steel submersible borewell and openwell pumps designed to thrive under rigorous Indian agricultural and domestic conditions.</p>
              <div className="brand-features">
                <div className="brand-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-5.443z"/>
                  </svg>
                  <span>100% Rust-Proof Grade 304/316 Stainless Steel</span>
                </div>
                <div className="brand-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-5.443z"/>
                  </svg>
                  <span>High hydraulic efficiency for lower electricity bills</span>
                </div>
              </div>
              <div className="brand-categories">
                <h4 className="brand-categories-title">Key Categories Supplied</h4>
                <div className="brand-tags">
                  <span className="brand-tag">Borewell Submersibles</span>
                  <span className="brand-tag">Openwell Submersibles</span>
                  <span className="brand-tag">Slim V4/V6 Models</span>
                </div>
              </div>
            </div>

            {/* Brand 2: Tormac */}
            <div className="brand-card">
              <div className="brand-header">
                <div className="brand-logo-mock tormac-color">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                  </svg>
                  Tormac Pumps
                </div>
                <span className="brand-badge">Premium Partner</span>
              </div>
              <p className="brand-description">Tormac Pumps has a global presence, offering highly engineered centrifugal pumps, domestic self-priming pumps, and state-of-the-art multi-stage pressure booster solutions.</p>
              <div className="brand-features">
                <div className="brand-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-5.443z"/>
                  </svg>
                  <span>Dynamic balanced impellers for minimal vibration</span>
                </div>
                <div className="brand-feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-5.443z"/>
                  </svg>
                  <span>Wide voltage operation with custom thermal protection</span>
                </div>
              </div>
              <div className="brand-categories">
                <h4 className="brand-categories-title">Key Categories Supplied</h4>
                <div className="brand-tags">
                  <span className="brand-tag">Pressure Boosters</span>
                  <span className="brand-tag">Domestic Self-Priming</span>
                  <span className="brand-tag">Centrifugal Pumps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           4. PRODUCTS SECTION (Dynamic Catalog)
           ========================================== */}
      <section className="products" id="products" ref={sectionRefs.products}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Catalog</span>
            <h2 className="section-title">Our Pumping Solutions</h2>
            <p className="section-subtitle">Search or filter through our authorized collection of heavy-duty pumping equipment. Select a category below or search by model name.</p>
          </div>
          
          <div className="products-filter-bar">
            <div className="filter-tabs" id="filter-tabs">
              {['all', 'residential', 'agricultural', 'commercial', 'industrial'].map(cat => (
                <button 
                  key={cat}
                  className={`filter-tab-btn ${activeFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} Pumps
                </button>
              ))}
            </div>
            
            <div className="product-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search pump models..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loadingProducts ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
              <p>Loading pump catalog...</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-img-wrapper">
                      <span className="product-category-tag">{product.category}</span>
                      <span className="product-brand-tag" style={{ backgroundColor: product.brand.includes('Falcon') ? '#f97316' : '#1d4ed8' }}>
                        {product.brand}
                      </span>
                      <img 
                        src={product.image.startsWith('/') ? product.image : '/' + product.image} 
                        alt={product.name} 
                        onError={(e) => { e.target.src = '/assets/images/products/product-centrifugal.png' }}
                        loading="lazy" 
                      />
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-desc" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', flexGrow: 1 }}>
                        {product.description}
                      </p>
                      <div className="product-specs" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginBottom: '16px' }}>
                        {Object.entries(product.specs).map(([label, val]) => (
                          <div key={label} className="spec-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                            <span className="spec-label" style={{ color: 'var(--text-muted)' }}>{label}</span>
                            <span className="spec-value" style={{ fontWeight: '600' }}>{val}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        className="product-inquiry-btn btn-primary btn" 
                        style={{ width: '100%', padding: '10px 0', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => openInquiryModal(product.name)}
                      >
                        Inquiry Now
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No pumps matching search criteria were found.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
           5. SMART PUMP SELECTOR (Python-Powered Engine)
           ========================================== */}
      <section 
        className="pump-selector section-bg-light" 
        id="pump-selector" 
        ref={sectionRefs['pump-selector']}
        style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Calculators</span>
            <h2 className="section-title">Smart Pump Selector Dashboard</h2>
            <p className="section-subtitle">
              Input your hydraulic operations requirements below. Our Python calculations engine will execute system curves calculations, estimate energy profiles, and identify the best-fit Falcon or Tormac pumps.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '40px',
            backgroundColor: 'var(--bg-white)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            {/* Input Form Panel */}
            <form onSubmit={handleCalculateSelector} style={{ padding: '40px', borderRight: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.5rem', borderBottom: '2px solid var(--accent)', paddingBottom: '8px' }}>Hydraulics Input</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                  Total Dynamic Head (Height in Meters) <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="e.g. 50" 
                  value={selectorHead}
                  onChange={(e) => setSelectorHead(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Includes static height lift + pipe friction losses.</span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                  Desired Flow Rate (Liters Per Minute - LPM) <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="e.g. 150" 
                  value={selectorFlow}
                  onChange={(e) => setSelectorFlow(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required volume supply of fluid per minute.</span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                  Application Category
                </label>
                <select 
                  value={selectorCategory}
                  onChange={(e) => setSelectorCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)' }}
                >
                  <option value="all">All Applications</option>
                  <option value="residential">Residential</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem' }}>Daily Run (Hrs)</label>
                  <input 
                    type="number" 
                    value={selectorHours} 
                    onChange={(e) => setSelectorHours(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem' }}>Rate (₹/kWh)</label>
                  <input 
                    type="number" 
                    value={selectorRate} 
                    onChange={(e) => setSelectorRate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)' }}
                  />
                </div>
              </div>

              {selectorError && (
                <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', marginBottom: '20px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {selectorError}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px 0' }}
                disabled={loadingSelector}
              >
                {loadingSelector ? 'Calculating...' : 'Find Optimal Pump'}
              </button>
            </form>

            {/* Results Panel */}
            <div style={{ padding: '40px', backgroundColor: 'var(--bg-light)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                Engineering Output
              </h3>

              {!selectorResults && !loadingSelector && (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: 0.3, marginBottom: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p>Submit dynamic head and discharge parameters to query the recommendation system.</p>
                </div>
              )}

              {loadingSelector && (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ border: '4px solid rgba(0,0,0,0.1)', width: '40px', height: '40px', borderRadius: '50%', borderLeftColor: 'var(--accent)', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                  <p>Processing pump curve algorithms on Python backend...</p>
                </div>
              )}

              {selectorResults && (
                <div style={{ animation: 'fadeIn 0.5s ease', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Energy calculations banner */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px',
                    backgroundColor: 'var(--bg-white)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Water Work Power</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent)' }}>{selectorResults.requiredWaterHP} HP</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Theoretical hydraulic fluid lift power.</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Est. Shaft Power (BHP)</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{selectorResults.requiredBHP} HP</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated minimum motor power needed.</span>
                    </div>
                  </div>

                  <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Recommended Models (Ranks):</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
                    {selectorResults.recommendations.length > 0 ? (
                      selectorResults.recommendations.map((rec, idx) => (
                        <div key={rec.product.id} style={{
                          backgroundColor: 'var(--bg-white)',
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          borderLeft: idx === 0 ? '4px solid var(--accent)' : '1px solid var(--border-color)'
                        }}>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{
                                backgroundColor: rec.suitabilityScore > 80 ? '#dcfce7' : '#fef9c3',
                                color: rec.suitabilityScore > 80 ? '#15803d' : '#854d0e',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}>
                                {rec.suitabilityScore}% Match
                              </span>
                              {idx === 0 && <span style={{ fontSize: '0.7rem', color: 'white', backgroundColor: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>OPTIMAL</span>}
                            </div>
                            <h5 style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: '700' }}>{rec.product.name}</h5>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Motor Size: <strong style={{color: 'var(--text-dark)'}}>{rec.product.specs['Motor Power']}</strong> | Flow Ratio: {rec.flowRatioPct}%
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '130px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Est. Power Bill</span>
                            <strong style={{ fontSize: '1rem', color: '#16a34a' }}>₹{rec.monthlyCostINR.toLocaleString('en-IN')}</strong> <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/mo</span>
                            <button 
                              onClick={() => openInquiryModal(rec.product.name)}
                              style={{
                                display: 'block',
                                width: '100%',
                                marginTop: '6px',
                                padding: '6px 10px',
                                border: '1px solid var(--accent)',
                                color: 'var(--accent)',
                                backgroundColor: 'transparent',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--accent)'; e.target.style.color = 'white' }}
                              onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--accent)' }}
                            >
                              Inquire Now
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', backgroundColor: 'var(--bg-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p style={{ fontWeight: '600', color: 'var(--primary)' }}>No Capabilities Match Found</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>All available pumps in this category are undersized for the requested head height ({selectorHead}m) or flow capacity ({selectorFlow} LPM). Please adjust metrics or select "All Applications".</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           6. SERVICES SECTION
           ========================================== */}
      <section className="services section-bg-light" id="services" ref={sectionRefs.services}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Services</span>
            <h2 className="section-title">End-To-End Technical Support</h2>
            <p className="section-subtitle">We don't just sell pumps; we supply engineering consultancy, custom design configurations, and robust diagnostic field services.</p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="service-title">Product Consultation</h3>
              <p className="service-desc">Collaborate with our seasoned fluid engineers to understand capacity demands, chemical compositions of fluids, and choose optimal configuration styles.</p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="service-title">Pump Selection Assistance</h3>
              <p className="service-desc">Avoid undersizing or oversizing traps. We map friction losses, absolute static lift, pipe bends, and select the precise model with perfect motor power parameters.</p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="service-title">Installation Guidance</h3>
              <p className="service-desc">We offer step-by-step schematics and technical supervision to ensure foundation stability, proper alignment of shafts, and error-free electrical priming.</p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.27 15H18" />
                </svg>
              </div>
              <h3 className="service-title">Maintenance Support</h3>
              <p className="service-desc">Prevent unexpected shut-downs. Our preventive check plans include monitoring dynamic vibration levels, bearing heat generation, and replacing seals.</p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="service-title">Technical Assistance</h3>
              <p className="service-desc">Immediate remote and physical technical dispatch. We troubleshoot dry-run issues, phase unbalance, air binding in lines, and load fluctuations.</p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="service-title">After-Sales Service</h3>
              <p className="service-desc">Enjoy authentic company guarantees, lightning-fast replacement parts directly from Falcon and Tormac factories, and extended service contracts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           7. WHY CHOOSE US
           ========================================== */}
      <section className="why-choose-us" id="why-choose-us" ref={sectionRefs['why-choose-us']}>
        <div className="container">
          <div className="why-grid">
            <div className="why-content">
              <span className="section-tag">Why Choose Us</span>
              <h2 className="section-title">An Uncompromising Commitment to Flow</h2>
              <p className="section-subtitle" style={{ marginBottom: '30px' }}>For 15+ years, we have built absolute trust across residential, agricultural, and industrial segments by delivering genuine equipment backed by precise technical logic.</p>
              
              <div className="why-features-list">
                <div className="why-feature-card">
                  <div className="why-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1.5 1.5A.5.5 0 0 0 1 2v12a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V2a.5.5 0 0 0-.5-.5zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z"/>
                      <path d="M11.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 1 1 4.9 0A2.5 2.5 0 0 1 9.05 3M8 5a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5A.5.5 0 0 1 8 5"/>
                    </svg>
                  </div>
                  <div className="why-feature-content">
                    <h3 className="why-feature-title">Authorized Falcon & Tormac Dealer</h3>
                    <p className="why-feature-desc">Guaranteed authentic components, factory testing validations, and warranty protection cards straight from the manufacturer.</p>
                  </div>
                </div>
                
                <div className="why-feature-card">
                  <div className="why-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                    </svg>
                  </div>
                  <div className="why-feature-content">
                    <h3 className="why-feature-title">Quality Assured Products & Extended Care</h3>
                    <p className="why-feature-desc">Every pump batch undergoes stringent inspection protocols before getting dispatched to customer projects.</p>
                  </div>
                </div>

                <div className="why-feature-card">
                  <div className="why-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 1 1 4.9 0A2.5 2.5 0 0 1 9.05 3M3.5 1.5a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V2a.5.5 0 0 0-.5-.5zM2 2a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
                    </svg>
                  </div>
                  <div className="why-feature-content">
                    <h3 className="why-feature-title">Expert Technical Support & Setup Guidance</h3>
                    <p className="why-feature-desc">Direct line access to fluid engineering specialists for prompt structural guidance and pump-shed designs.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="why-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Authentic Dealer</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">5k+</span>
                  <span className="stat-label">Pumps Installed</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">15+</span>
                  <span className="stat-label">Years Experience</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Active Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           8. INDUSTRIES SERVED
           ========================================== */}
      <section className="industries section-bg-light" id="industries" ref={sectionRefs.industries}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Sectors</span>
            <h2 className="section-title">Industries We Serve</h2>
            <p className="section-subtitle">Delivering high-tech pumping performance across diversified economic domains, meeting strict safety and efficiency regulations.</p>
          </div>
          
          <div className="industries-grid">
            <div className="industry-card">
              <div className="industry-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="industry-title">Residential</h3>
              <p className="industry-desc">Sleek, low-noise booster systems and domestic self-priming pumps for individual villas and multi-family high-rises.</p>
            </div>

            <div className="industry-card">
              <div className="industry-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <h3 className="industry-title">Agriculture</h3>
              <p className="industry-desc">High-discharge slim borewell and openwell submersible pumps for large scale irrigation crops and water storage channels.</p>
            </div>

            <div className="industry-card">
              <div className="industry-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="industry-title">Commercial Buildings</h3>
              <p className="industry-desc">Multi-stage water distribution systems and pressure booster skids for corporate complexes, hotels, and hospitals.</p>
            </div>

            <div className="industry-card">
              <div className="industry-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="industry-title">Manufacturing</h3>
              <p className="industry-desc">Chemical process pumps and heavy-duty high capacity centrifugal units for cooling loops, dye houses, and processing units.</p>
            </div>

            <div className="industry-card">
              <div className="industry-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="industry-title">Construction Projects</h3>
              <p className="industry-desc">Robust dewatering pumps and concrete curing pressure networks, built to withstand highly abrasive suspended sand and slurry particles.</p>
            </div>

            <div className="industry-card">
              <div className="industry-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="industry-title">Water Management</h3>
              <p className="industry-desc">High capacity raw intake pumps, booster line networks, and automated effluent treatment dosing pumps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           9. TESTIMONIALS SECTION
           ========================================== */}
      <section className="testimonials" id="testimonials" ref={sectionRefs.testimonials}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Reviews</span>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Read how our authentic pumps and expert support have helped residential houses, farming zones, and industrial sites keep flowing.</p>
          </div>
          
          <div className="testimonials-slider">
            <div className="testimonials-track" style={{ transform: `translateX(-${testimonialIndex * 100}%)`, display: 'flex', transition: 'transform 0.5s ease-in-out' }}>
              {testimonials.map((t, idx) => (
                <div key={idx} className="testimonial-slide" style={{ minWidth: '100%' }}>
                  <div className="testimonial-card">
                    <div className="testimonial-stars" style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#f97316" viewBox="0 0 16 16">
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="testimonial-quote">"{t.quote}"</p>
                    <div className="testimonial-client">
                      <span className="client-name">{t.client}</span>
                      <span className="client-designation">{t.designation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="slider-controls">
              <button 
                className="slider-arrow" 
                onClick={() => setTestimonialIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                aria-label="Previous Testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="slider-dots">
                {testimonials.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`slider-dot ${testimonialIndex === idx ? 'active' : ''}`}
                    onClick={() => setTestimonialIndex(idx)}
                  />
                ))}
              </div>
              <button 
                className="slider-arrow" 
                onClick={() => setTestimonialIndex(prev => (prev + 1) % testimonials.length)}
                aria-label="Next Testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
           10. GALLERY SECTION
           ========================================== */}
      <section className="gallery section-bg-light" id="gallery" ref={sectionRefs.gallery}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Showcase</span>
            <h2 className="section-title">Visual Gallery</h2>
            <p className="section-subtitle">A visual tour of our distribution setups, client installation sites, organized warehouse, and operational systems.</p>
          </div>
          
          <div className="gallery-grid">
            {galleryItems.map((item, idx) => (
              <div key={idx} className="gallery-item" onClick={() => openLightbox(item)}>
                <img src={item.src} alt={item.title} loading="lazy" onError={(e) => { e.target.src = '/assets/images/hero-bg.png' }} />
                <div className="gallery-overlay">
                  <span className="gallery-category">{item.category}</span>
                  <h3 className="gallery-title">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
           11. CONTACT SECTION (With AI Classifier)
           ========================================== */}
      <section className="contact" id="contact" ref={sectionRefs.contact} style={{ background: 'var(--primary)', color: 'white', padding: '100px 24px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span className="section-tag" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--accent)' }}>Get in Touch</span>
            <h2 className="section-title" style={{ color: 'white', fontSize: '2.5rem' }}>Let's Build Your Water Infrastructure Together</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>
              Whether you need to replace a field submersible pump, install a luxury constant pressure booster system, or consult on chemical process networks, we are here to support.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Call Support</span>
                  <strong style={{ fontSize: '1.1rem' }}>+91 73961 62006</strong>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Email Technical Desk</span>
                  <strong style={{ fontSize: '1.1rem' }}>rrems999@gmail.com</strong>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <form 
            onSubmit={handleContactSubmit} 
            style={{ backgroundColor: 'var(--primary-light)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-lg)' }}
          >
            <h3 style={{ color: 'white', marginBottom: '24px', fontSize: '1.5rem' }}>Send Message</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Your Name *" 
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <textarea 
                rows="4" 
                placeholder="Describe your fluid system or pump requirements... *" 
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', resize: 'vertical' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'block' }}>
                Note: Our Python backend will analyze your message text for urgency classifications (e.g. flagging emergencies).
              </span>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px 0' }}
              disabled={submittingContact}
            >
              {submittingContact ? 'Analyzing & Sending...' : 'Submit Message'}
            </button>
          </form>
        </div>
      </section>
        </>
      )}

      {currentView === 'login' && (
        <section className="login-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', padding: '120px 24px 80px 24px' }}>
          <div className="container" style={{ maxWidth: '450px', width: '100%' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-lg)' }}>
              <h2 className="section-title" style={{ color: 'white', fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>Portal Login</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                Sign in with your credentials to view your pump inquiry and service request history.
              </p>
              
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={loginForm.name}
                    onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Gmail Address *</label>
                  <input 
                    type="email" 
                    placeholder="yourname@gmail.com" 
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                    required
                  />
                </div>

                {loginError && (
                  <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', marginBottom: '20px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {loginError}
                  </div>
                )}
                
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px 0' }}>
                  Login
                </button>
              </form>
              {currentUser && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button 
                    onClick={() => setCurrentView('site')} 
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    &larr; Back to Website
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {currentView === 'portal' && (
        <section className="portal-section" style={{ minHeight: '80vh', background: 'var(--bg-light)', color: 'var(--text-dark)', padding: '120px 24px 80px 24px' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span className="section-tag" style={{ marginBottom: '8px' }}>Customer Space</span>
                <h2 className="section-title" style={{ margin: 0, color: 'var(--primary)' }}>Welcome, {currentUser?.name}!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Email ID: <strong>{currentUser?.email}</strong></p>
              </div>
              <button onClick={handleLogout} className="btn" style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Logout Session
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Pump Inquiries */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>Product Inquiries</h3>
                </div>

                {loadingHistory ? (
                  <p style={{ color: 'var(--text-muted)' }}>Loading history...</p>
                ) : userHistory.inquiries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {userHistory.inquiries.map((inq) => (
                      <div key={inq.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ color: 'var(--accent)' }}>{inq.productName}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(inq.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>{inq.message || 'No additional details provided.'}</p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Provided Phone: <strong>{inq.phone || 'N/A'}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>You have not submitted any product inquiries yet.</p>
                )}
              </div>

              {/* Service Requests */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>Service & Contact Messages</h3>
                </div>

                {loadingHistory ? (
                  <p style={{ color: 'var(--text-muted)' }}>Loading history...</p>
                ) : userHistory.contacts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {userHistory.contacts.map((c) => (
                      <div key={c.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'white', backgroundColor: c.analysis?.urgency === 'High' ? '#ef4444' : '#64748b', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {c.analysis?.category || 'General Message'} ({c.analysis?.urgency || 'Normal'})
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontStyle: 'italic' }}>"{c.message}"</p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Provided Phone: <strong>{c.phone || 'N/A'}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>You have not sent any contact messages yet.</p>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <button 
                onClick={() => setCurrentView('site')} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', textDecoration: 'underline' }}
              >
                &larr; Back to Website Homepage
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
           FOOTER
           ========================================== */}
      {currentUser && currentView !== 'login' && (
        <footer style={{ backgroundColor: 'var(--primary-dark)', color: 'rgba(255,255,255,0.5)', padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <strong style={{ color: 'white', fontSize: '1.2rem', display: 'block' }}>Raja Rajeshwara Engineerings</strong>
              <span style={{ fontSize: '0.8rem' }}>Authorized Falcon & Tormac Pumps Dealer</span>
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              &copy; {new Date().getFullYear()} Raja Rajeshwara Engineerings. All rights reserved. Full-stack connected.
            </p>
          </div>
        </footer>
      )}

      {/* ==========================================
           MODALS & OVERLAYS
           ========================================== */}
      
      {/* 1. Inquiry Modal Overlay */}
      {inquiryModalOpen && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ animation: 'slideUp 0.3s ease', maxWidth: '500px', width: '100%', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '32px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button className="modal-close" onClick={() => setInquiryModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Product Inquiry</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Request details/quotes for: <strong style={{ color: 'var(--accent)' }} id="inquiry-prod-display">{selectedProductForInquiry}</strong>
            </p>
            
            <form onSubmit={handleInquirySubmit}>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Your Name *" 
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="tel" 
                  placeholder="Phone Number *" 
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <textarea 
                  rows="3" 
                  placeholder="Add any installation or requirement details here..." 
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0' }}>Submit Inquiry</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Success Modal Overlay */}
      {successModalOpen && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '450px', width: '100%', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '40px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button className="modal-close" onClick={() => setSuccessModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            
            <div style={{ width: '60px', height: '60px', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '12px' }} id="success-title">{successContent.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }} id="success-msg">{successContent.message}</p>

            {/* WhatsApp CTA — use <a> not window.open so it is NEVER blocked by popup blockers */}
            {pendingWhatsAppUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <a
                  href={pendingWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '12px 28px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#25D366',
                    borderColor: '#25D366',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '1rem',
                    textDecoration: 'none'
                  }}
                  onClick={() => { setSuccessModalOpen(false); setPendingWhatsAppUrl(''); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.618-4.934c-.198-.1-.17-.33-.51-.43-.178-.1-.549-.27-.678-.32-.128-.05-.221-.08-.314.05-.093.13-.36.43-.442.52-.082.1-.164.11-.362.01-.2-.1-.843-.31-1.605-.99-.59-.53-.988-1.17-1.104-1.37-.116-.2-.012-.31.087-.41-.09-.09.198-.23.298-.35.1-.12.13-.2.2-.33.07-.13.035-.25-.018-.35-.054-.1-.482-1.16-.66-1.59-.174-.42-.365-.36-.502-.36-.13 0-.279-.01-.419-.01-.14 0-.368.05-.561.26-.193.21-.738.72-.738 1.76s.754 2.05 1.862 3.19c1.1 1.14 2.184 1.81 3.238 2.22c.983.39 1.48.34 1.838.29.397-.06.87-.36 1.02-.79c.15-.43.15-.8.1-.88-.05-.08-.19-.13-.388-.23"/>
                  </svg>
                  Send via WhatsApp
                </a>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                  onClick={() => { setSuccessModalOpen(false); setPendingWhatsAppUrl(''); }}
                >
                  Close
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" style={{ padding: '10px 24px' }} onClick={() => setSuccessModalOpen(false)}>
                Okay, Great
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Lightbox Modal Overlay */}
      {lightboxOpen && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.9)' }} onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-content" style={{ position: 'relative', maxWidth: '900px', width: '90%', maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: 'white' }}>&times;</button>
            <img 
              src={lightboxContent.src} 
              alt={lightboxContent.title} 
              style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '4px' }} 
              onError={(e) => { e.target.src = '/assets/images/hero-bg.png' }}
            />
            <p style={{ color: 'white', textAlign: 'center', marginTop: '16px', fontSize: '1.1rem', fontWeight: '500' }}>
              {lightboxContent.title} <span style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>({lightboxContent.category})</span>
            </p>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      {currentUser && currentView !== 'login' && (
        <a 
          href="https://wa.me/917396162006?text=Hi%2C%20I%20am%20interested%20in%20purchasing%20industrial%20pumps%20from%20Raja%20Rajeshwara%20Engineerings." 
          className="whatsapp-float" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Chat with us on WhatsApp" 
          id="whatsapp-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.618-4.934c-.198-.1-.17-.33-.51-.43-.178-.1-.549-.27-.678-.32-.128-.05-.221-.08-.314.05-.093.13-.36.43-.442.52-.082.1-.164.11-.362.01-.2-.1-.843-.31-1.605-.99-.59-.53-.988-1.17-1.104-1.37-.116-.2-.012-.31.087-.41-.09-.09.198-.23.298-.35.1-.12.13-.2.2-.33.07-.13.035-.25-.018-.35-.054-.1-.482-1.16-.66-1.59-.174-.42-.365-.36-.502-.36-.13 0-.279-.01-.419-.01-.14 0-.368.05-.561.26-.193.21-.738.72-.738 1.76s.754 2.05 1.862 3.19c1.1 1.14 2.184 1.81 3.238 2.22c.983.39 1.48.34 1.838.29.397-.06.87-.36 1.02-.79c.15-.43.15-.8.1-.88-.05-.08-.19-.13-.388-.23"/>
          </svg>
        </a>
      )}
    </div>
  );
}
