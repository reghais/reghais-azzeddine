/* ==========================================================================
   Dr. Azzeddine Reghais - Academic Portfolio
   Main JavaScript - Phases 1, 2 & 3: Portals, Themes & i18n Systems
   ========================================================================== */

(function () {
  'use strict';

  // Early setup & loading language & themes
  if (window.initTheme) window.initTheme();
  if (window.initLanguage) window.initLanguage();

  // Dynamic year in footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile menu toggle (accessible)
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    const iconOpen = mobileMenuBtn.querySelector('.fa-bars');
    const iconClose = mobileMenuBtn.querySelector('.fa-xmark');

    const toggleMenu = (forceState) => {
      const isOpen = typeof forceState === 'boolean'
        ? forceState
        : !mobileMenu.classList.contains('is-open');

      mobileMenu.classList.toggle('is-open', isOpen);
      mobileMenu.classList.toggle('hidden', !isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));

      if (iconOpen && iconClose) {
        iconOpen.classList.toggle('hidden', isOpen);
        iconClose.classList.toggle('hidden', !isOpen);
      }
    };

    mobileMenuBtn.addEventListener('click', () => toggleMenu());

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        toggleMenu(false);
        mobileMenuBtn.focus();
      }
    });
  }

  // Header shadow on scroll
  const header = document.querySelector('header');
  if (header) {
    const handleScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Scroll-triggered fade-in animations
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in-up, .stagger-children').forEach((el) => {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-in-up, .stagger-children').forEach((el) => {
      el.classList.add('is-visible');
    });
  }

  // Hero canvas: water particles animation
  const canvas = document.getElementById('hydroCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    class WaterParticle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 4 + 1.5;
        this.speed = Math.random() * 0.7 + 0.3;
        this.opacity = Math.random() * 0.35 + 0.15;
        this.wiggleSpeed = Math.random() * 0.02 + 0.005;
        this.angle = Math.random() * Math.PI * 2;
      }
      update() {
        this.y -= this.speed;
        this.angle += this.wiggleSpeed;
        this.x += Math.sin(this.angle) * 0.35;
        if (this.y < -20) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = window.innerWidth < 640 ? 25 : 45;
      for (let i = 0; i < particleCount; i++) particles.push(new WaterParticle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    resizeCanvas();
    initParticles();
    animate();
  }

  /* ------------------------------------------------------------------------
     Contact Form: submission handling with Formspree + graceful fallback
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('.form-submit');
    const messageBox = document.getElementById('formMessage');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

    const showMessage = (text, type) => {
      if (!messageBox) return;
      messageBox.textContent = text;
      messageBox.className = 'form-message is-visible is-' + type;
      // Auto-hide after 6s
      setTimeout(() => {
        messageBox.classList.remove('is-visible');
      }, 6000);
    };

    const setLoading = (loading) => {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      if (btnText) btnText.classList.toggle('hidden', loading);
      if (btnSpinner) btnSpinner.classList.toggle('hidden', !loading);
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const endpoint = contactForm.getAttribute('action');
      const isFormspree = endpoint && endpoint.includes('formspree.io');

      // If no Formspree endpoint is set, fall back to mailto
      if (!isFormspree) {
        const name = formData.get('name') || '';
        const email = formData.get('email') || '';
        const subject = formData.get('subject') || 'Contact from portfolio';
        const message = formData.get('message') || '';
        const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
        window.location.href = `mailto:azzeddine.reghais@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
        showMessage('Opening your email client...', 'success');
        return;
      }

      // Formspree AJAX submission
      setLoading(true);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          showMessage('Thank you! Your message has been sent successfully.', 'success');
          contactForm.reset();
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMsg = data && data.errors ? data.errors.map(e => e.message).join(', ') : 'Something went wrong. Please try again.';
          showMessage(errorMsg, 'error');
        }
      } catch (err) {
        showMessage('Network error. Please check your connection and try again.', 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Student Portal System: Schedule, Files & Appointments
     ------------------------------------------------------------------------ */

  // Switch Portal Tabs
  window.switchPortalTab = function (tabId) {
    // Hide all tab contents
    document.querySelectorAll('.portal-tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    // Remove active style classes from tab buttons
    document.querySelectorAll('.portal-tab-btn').forEach(btn => {
      btn.classList.remove('border-primary-600', 'dark:border-primary-400', 'text-primary-600', 'dark:text-primary-400');
      btn.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-800', 'dark:hover:text-slate-200');
    });

    // Show selected content
    const selectedContent = document.getElementById('portal-' + tabId);
    if (selectedContent) {
      selectedContent.classList.remove('hidden');
    }

    // Add active style to matching btn
    let activeBtnId = '';
    if (tabId === 'schedule') activeBtnId = 'tabScheduleBtn';
    if (tabId === 'files') activeBtnId = 'tabFilesBtn';
    if (tabId === 'booking') activeBtnId = 'tabBookingBtn';

    const activeBtn = document.getElementById(activeBtnId);
    if (activeBtn) {
      activeBtn.classList.add('border-primary-600', 'dark:border-primary-400', 'text-primary-600', 'dark:text-primary-400');
      activeBtn.classList.remove('border-transparent', 'text-slate-500', 'hover:text-slate-800', 'dark:hover:text-slate-200');
    }
  };

  // Lecture Files Module
  const defaultFiles = [
    { id: 1, name: "Lecture_01_Introduction_to_Hydrogeology.pdf", size: "4.2 MB", type: "PDF" },
    { id: 2, name: "Lecture_02_Aquifers_and_Geological_Formations.pdf", size: "3.8 MB", type: "PDF" },
    { id: 3, name: "GIS_Lab_Project_01_Terrain_Modelling.zip", size: "12.5 MB", type: "ZIP" },
    { id: 4, name: "Syllabus_Hydrogeology_and_Water_Conservation.docx", size: "520 KB", type: "DOCX" }
  ];

  function getUploadedFiles() {
    const saved = localStorage.getItem('portfolio-student-files');
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultFiles;
  }

  function saveUploadedFiles(files) {
    localStorage.setItem('portfolio-student-files', JSON.stringify(files));
  }

  function renderFiles() {
    const listBody = document.getElementById('lectureFilesListBody');
    if (!listBody) return;

    const files = getUploadedFiles();
    listBody.innerHTML = '';

    if (files.length === 0) {
      listBody.innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-8 text-center text-slate-400 italic" data-i18n="files-no-files">
            No materials uploaded yet.
          </td>
        </tr>
      `;
      return;
    }

    const currentLang = localStorage.getItem('portfolio-lang') || 'en';

    files.forEach(file => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors duration-150';

      const fileIcon = file.type === 'PDF' ? 'fa-file-pdf text-red-500'
                     : file.type === 'ZIP' ? 'fa-file-zipper text-amber-500'
                     : 'fa-file-word text-blue-500';

      tr.innerHTML = `
        <td class="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <i class="fa-solid ${fileIcon} text-lg" aria-hidden="true"></i>
          <span>${file.name}</span>
        </td>
        <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${file.size}</td>
        <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${file.type}</td>
        <td class="px-6 py-4 text-center">
          <button onclick="simulateDownload('${file.name}')" class="px-3 py-1 bg-primary-900 dark:bg-primary-600 hover:bg-primary-800 dark:hover:bg-primary-500 text-white font-bold text-xs rounded-lg transition-all">
            <i class="fa-solid fa-download mr-1" aria-hidden="true"></i>
            <span data-i18n="files-download-btn">${currentLang === 'ar' ? 'تحميل' : 'Download'}</span>
          </button>
        </td>
      `;
      listBody.appendChild(tr);
    });
  }

  window.simulateDownload = function (filename) {
    alert(`Simulating download for resource: ${filename}`);
  };

  // Upload Simulation
  const dragZone = document.getElementById('fileDragZone');
  const fileSelectorInput = document.getElementById('fileSelectorInput');

  if (dragZone && fileSelectorInput) {
    dragZone.addEventListener('click', () => {
      fileSelectorInput.click();
    });

    dragZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dragZone.classList.add('dragover');
    });

    dragZone.addEventListener('dragleave', () => {
      dragZone.classList.remove('dragover');
    });

    dragZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dragZone.classList.remove('dragover');
      handleSelectedFiles(e.dataTransfer.files);
    });

    fileSelectorInput.addEventListener('change', (e) => {
      handleSelectedFiles(e.target.files);
    });
  }

  function handleSelectedFiles(filesList) {
    if (filesList.length === 0) return;
    const currentFiles = getUploadedFiles();

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const extension = file.name.split('.').pop().toUpperCase();
      const mockSize = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      currentFiles.push({
        id: Date.now() + i,
        name: file.name,
        size: mockSize,
        type: ['PDF', 'ZIP', 'DOCX', 'XLSX', 'PPTX'].includes(extension) ? extension : 'PDF'
      });
    }

    saveUploadedFiles(currentFiles);
    renderFiles();
  }

  // Appointment Booking Module
  function getBookings() {
    const saved = localStorage.getItem('portfolio-student-bookings');
    return saved ? JSON.parse(saved) : [];
  }

  function saveBookings(bookings) {
    localStorage.setItem('portfolio-student-bookings', JSON.stringify(bookings));
  }

  function renderBookings() {
    const bookingsContainer = document.getElementById('activeBookingsContainer');
    if (!bookingsContainer) return;

    const bookings = getBookings();
    bookingsContainer.innerHTML = '';

    const currentLang = localStorage.getItem('portfolio-lang') || 'en';

    if (bookings.length === 0) {
      bookingsContainer.innerHTML = `
        <div class="h-full flex items-center justify-center py-12 text-slate-400 italic text-sm" data-i18n="booking-no-bookings">
          ${currentLang === 'ar' ? 'ليس لديك أي حجوزات نشطة حالياً.' : 'No active bookings registered.'}
        </div>
      `;
      return;
    }

    bookings.forEach((booking) => {
      const card = document.createElement('div');
      card.className = 'p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-4 transition-all duration-300';

      const purposeText = window.translations[currentLang]["purpose-" + booking.purpose] || booking.purpose;

      card.innerHTML = `
        <div class="space-y-1">
          <p class="font-bold text-slate-900 dark:text-slate-100 text-sm">${booking.name}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">${booking.email}</p>
          <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span class="inline-flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
              <i class="fa-regular fa-clock" aria-hidden="true"></i> ${booking.slot}
            </span>
            <span class="text-slate-300 dark:text-slate-700">|</span>
            <span class="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <i class="fa-regular fa-calendar" aria-hidden="true"></i> ${booking.date}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 italic pt-1">${purposeText}</p>
        </div>
        <button onclick="cancelBooking(${booking.id})" class="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 flex items-center gap-1">
          <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
          <span data-i18n="booking-cancel">${currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</span>
        </button>
      `;
      bookingsContainer.appendChild(card);
    });
  }

  window.cancelBooking = function (bookingId) {
    const bookings = getBookings().filter(b => b.id !== bookingId);
    saveBookings(bookings);
    renderBookings();
  };

  const bookingForm = document.getElementById('portalBookingForm');
  if (bookingForm) {
    const feedbackBox = document.getElementById('portalBookingFormMessage');

    const showFeedback = (text, type) => {
      if (!feedbackBox) return;
      feedbackBox.textContent = text;
      feedbackBox.className = 'form-message is-visible is-' + type;
      setTimeout(() => {
        feedbackBox.classList.remove('is-visible');
      }, 5000);
    };

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('pb-name');
      const emailInput = document.getElementById('pb-email');
      const purposeInput = document.getElementById('pb-purpose');
      const dateInput = document.getElementById('pb-date');
      const slotInput = document.getElementById('pb-slot');
      const detailsInput = document.getElementById('pb-details');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const purpose = purposeInput ? purposeInput.value : '';
      const date = dateInput ? dateInput.value : '';
      const slot = slotInput ? slotInput.value : '';
      const details = detailsInput ? detailsInput.value.trim() : '';

      const currentLang = localStorage.getItem('portfolio-lang') || 'en';

      if (!name || !email || !purpose || !date || !slot) {
        showFeedback(
          currentLang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.' : 'Please fill out all required fields.',
          'error'
        );
        return;
      }

      const bookings = getBookings();
      bookings.push({
        id: Date.now(),
        name,
        email,
        purpose,
        date,
        slot,
        details
      });

      saveBookings(bookings);
      bookingForm.reset();
      showFeedback(
        currentLang === 'ar' ? 'تم حجز الموعد بنجاح واهتمام!' : 'Appointment booked successfully!',
        'success'
      );
      renderBookings();
    });
  }

  // Re-render components if language selection changes
  document.addEventListener('languageChanged', () => {
    renderFiles();
    renderBookings();
  });

  // Run initial renders
  renderFiles();
  renderBookings();

})();
