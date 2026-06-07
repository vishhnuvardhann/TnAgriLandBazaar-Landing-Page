/* ========================================
   TN AGRI LAND BAZAAR — Landing Page JS
   Interactions, Translations, Form Handling
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Navbar Scroll Effect ─────────────────────
  const topbar = document.getElementById('topbar');

  const handleScroll = () => {
    if (window.scrollY > 60) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ─── Mobile Navigation ────────────────────────
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.getElementById('mobile-nav-close');
  const mobileLinks = mobileNav.querySelectorAll('.mobile-nav__link');

  mobileToggle.addEventListener('click', () => {
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeMobileNav = () => {
    mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  };

  mobileClose.addEventListener('click', closeMobileNav);
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));

  // ─── Smooth Scroll for Anchors ────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = topbar.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── Scroll Reveal Animations ─────────────────
  const revealElements = document.querySelectorAll('.reveal, .stagger');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ─── Translation Engine ────────────────────────
  let currentLang = localStorage.getItem('tn_agri_lang') || 'ta';

  const updateTranslations = (lang) => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
        el.innerHTML = TRANSLATIONS[key][lang];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
        el.placeholder = TRANSLATIONS[key][lang];
      }
    });

    // Update active class on toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
  };

  // Wire up language toggles
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedLang = e.target.dataset.lang;
      currentLang = selectedLang;
      localStorage.setItem('tn_agri_lang', selectedLang);
      updateTranslations(selectedLang);
    });
  });

  // Initial translation check
  if (typeof TRANSLATIONS !== 'undefined') {
    updateTranslations(currentLang);
  }

  // ─── Form Validation & Submission ─────────────
  const leadForm = document.getElementById('lead-form');
  const successModal = document.getElementById('success-modal');
  const modalClose = document.getElementById('modal-close');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const whatsapp = document.getElementById('form-whatsapp').value.trim();
      const district = document.getElementById('form-district').value.trim();
      const taluk = document.getElementById('form-taluk').value.trim();
      
      const checkedLandTypeInput = document.querySelector('input[name="land_type"]:checked');
      const landType = checkedLandTypeInput ? checkedLandTypeInput.value : '';

      // Basic validation
      if (!name || !whatsapp || !district || !taluk || !landType) {
        shakeForm(leadForm);
        return;
      }

      // Phone validation (basic)
      const phoneRegex = /^[\+]?[0-9\s\-]{10,15}$/;
      if (!phoneRegex.test(whatsapp.replace(/\s/g, ''))) {
        const input = document.getElementById('form-whatsapp');
        input.style.borderColor = '#ef4444';
        input.focus();
        setTimeout(() => { input.style.borderColor = ''; }, 2000);
        return;
      }

      // Show loading state
      const submitBtn = document.getElementById('form-submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = currentLang === 'ta' 
        ? '<span class="btn-icon">⏳</span> WhatsApp திறக்கிறது...' 
        : '<span class="btn-icon">⏳</span> Opening WhatsApp...';
      submitBtn.disabled = true;

      // Localized labels for land type
      let landTypeLabel = landType;
      if (landType === 'agricultural') {
        landTypeLabel = currentLang === 'ta' ? 'விவசாய நிலம்' : 'Agriculture Land';
      } else if (landType === 'dry') {
        landTypeLabel = currentLang === 'ta' ? 'காலி நிலம்' : 'Vacant Land';
      }

      // Build WhatsApp message with form data (Localized!)
      let message = '';
      if (currentLang === 'ta') {
        message = [
          `வணக்கம் டிஎன் அக்ரி லேண்ட் பஜார், எனக்கு இலவச நில மதிப்பு பகுப்பாய்வு அறிக்கை வேண்டும்.`,
          ``,
          `📋 *எனது விவரங்கள்:*`,
          `• பெயர்: ${name}`,
          `• மொபைல் எண்: ${whatsapp}`,
          `• மாவட்டம்: ${district}`,
          `• தாலுகா: ${taluk}`,
          `• நிலத்தின் வகை: ${landTypeLabel}`,
          ``,
          `இலவச அறிக்கையை என்னுடன் பகிர்ந்து கொள்ளவும். நன்றி!`
        ].join('\n');
      } else {
        message = [
          `Hi TN Agri Land Bazaar, I'd like a Free Land Value Analysis Report.`,
          ``,
          `📋 *My Details:*`,
          `• Name: ${name}`,
          `• Mobile Number: ${whatsapp}`,
          `• District: ${district}`,
          `• Taluk: ${taluk}`,
          `• Land Type: ${landTypeLabel}`,
          ``,
          `Please share my free report. Thank you!`
        ].join('\n');
      }

      const whatsappUrl = `https://wa.me/919047252553?text=${encodeURIComponent(message)}`;

      // Short delay for UX, then open WhatsApp & show modal
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        leadForm.reset();

        // Show success modal
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }, 800);
    });
  }

  function shakeForm(form) {
    form.style.animation = 'none';
    form.offsetHeight; // trigger reflow
    form.style.animation = 'shake 0.5s ease-out';
    setTimeout(() => { form.style.animation = ''; }, 500);
  }

  // Add shake keyframes
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  // Modal close
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ─── Video Play Button / Drone Showcase Interaction ───
  const vslVideo = document.getElementById('vsl-video');
  if (vslVideo) {
    vslVideo.addEventListener('click', () => {
      const playBtn = vslVideo.querySelector('.vsl__play-btn');
      if (playBtn) playBtn.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => {
        if (playBtn) playBtn.style.transform = '';
        alert(currentLang === 'ta' 
          ? 'ட்ரோன் வீடியோ விரைவில் வருகிறது! மேலும் விவரங்களுக்கு ரெங்கராஜனை அழைக்கவும்: +91 90472 52553' 
          : 'Drone showcase video coming soon! Call Rengarajan directly for details: +91 90472 52553');
      }, 300);
    });
  }

  // ─── Parallax Effect on Hero ──────────────────
  const heroGlows = document.querySelectorAll('.hero__glow');

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    heroGlows.forEach((glow, i) => {
      const factor = i === 0 ? 1 : -0.7;
      glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  }, { passive: true });

  // ─── Keyboard Navigation (ESC closes modals) ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (successModal && successModal.classList.contains('active')) {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
      }
      if (mobileNav && mobileNav.classList.contains('active')) {
        closeMobileNav();
      }
    }
  });

  // ─── Step Cards Tilt Effect ───────────────────
  const stepCards = document.querySelectorAll('.step-card, .benefit-card');

  stepCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ─── Console Easter Egg ───────────────────────
  console.log(
    '%c🌾 TN Agri Land Bazaar — Built with ❤️ for Agriculture & Dry Land owners',
    'font-size: 14px; color: #f59e0b; font-weight: bold;'
  );

});
