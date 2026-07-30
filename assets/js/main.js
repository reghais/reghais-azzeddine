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

  // Switch Publications Tabs (Articles & Books)
  window.switchPubTab = function (tabId) {
    // Hide all publications contents
    document.querySelectorAll('#publications .pub-tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    // Remove active styles from publication buttons
    const btnArticles = document.getElementById('tabPubArticlesBtn');
    const btnBooks = document.getElementById('tabPubBooksBtn');

    if (btnArticles && btnBooks) {
      btnArticles.className = "w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";
      btnBooks.className = "w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";
    }

    // Show active content
    const selectedContent = document.getElementById('pub-' + tabId + '-tab');
    if (selectedContent) {
      selectedContent.classList.remove('hidden');
    }

    // Apply active style
    const activeBtn = document.getElementById(tabId === 'articles' ? 'tabPubArticlesBtn' : 'tabPubBooksBtn');
    if (activeBtn) {
      activeBtn.className = "w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all bg-white dark:bg-slate-900 text-primary-700 dark:text-primary-300 shadow-sm";
    }
  };

  // Switch Conference Tabs (Separating International & National)
  window.switchConfTab = function (tabId) {
    // Hide all conference contents
    document.querySelectorAll('.conf-tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    // Remove active styles from conference buttons
    const btnInt = document.getElementById('tabConfIntBtn');
    const btnNat = document.getElementById('tabConfNatBtn');

    if (btnInt && btnNat) {
      btnInt.className = "w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";
      btnNat.className = "w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";
    }

    // Show active content
    const selectedContent = document.getElementById('conf-' + tabId);
    if (selectedContent) {
      selectedContent.classList.remove('hidden');
    }

    // Apply active style
    const activeBtn = document.getElementById(tabId === 'international' ? 'tabConfIntBtn' : 'tabConfNatBtn');
    if (activeBtn) {
      activeBtn.className = "w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all bg-white dark:bg-slate-900 text-primary-700 dark:text-primary-300 shadow-sm";
    }
  };

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

  // Research Slideshow controller
  let currentSlideIdx = 0;
  const slides = document.querySelectorAll('.research-slide');
  const slideDots = document.querySelectorAll('.slide-dot');

  window.goToSlide = function (idx) {
    if (!slides || slides.length === 0) return;
    currentSlideIdx = (idx + slides.length) % slides.length;

    slides.forEach((slide, sIdx) => {
      if (sIdx === currentSlideIdx) {
        slide.classList.remove('opacity-0', 'pointer-events-none');
        slide.classList.add('opacity-100');
      } else {
        slide.classList.add('opacity-0', 'pointer-events-none');
        slide.classList.remove('opacity-100');
      }
    });

    slideDots.forEach((dot, dIdx) => {
      if (dIdx === currentSlideIdx) {
        dot.className = "slide-dot w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 transition-all cursor-pointer";
      } else {
        dot.className = "slide-dot w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 transition-all cursor-pointer";
      }
    });
  };

  window.nextSlide = function () {
    goToSlide(currentSlideIdx + 1);
  };

  window.prevSlide = function () {
    goToSlide(currentSlideIdx - 1);
  };

  // Auto rotate slides every 5 seconds
  let slideInterval = setInterval(nextSlide, 5000);

  // Clear interval if user interacts
  const slideContainer = document.querySelector('.lg\\:col-span-5');
  if (slideContainer) {
    slideContainer.addEventListener('click', () => {
      clearInterval(slideInterval);
    });
  }

  // Conferences Dynamic Render
  const internationalConferences = [
    {
      title_en: "Risk assessment of Heavy Metals in the Complex Terminal aquifer data from biskra, south-est Algeria",
      title_ar: "تقييم مخاطر المعادن الثقيلة في بيانات طبقة المياه الجوفية الطرفية المعقدة من بسكرة، جنوب شرق الجزائر",
      contrib_en: "Azzeddine REGHAIS, Abdelmalek DROUICHE, Zahi FAOUZI",
      contrib_ar: "عز الدين رغيس، عبد المالك درويش، زاهي فوزي",
      venue_en: "VI International Symposium on Biosphere Safety and Environmental Safety, Budapest, Hungary (2022)",
      venue_ar: "الندوة الدولية السادسة حول سلامة الغلاف الجوي والسلامة البيئية، بودابست، المجر (2022)",
      url: "https://kti.rkk.uni-obuda.hu/vi-international-2022-symposium-biosphere-on-online-safety-environmental/"
    },
    {
      title_en: "Evaluation of the salinity of groundwater used in irrigation and its risks on agricultural areas: Region of El Ghrous (Biskra, Algeria)",
      title_ar: "تقييم ملوحة المياه الجوفية المستخدمة في الري ومخاطرها على المناطق الزراعية: منطقة الغروس (بسكرة، الجزائر)",
      contrib_en: "Azzeddine REGHAIS, Abdelmalek DROUICHE, Zahi FAOUZI",
      contrib_ar: "عز الدين رغيس، عبد المالك درويش، زاهي فوزي",
      venue_en: "Published / Presented in Larhyss Journal Symposium, Biskra, Algeria (2021)",
      venue_ar: "منشور ومقدم في ندوة مجلة لارهيس، بسكرة، الجزائر (2021)",
      url: "https://lab.univ-biskra.dz/Larhyss/index.php/larhyssjournal"
    },
    {
      title_en: "Evaluation of groundwater quality by heavy metal contamination indices (Biskra, north-east Algeria)",
      title_ar: "تقييم جودة المياه الجوفية باستخدام مؤشرات تلوث المعادن الثقيلة (بسكرة، شمال شرق الجزائر)",
      contrib_en: "Azzeddine REGHAIS, Abdelmalek DROUICHE, Zahi FAOUZI",
      contrib_ar: "عز الدين رغيس، عبد المالك درويش، زاهي فوزي",
      venue_en: "Presented at Khenchela University Scientific Conference, Algeria (2022)",
      venue_ar: "مقدم في المؤتمر العلمي لجامعة خنشلة، الجزائر (2022)",
      url: "https://univ-khenchela.com/"
    },
    {
      title_en: "Contribution à l'étude du dimensionnement des périmètres de protection du Lac du Barrage de Fontaine des Gazelles (Wilaya Biskra, sud-est Algérien)",
      title_ar: "المساهمة في دراسة أبعاد محيطات حماية بحيرة سد نافورة الغزلان (ولاية بسكرة، الجنوب الشرقي الجزائري)",
      contrib_en: "Azzeddine REGHAIS, Abdelmalek DROUICHE, etc.",
      contrib_ar: "عز الدين رغيس، عبد المالك درويش، إلخ.",
      venue_en: "Presented at Batna 2 University Conference, Algeria (2020)",
      venue_ar: "مقدم في مؤتمر جامعة باتنة 2، الجزائر (2020)",
      url: "https://univ-batna2.dz"
    },
    {
      title_en: "Assessment of groundwater quality through heavy metal contamination indices in Biskra, North-East Algeria",
      title_ar: "تقييم جودة المياه الجوفية من خلال مؤشرات تلوث المعادن الثقيلة في بسكرة، شمال شرق الجزائر",
      contrib_en: "Azzeddine REGHAIS, Abdelmalek DROUICHE, etc.",
      contrib_ar: "عز الدين رغيس، عبد المالك درويش، إلخ.",
      venue_en: "El Oued University Symposium, Algeria (2023)",
      venue_ar: "ندوة جامعة الوادي، الجزائر (2023)",
      url: "https://shorturl.at/72QZ2"
    },
    {
      title_en: "Assessment of the groundwater agricultural pollution risk: a case of a semi-arid region (Batna-East Algeria)",
      title_ar: "تقييم مخاطر التلوث الزراعي للمياه الجوفية: حالة منطقة شبه قاحلة (باتنة - شرق الجزائر)",
      contrib_en: "Azzeddine REGHAIS, etc.",
      contrib_ar: "عز الدين رغيس، إلخ.",
      venue_en: "MEDGU Annual Meeting, Barcelona, Catalonia, Spain (2024)",
      venue_ar: "الاجتماع السنوي لـ MEDGU، برشلونة، كاتالونيا، إسبانيا (2024)",
      url: "https://2024.medgu.org/index.php?p=welcome"
    },
    {
      title_en: "Geochemical controlling mechanisms and groundwater quality of the Terminal Complex aquifer in Biskra region, Northeastern Algeria",
      title_ar: "آليات التحكم الجيوكيميائية وجودة المياه الجوفية لطبقة المياه الجوفية الطرفية المعقدة في منطقة بسكرة، شمال شرق الجزائر",
      contrib_en: "Azzeddine REGHAIS, Abdelmalek DROUICHE, etc.",
      contrib_ar: "عز الدين رغيس، عبد المالك درويش، إلخ.",
      venue_en: "Presented at Blida University Symposium, Algeria (2024)",
      venue_ar: "مقدم في ندوة جامعة البليدة، الجزائر (2024)",
      url: "https://shorturl.at/OXIQ9"
    }
  ];

  const nationalConferences = [
    {
      title_en: "Landslide of the RN 77, PK 23+100, commune of Texenna (Wilaya of Jijel, Algeria): stability and comfort",
      title_ar: "انزلاق التربة على الطريق الوطني 77، النقطة الكيلومترية 23+100، بلدية تكسانة (ولاية جيجل، الجزائر): الاستقرار والراحة والميكانيكا المطبقة",
      contrib_en: "Abdelhamid Khedidja, Brahim Lecheheb, Azzeddine Reghais",
      contrib_ar: "عبد الحميد خديجة، براهيم لشحب، عز الدين رغيس",
      venue_en: "Presented at University Center of Mila, Algeria (2020)",
      venue_ar: "مقدم في المركز الجامعي بميلة، الجزائر (2020)",
      url: "http://www.centre-univ-mila.dz/?lang=en"
    },
    {
      title_en: "Niveaux de salinité et risques associés dans les eaux souterraines utilisées pour l'irrigation",
      title_ar: "مستويات الملوحة والمخاطر المصاحبة لها في المياه الجوفية المستخدمة في الري",
      contrib_en: "Azzeddine Reghais, etc.",
      contrib_ar: "عز الدين رغيس، إلخ.",
      venue_en: "National Seminar at University of Jijel, Algeria (2024)",
      venue_ar: "الملتقى الوطني بجامعة جيجل، الجزائر (2024)",
      url: "https://2u.pw/vI2md"
    },
    {
      title_en: "Assessment of groundwater salinity levels used for irrigation purpose and the corresponding risks: A case study of the El-Ghrous region",
      title_ar: "تقييم مستويات ملوحة المياه الجوفية المستخدمة لأغراض الري والمخاطر المقابلة لها: دراسة حالة لمنطقة الغروس",
      contrib_en: "Azzeddine Reghais, Abdelmalek Drouiche, etc.",
      contrib_ar: "عز الدين رغيس، عبد المالك درويش، إلخ.",
      venue_en: "Presented at University of Oum El Bouaghi, Algeria (2024)",
      venue_ar: "مقدم في جامعة أم البواقي، الجزائر (2024)",
      url: "https://www.univ-oeb.dz/vrlex/en/2024/9451/"
    },
    {
      title_en: "Groundwater Quality Assessment for Sustainable Drinking Water and Irrigation in the Remila Plain, Northeastern Khenchela",
      title_ar: "تقييم جودة المياه الجوفية لمياه الشرب والري المستدامين في سهل الرميلة، شمال شرق خنشلة",
      contrib_en: "Azzeddine Reghais, etc.",
      contrib_ar: "عز الدين رغيس، إلخ.",
      venue_en: "Presented at University of Batna 2, Algeria (2025)",
      venue_ar: "مقدم في جامعة باتنة 2، الجزائر (2025)",
      url: "https://shorturl.at/ndCgS"
    },
    {
      title_en: "The impact of climatic conditions on water quality indexes in arid regions of agricultural areas",
      title_ar: "تأثير الظروف المناخية على مؤشرات جودة المياه في المناطق القاحلة بالمساحات الزراعية",
      contrib_en: "Azzeddine Reghais, Abdelmalek Drouiche, etc.",
      contrib_ar: "عز الدين رغيس، عبد المالك درويش، إلخ.",
      venue_en: "National Seminar at University Center of Mila, Algeria (2024)",
      venue_ar: "الملتقى الوطني بالمركز الجامعي بميلة، الجزائر (2024)",
      url: "https://www.centre-univ-mila.dz"
    }
  ];

  function renderConferences() {
    const intList = document.getElementById('international-conferences-list');
    const natList = document.getElementById('national-conferences-list');
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';

    if (intList) {
      intList.innerHTML = '';
      internationalConferences.forEach(conf => {
        const title = currentLang === 'ar' ? conf.title_ar : conf.title_en;
        const contrib = currentLang === 'ar' ? conf.contrib_ar : conf.contrib_en;
        const venue = currentLang === 'ar' ? conf.venue_ar : conf.venue_en;
        const btnText = currentLang === 'ar' ? "اطلب النسخة/الملخص عبر واتساب" : "Request Abstract via WhatsApp";
        const waMsg = encodeURIComponent(`مرحباً الدكتور عز الدين رغيس، أود طلب نسخة/ملخص ورقتكم العلمية المقدمة في الملتقى بعنوان:\n"${title}"`);

        const article = document.createElement('article');
        article.className = "bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-700";
        article.innerHTML = `
          <div class="flex flex-col md:flex-row justify-between gap-4">
              <div class="space-y-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                      <i class="fa-solid fa-globe mr-1.5" aria-hidden="true"></i> <span>${currentLang === 'ar' ? 'ملتقى دولي' : 'International Conference'}</span>
                  </span>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">${title}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400"><span class="font-medium">${currentLang === 'ar' ? 'المساهمون:' : 'Contributors:'}</span> ${contrib}</p>
                  <p class="text-sm text-slate-600 dark:text-slate-400 italic font-medium"><i class="fa-regular fa-calendar mr-1.5" aria-hidden="true"></i> <span>${venue}</span></p>
              </div>
              <div class="flex-shrink-0 flex flex-wrap gap-2 items-start">
                  <a href="https://wa.me/213668261708?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-100 dark:border-emerald-800 text-xs font-semibold rounded-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-all">
                      <i class="fa-brands fa-whatsapp text-emerald-600 text-sm" aria-hidden="true"></i> <span>${btnText}</span>
                  </a>
                  <a href="${conf.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-100 dark:border-slate-800 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 transition-all">
                      <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i> <span>Website</span>
                  </a>
              </div>
          </div>
        `;
        intList.appendChild(article);
      });
    }

    if (natList) {
      natList.innerHTML = '';
      nationalConferences.forEach(conf => {
        const title = currentLang === 'ar' ? conf.title_ar : conf.title_en;
        const contrib = currentLang === 'ar' ? conf.contrib_ar : conf.contrib_en;
        const venue = currentLang === 'ar' ? conf.venue_ar : conf.venue_en;
        const btnText = currentLang === 'ar' ? "اطلب النسخة/الملخص عبر واتساب" : "Request Abstract via WhatsApp";
        const waMsg = encodeURIComponent(`مرحباً الدكتور عز الدين رغيس، أود طلب نسخة/ملخص ورقتكم العلمية المقدمة في الملتقى بعنوان:\n"${title}"`);

        const article = document.createElement('article');
        article.className = "bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700";
        article.innerHTML = `
          <div class="flex flex-col md:flex-row justify-between gap-4">
              <div class="space-y-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      <i class="fa-solid fa-flag mr-1.5" aria-hidden="true"></i> <span>${currentLang === 'ar' ? 'ملتقى وطني' : 'National Seminar'}</span>
                  </span>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">${title}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400"><span class="font-medium">${currentLang === 'ar' ? 'المساهمون:' : 'Contributors:'}</span> ${contrib}</p>
                  <p class="text-sm text-slate-600 dark:text-slate-400 italic font-medium"><i class="fa-regular fa-calendar mr-1.5" aria-hidden="true"></i> <span>${venue}</span></p>
              </div>
              <div class="flex-shrink-0 flex flex-wrap gap-2 items-start">
                  <a href="https://wa.me/213668261708?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-100 dark:border-emerald-800 text-xs font-semibold rounded-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-all">
                      <i class="fa-brands fa-whatsapp text-emerald-600 text-sm" aria-hidden="true"></i> <span>${btnText}</span>
                  </a>
                  <a href="${conf.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-100 dark:border-slate-800 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 transition-all">
                      <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i> <span>Website</span>
                  </a>
              </div>
          </div>
        `;
        natList.appendChild(article);
      });
    }
  }

  // Fetch publications and metrics from Google Scholar automated JSON, with OpenAlex API fallback
  async function loadScholarData() {
    let scholarLoaded = false;
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';

    try {
      const response = await fetch('assets/data/scholar_stats.json');
      if (response.ok) {
        const data = await response.json();
        if (data && data.stats) {
          updateUIMetrics(data.stats);
          if (data.publications && data.publications.length > 0) {
            renderDynamicPublications(data.publications);
            scholarLoaded = true;
          }
        }
      }
    } catch (e) {
      console.warn("Could not load Google Scholar JSON, trying fallback...", e);
    }

    if (!scholarLoaded) {
      // Fallback to OpenAlex ORCID: 0000-0002-4968-9529
      const orcid = '0000-0002-4968-9529';
      const authorUrl = `https://api.openalex.org/authors/https://orcid.org/${orcid}`;
      const worksUrl = `https://api.openalex.org/works?filter=author.orcid:${orcid}&sort=publication_year:desc,cited_by_count:desc`;

      try {
        const authorRes = await fetch(authorUrl);
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          const stats = {
            citations: authorData.cited_by_count || 196,
            h_index: (authorData.summary_stats && authorData.summary_stats.h_index) || 8,
            i10_index: (authorData.summary_stats && authorData.summary_stats.i10_index) || 7,
            works_count: authorData.works_count || 23
          };
          updateUIMetrics(stats);
        }
      } catch (e) {
        console.warn("Failed to fetch author metrics from OpenAlex fallback.", e);
      }

      try {
        const worksRes = await fetch(worksUrl);
        if (worksRes.ok) {
          const worksData = await worksRes.json();
          if (worksData.results && worksData.results.length > 0) {
            // Map OpenAlex structure to our simple structure
            const mappedPubs = worksData.results.map(work => {
              const journal = (work.primary_location && work.primary_location.source && work.primary_location.source.display_name) || 'Scientific Journal';
              const authors = (work.authorships && work.authorships.length > 0)
                ? work.authorships.map(a => a.author.display_name).join(', ')
                : 'Azzeddine Reghais';
              return {
                title: work.title,
                authors: authors,
                journal: journal,
                citations: work.cited_by_count || 0,
                year: work.publication_year,
                link: work.doi || `https://doi.org/${work.id.split('/').pop()}`,
                is_oa: work.open_access && work.open_access.is_oa
              };
            });
            renderDynamicPublications(mappedPubs);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch works from OpenAlex fallback.", e);
      }
    }
  }

  function updateUIMetrics(stats) {
    const citations = stats.citations || 196;
    const hIndex = stats.h_index || 8;
    const i10Index = stats.i10_index || 7;
    const worksCount = stats.works_count || 23;

    // Direct stat indicators
    const statCit = document.getElementById('stat-citations');
    const statHi = document.getElementById('stat-hindex');
    const statI10 = document.getElementById('stat-i10index');
    const statWrks = document.getElementById('stat-works');

    if (statCit) statCit.textContent = citations + '+';
    if (statHi) statHi.textContent = hIndex;
    if (statI10) statI10.textContent = i10Index;
    if (statWrks) statWrks.textContent = worksCount;

    // Hero stat indicators
    const heroCit = document.getElementById('hero-citations-val');
    const heroHi = document.getElementById('hero-hindex-val');
    if (heroCit) heroCit.textContent = citations + '+';
    if (heroHi) heroHi.textContent = hIndex;
  }

  // Exact PDF download mappings for the researcher's open access works
  const openAccessPdfMappings = {
    "Wadi Ranyah": "https://jksus.org/content/185/2024/36/10/pdf/10.1016_j.jksus.2024.103463.pdf",
    "Remila Plain": "https://gll.urk.edu.pl/pdf-189408-117044?filename=Hydrochemical%20analysis.pdf",
    "Mediterranean coastal aquifer": "https://doi.org/10.1016/j.ejrh.2026.103200",
    "DRASTIC method": "https://www.mdpi.com/2076-3417/12/18/9205/pdf",
    "Naama sub-basins": "https://doi.org/10.1007/s10661-024-13433-0"
  };

  function renderDynamicPublications(publications) {
    const pubListContainer = document.getElementById('publications-list');
    if (!pubListContainer) return;

    pubListContainer.innerHTML = '';
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';

    publications.forEach((pub) => {
      const article = document.createElement('article');
      article.className = 'publication-card bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm fade-in-up';

      const title = pub.title;
      const year = pub.year || 'N/A';
      const journal = pub.journal || 'Scientific Journal';
      const authors = pub.authors || 'Azzeddine Reghais';

      // Check open access status by analyzing title matches or is_oa flag
      let isOA = pub.is_oa || false;
      let downloadUrl = pub.link || '';

      for (const [key, pdfUrl] of Object.entries(openAccessPdfMappings)) {
        if (title.toLowerCase().includes(key.toLowerCase())) {
          isOA = true;
          downloadUrl = pdfUrl;
          break;
        }
      }

      let buttonsHtml = '';
      if (isOA && downloadUrl) {
        buttonsHtml += `
          <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-all">
            <i class="fa-solid fa-file-pdf text-emerald-600" aria-hidden="true"></i>
            <span data-i18n="download-oa">${currentLang === 'ar' ? 'تحميل ورقة مفتوحة المصدر' : 'Download Open Access'}</span>
          </a>
        `;
      } else {
        const textMsg = encodeURIComponent(`مرحباً الدكتور عز الدين رغيس، أود من فضلك طلب نسخة من بحثكم العلمي بعنوان:\n"${title}"`);
        buttonsHtml += `
          <a href="https://wa.me/213668261708?text=${textMsg}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-100 dark:border-emerald-800 text-xs font-semibold rounded-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-all">
            <i class="fa-brands fa-whatsapp text-emerald-600 text-sm" aria-hidden="true"></i>
            <span data-i18n="request-wa">${currentLang === 'ar' ? 'طلب البحث عبر واتساب' : 'Request via WhatsApp'}</span>
          </a>
        `;
      }

      if (pub.link) {
        buttonsHtml += `
          <a href="${pub.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-primary-100 dark:border-primary-800 text-xs font-semibold rounded-lg text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 transition-all">
            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
            <span data-i18n="view-source">${currentLang === 'ar' ? 'رابط المصدر' : 'View Source'}</span>
          </a>
        `;
      }

      // Citations count badge
      const citations = pub.citations || 0;
      const citationBadge = citations > 0 ? `
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
          <i class="fa-solid fa-quote-left mr-1 text-amber-500" aria-hidden="true"></i> ${citations} ${currentLang === 'ar' ? 'اقتباس' : 'Citations'}
        </span>
      ` : '';

      article.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2 items-center">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                <i class="fa-solid fa-journal-whills mr-1" aria-hidden="true"></i>
                <span>${currentLang === 'ar' ? 'مقالة علمية محكّمة' : 'Journal Article'} — ${year}</span>
              </span>
              ${citationBadge}
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">${title}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400"><span class="font-medium">${currentLang === 'ar' ? 'المساهمون:' : 'Contributors:'}</span> ${authors}</p>
            <p class="text-sm text-slate-600 dark:text-slate-400 italic"><span class="font-bold">${currentLang === 'ar' ? 'المجلة:' : 'Journal:'}</span> ${journal}</p>
          </div>
          <div class="flex-shrink-0 flex flex-wrap gap-2">
            ${buttonsHtml}
          </div>
        </div>
      `;
      pubListContainer.appendChild(article);
    });
  }

  // Dynamic WhatsApp Messages based on Language
  function updateWhatsAppLinks() {
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';
    const waLinks = document.querySelectorAll('a[href*="wa.me/213668261708"]');

    waLinks.forEach(link => {
      // Don't overwrite the conference specific messages
      if (link.getAttribute('href').includes('مرحباً الدكتور') || link.getAttribute('href').includes('بحثكم العلمي')) {
        return;
      }
      const msg = currentLang === 'ar'
        ? encodeURIComponent("مرحباً الدكتور عز الدين رغيس، أود التواصل معك بخصوص أبحاثك الأكاديمية واهتماماتك العلمية...")
        : encodeURIComponent("Hello Dr. Azzeddine Reghais, I am interested in your research and academic works...");
      link.href = `https://wa.me/213668261708?text=${msg}`;
    });
  }

  // Re-render components if language selection changes
  document.addEventListener('languageChanged', () => {
    renderFiles();
    renderBookings();
    renderConferences();
    loadScholarData();
    updateWhatsAppLinks();
  });

  // Run initial renders
  renderFiles();
  renderBookings();
  renderConferences();
  loadScholarData();
  updateWhatsAppLinks();

})();
