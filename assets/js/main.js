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

    const currentLang = localStorage.getItem('portfolio-lang') || 'en';
    const promptMsg = currentLang === 'ar'
      ? "الرجاء إدخال كلمة المرور لإضافة محاضرة أو ملفات جديدة:\n(تلميح: كلمة المرور المطلوبة تبدأ بـ Ch...)"
      : "Please enter the password to add a new lecture or file:\n(Hint: starts with Ch...)";
    const successMsg = currentLang === 'ar'
      ? "تم التحقق بنجاح! جاري إضافة الملف..."
      : "Authorized successfully! Adding the file...";
    const errorMsg = currentLang === 'ar'
      ? "كلمة المرور غير صحيحة. تم رفض الوصول."
      : "Incorrect password. Access denied.";

    const enteredPassword = prompt(promptMsg);
    if (enteredPassword === null) return;
    if (enteredPassword !== "Chihab2020") {
      alert(errorMsg);
      return;
    }

    alert(successMsg);

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
        <div class="flex flex-col gap-2 items-end">
          <button onclick="sendBookingToWhatsApp(${booking.id})" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 p-1 flex items-center gap-1 transition-all">
            <i class="fa-brands fa-whatsapp text-sm" aria-hidden="true"></i>
            <span>${currentLang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
          </button>
          <button onclick="cancelBooking(${booking.id})" class="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 flex items-center gap-1 transition-all">
            <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
            <span data-i18n="booking-cancel">${currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</span>
          </button>
        </div>
      `;
      bookingsContainer.appendChild(card);
    });
  }

  window.cancelBooking = function (bookingId) {
    const bookings = getBookings().filter(b => b.id !== bookingId);
    saveBookings(bookings);
    renderBookings();
  };

  window.sendBookingToWhatsApp = function(bookingId) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const currentLang = localStorage.getItem('portfolio-lang') || 'en';
    const purposeText = window.translations[currentLang]["purpose-" + booking.purpose] || booking.purpose;

    let textMsg = "";
    if (currentLang === 'ar') {
      textMsg = `مرحباً الدكتور عز الدين رغيس، لقد قمت بحجز موعد إرشاد أكاديمي عبر موقعكم الإلكتروني:\n\n` +
                `👤 الاسم الكامل: ${booking.name}\n` +
                `📧 البريد الإلكتروني: ${booking.email}\n` +
                `🎯 الغرض من الحجز: ${purposeText}\n` +
                `📅 تاريخ الموعد: ${booking.date}\n` +
                `⏰ التوقيت / الحصة: ${booking.slot}\n`;
      if (booking.details) {
        textMsg += `📝 تفاصيل أو موضوع الحجز: ${booking.details}\n`;
      }
    } else {
      textMsg = `Hello Dr. Azzeddine Reghais, I have booked an academic appointment via your website:\n\n` +
                `👤 Full Name: ${booking.name}\n` +
                `📧 Email: ${booking.email}\n` +
                `🎯 Purpose: ${purposeText}\n` +
                `📅 Appointment Date: ${booking.date}\n` +
                `⏰ Time Slot: ${booking.slot}\n`;
      if (booking.details) {
        textMsg += `📝 Details / Topic: ${booking.details}\n`;
      }
    }

    const waUrl = `https://wa.me/213668261708?text=${encodeURIComponent(textMsg)}`;
    window.open(waUrl, '_blank');
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

      const newBookingId = Date.now();
      const bookings = getBookings();
      bookings.push({
        id: newBookingId,
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
        currentLang === 'ar' ? 'تم تسجيل الحجز بنجاح! جاري تحويلك إلى واتساب لإرسال تفاصيل الموعد...' : 'Appointment registered successfully! Redirecting to WhatsApp to send appointment details...',
        'success'
      );
      renderBookings();

      setTimeout(() => {
        window.sendBookingToWhatsApp(newBookingId);
      }, 1500);
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
    "Tadjenanet-Chelghoum": "https://www.acquesotterranee.net/acque/article/download/644/496"
  };

  function renderDynamicPublications(publications) {
    const pubListContainer = document.getElementById('publications-list');
    if (!pubListContainer) return;

    if (!publications || publications.length === 0) {
      console.warn("No publications fetched, leaving static fallbacks intact.");
      return;
    }

    // Sort publications by year (newest/latest first)
    const sortedPublications = [...publications].sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return yearB - yearA;
    });

    pubListContainer.innerHTML = '';
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';

    sortedPublications.forEach((pub) => {
      const article = document.createElement('article');
      article.className = 'publication-card bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm fade-in-up';

      const title = pub.title || '';
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
            <span>${currentLang === 'ar' ? 'تحميل ورقة مفتوحة المصدر' : 'Download Open Access'}</span>
          </a>
        `;
      } else {
        const textMsg = encodeURIComponent(`مرحباً الدكتور عز الدين رغيس، أود من فضلك طلب نسخة من بحثكم العلمي بعنوان:\n"${title}"`);
        buttonsHtml += `
          <a href="https://wa.me/213668261708?text=${textMsg}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-emerald-100 dark:border-emerald-800 text-xs font-semibold rounded-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-all">
            <i class="fa-brands fa-whatsapp text-emerald-600 text-sm" aria-hidden="true"></i>
            <span>${currentLang === 'ar' ? 'طلب البحث عبر واتساب' : 'Request via WhatsApp'}</span>
          </a>
        `;
      }

      if (pub.link) {
        buttonsHtml += `
          <a href="${pub.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 border border-primary-100 dark:border-primary-800 text-xs font-semibold rounded-lg text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 transition-all">
            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
            <span>${currentLang === 'ar' ? 'رابط المصدر / DOI' : 'View Source / DOI'}</span>
          </a>
        `;
      }

      // Citations count badge
      const citations = pub.citations || 0;
      const citationBadge = `
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
          <i class="fa-solid fa-quote-left mr-1 text-amber-500" aria-hidden="true"></i> ${citations} ${currentLang === 'ar' ? 'اقتباس' : 'Citations'}
        </span>
      `;

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
      const rawHref = link.getAttribute('href') || '';
      let decodedHref = '';
      try {
        decodedHref = decodeURIComponent(rawHref);
      } catch (e) {
        decodedHref = rawHref;
      }

      // Don't overwrite the conference or paper specific requested messages
      if (
        decodedHref.includes('مرحباً الدكتور') ||
        decodedHref.includes('بحثكم العلمي') ||
        decodedHref.includes('الملتقى') ||
        decodedHref.includes('نسخة') ||
        decodedHref.includes('Abstract') ||
        decodedHref.includes('Request')
      ) {
        return;
      }
      const msg = currentLang === 'ar'
        ? encodeURIComponent("مرحباً الدكتور عز الدين رغيس، أود التواصل معك بخصوص أبحاثك الأكاديمية واهتماماتك العلمية...")
        : encodeURIComponent("Hello Dr. Azzeddine Reghais, I am interested in your research and academic works...");
      link.href = `https://wa.me/213668261708?text=${msg}`;
    });
  }

  const reviewerCerts = [
    {
      title_en: "Reviewer Certificate (February 2026)",
      title_ar: "شهادة تقييم (فبراير 2026)",
      issuer_en: "Springer / Elsevier Journals",
      issuer_ar: "مجلات سبرينجر وإلزيفير",
      date: "2026",
      pdf: "assets/pdf/reviewer_certificates/Reviewer Certificate 03 February 2026.pdf",
      verify: "https://www.webofscience.com"
    },
    {
      title_en: "Reviewer Certificate (October 2025)",
      title_ar: "شهادة تقييم (أكتوبر 2025)",
      issuer_en: "Springer / Elsevier Journals",
      issuer_ar: "مجلات سبرينجر وإلزيفير",
      date: "2025",
      pdf: "assets/pdf/reviewer_certificates/Reviewer Certificate 06 October 2025.pdf",
      verify: "https://www.webofscience.com"
    },
    {
      title_en: "Reviewer Certificate (September 2025)",
      title_ar: "شهادة تقييم (سبتمبر 2025)",
      issuer_en: "Springer / Elsevier Journals",
      issuer_ar: "مجلات سبرينجر وإلزيفير",
      date: "2025",
      pdf: "assets/pdf/reviewer_certificates/Reviewer Certificate 11 September 2025.pdf",
      verify: "https://www.webofscience.com"
    },
    {
      title_en: "Reviewer Certificate (August 2025)",
      title_ar: "شهادة تقييم (أغسطس 2025)",
      issuer_en: "Springer / Elsevier Journals",
      issuer_ar: "مجلات سبرينجر وإلزيفير",
      date: "2025",
      pdf: "assets/pdf/reviewer_certificates/Reviewer Certificate 16 August 2025.pdf",
      verify: "https://www.webofscience.com"
    },
    {
      title_en: "Reviewer Certificate (June 2025)",
      title_ar: "شهادة تقييم (يونيو 2025)",
      issuer_en: "Springer / Elsevier Journals",
      issuer_ar: "مجلات سبرينجر وإلزيفير",
      date: "2025",
      pdf: "assets/pdf/reviewer_certificates/Reviewer Certificate 09 June 2025.pdf",
      verify: "https://www.webofscience.com"
    }
  ];

  const professionalCerts = [
    {
      title_en: "UNESCO Open Learning: GGRETA03 Groundwater SDC",
      title_ar: "اليونسكو للتعليم المفتوح: المياه الجوفية GGRETA03",
      issuer_en: "UNESCO",
      issuer_ar: "منظمة اليونسكو",
      date: "2025",
      pdf: "assets/pdf/certifications/SDC GGRETA03 Certificate _ UNESCO Open Learning.pdf",
      verify: "https://openlearning.unesco.org"
    },
    {
      title_en: "The Basics of R for Ecologists",
      title_ar: "أساسيات لغة R لعلماء البيئة",
      issuer_en: "DataCamp / Ecologist Portal",
      issuer_ar: "بوابة علماء البيئة",
      date: "2024",
      pdf: "assets/pdf/certifications/certificate-of-completion-for-the-basics-of-r-for-ecologists.pdf",
      verify: "https://www.datacamp.com"
    },
    {
      title_en: "Coursera: Spatial Data Analysis",
      title_ar: "كورسيرات: تحليل البيانات المكانية",
      issuer_en: "Coursera / Imperial College London",
      issuer_ar: "كورسيرا / إمبريال كوليدج لندن",
      date: "2024",
      pdf: "assets/pdf/certifications/Coursera U8PESZAY6K25.pdf",
      verify: "https://www.coursera.org"
    },
    {
      title_en: "Coursera: GIS & Remote Sensing",
      title_ar: "كورسيرات: نظم المعلومات الجغرافية والاستشعار عن بعد",
      issuer_en: "Coursera / UCDavis",
      issuer_ar: "كورسيرا / جامعة كاليفورنيا ديفيس",
      date: "2023",
      pdf: "assets/pdf/certifications/Coursera 8DMZPQLFDR3V.pdf",
      verify: "https://www.coursera.org"
    },
    {
      title_en: "Introduction to the Tidyverse",
      title_ar: "مقدمة في مكتبات Tidyverse في R",
      issuer_en: "DataCamp",
      issuer_ar: "داتا كامب",
      date: "2024",
      pdf: "assets/pdf/certifications/Introduction to the Tidyverse.pdf",
      verify: "https://www.datacamp.com"
    },
    {
      title_en: "Intermediate R",
      title_ar: "مستوى متوسط في لغة R",
      issuer_en: "DataCamp",
      issuer_ar: "داتا كامب",
      date: "2024",
      pdf: "assets/pdf/certifications/Intermediate R.pdf",
      verify: "https://www.datacamp.com"
    },
    {
      title_en: "Publons Academy Graduation Certificate",
      title_ar: "شهادة التخرج من أكاديمية بوبلونز",
      issuer_en: "Web of Science",
      issuer_ar: "شبكة العلوم (Web of Science)",
      date: "2023",
      pdf: "assets/pdf/certifications/Publons Academy Graduation Certificate.pdf",
      verify: "https://publons.com"
    },
    {
      title_en: "Coursera: Ground Water Hydrology",
      title_ar: "كورسيرات: هيدرولوجيا المياه الجوفية",
      issuer_en: "Coursera / University of Geneva",
      issuer_ar: "كورسيرا / جامعة جنيف",
      date: "2023",
      pdf: "assets/pdf/certifications/Coursera G55TAPA9RAVQ.pdf",
      verify: "https://www.coursera.org"
    },
    {
      title_en: "Building Trust and Engagement in Peer Review",
      title_ar: "بناء الثقة والمشاركة في عملية التحكيم العلمي",
      issuer_en: "Researcher Academy / Elsevier",
      issuer_ar: "أكاديمية الباحثين / إلسيفير",
      date: "2024",
      pdf: "assets/pdf/certifications/building-trust-engagement-peer-review-certificate.pdf",
      verify: "https://researcheracademy.elsevier.com"
    },
    {
      title_en: "Coursera: Introduction to GIS Data",
      title_ar: "كورسيرات: مقدمة في بيانات نظم المعلومات الجغرافية",
      issuer_en: "Coursera / Toronto University",
      issuer_ar: "كورسيرا / جامعة تورنتو",
      date: "2023",
      pdf: "assets/pdf/certifications/Coursera BMYKPJEFEKUR.pdf",
      verify: "https://www.coursera.org"
    },
    {
      title_en: "Intro to Data Visualization in R for Ecologists",
      title_ar: "مقدمة في تمثيل البيانات بلغة R لعلماء البيئة",
      issuer_en: "DataCamp / Ecologist Portal",
      issuer_ar: "بوابة علماء البيئة",
      date: "2024",
      pdf: "assets/pdf/certifications/certificate-of-completion-for-intro-to-data-visualization-in-r-for-ecologists.pdf",
      verify: "https://www.datacamp.com"
    },
    {
      title_en: "Geospatial Analysis with QGIS",
      title_ar: "التحليل الجيومكاني باستخدام برنامج QGIS",
      issuer_en: "QGIS Academy",
      issuer_ar: "أكاديمية QGIS",
      date: "2023",
      pdf: "assets/pdf/certifications/Geospatial.pdf",
      verify: "https://qgis.org"
    },
    {
      title_en: "Avoiding Critical Language Errors in Your Research Paper",
      title_ar: "تجنب الأخطاء اللغوية القاتلة في ورقتك البحثية",
      issuer_en: "Researcher Academy / Elsevier",
      issuer_ar: "أكاديمية الباحثين / إلسيفير",
      date: "2024",
      pdf: "assets/pdf/certifications/certificate-of-completion-for-how-to-avoid-critical-language-errors-in-your-research-paper.pdf",
      verify: "https://researcheracademy.elsevier.com"
    },
    {
      title_en: "SWAT Online Training (Soil & Water Assessment Tool)",
      title_ar: "تدريب SWAT الإلكتروني (أداة تقييم التربة والمياه)",
      issuer_en: "SWAT Community / Texas A&M",
      issuer_ar: "مجتمع SWAT / جامعة تكساس",
      date: "2023",
      pdf: "assets/pdf/certifications/SWAT_Online_Training.pdf",
      verify: "https://swat.tamu.edu"
    },
    {
      title_en: "Coursera: Satellite Imagery & Remote Sensing",
      title_ar: "كورسيرات: صور الأقمار الصناعية والاستشعار عن بعد",
      issuer_en: "Coursera / University of Colorado",
      issuer_ar: "كورسيرا / جامعة كولورادو",
      date: "2023",
      pdf: "assets/pdf/certifications/Coursera YSF2P6PXND5Z.pdf",
      verify: "https://www.coursera.org"
    },
    {
      title_en: "Certificate of Completion",
      title_ar: "شهادة إتمام وتفوق",
      issuer_en: "Jijel University",
      issuer_ar: "جامعة جيجل",
      date: "2022",
      pdf: "assets/pdf/certifications/Certificate of Completion Azzeddine Reghais.pdf",
      verify: "https://www.univ-jijel.dz"
    },
    {
      title_en: "Publons Academy Mentor Certificate",
      title_ar: "شهادة موجه (Mentor) من أكاديمية بوبلونز",
      issuer_en: "Web of Science",
      issuer_ar: "شبكة العلوم (Web of Science)",
      date: "2024",
      pdf: "assets/pdf/certifications/Publons Academy Mentor Certificate.pdf",
      verify: "https://publons.com"
    },
    {
      title_en: "Intermediate Data Visualization with ggplot2",
      title_ar: "تمثيل البيانات المتقدم باستخدام ggplot2 في R",
      issuer_en: "DataCamp",
      issuer_ar: "داتا كامب",
      date: "2024",
      pdf: "assets/pdf/certifications/Intermediate Data Visualization with ggplot2.pdf",
      verify: "https://www.datacamp.com"
    },
    {
      title_en: "Introduction to ggplot2",
      title_ar: "مقدمة في تمثيل البيانات ggplot2",
      issuer_en: "DataCamp",
      issuer_ar: "داتا كامب",
      date: "2024",
      pdf: "assets/pdf/certifications/Introduction ggplot2.pdf",
      verify: "https://www.datacamp.com"
    }
  ];

  function renderCertifications() {
    const container = document.getElementById('professional-certs-list');
    if (!container) return;
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';
    container.innerHTML = '';

    professionalCerts.forEach(cert => {
      const title = currentLang === 'ar' ? cert.title_ar : cert.title_en;
      const issuer = currentLang === 'ar' ? cert.issuer_ar : cert.issuer_en;
      const downloadText = currentLang === 'ar' ? "تحميل الشهادة" : "Download PDF";
      const verifyText = currentLang === 'ar' ? "رابط موقع الشهادة" : "Verify Credential";

      const div = document.createElement('div');
      div.className = "bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-primary-400 dark:hover:border-primary-700 transition-all duration-300";
      div.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400">
              <i class="fa-solid fa-certificate mr-1" aria-hidden="true"></i> <span>${issuer}</span>
            </span>
            <span class="text-xs font-semibold text-slate-400">${cert.date}</span>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">${title}</h4>
        </div>
        <div class="flex gap-2 mt-6">
          <a href="${cert.pdf}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-900 dark:bg-primary-600 hover:bg-primary-800 dark:hover:bg-primary-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm">
            <i class="fa-solid fa-download" aria-hidden="true"></i>
            <span>${downloadText}</span>
          </a>
          <a href="${cert.verify}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all shadow-sm">
            <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i>
            <span>${verifyText}</span>
          </a>
        </div>
      `;
      container.appendChild(div);
    });
  }

  function renderReviewerCerts() {
    const container = document.getElementById('reviewer-certs-list');
    if (!container) return;
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';
    container.innerHTML = '';

    reviewerCerts.forEach(cert => {
      const title = currentLang === 'ar' ? cert.title_ar : cert.title_en;
      const issuer = currentLang === 'ar' ? cert.issuer_ar : cert.issuer_en;
      const downloadText = currentLang === 'ar' ? "تحميل الشهادة" : "Download PDF";
      const verifyText = currentLang === 'ar' ? "رابط موقع الشهادة" : "Verify Review";

      const div = document.createElement('div');
      div.className = "bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-700 transition-all duration-300";
      div.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
              <i class="fa-solid fa-star mr-1" aria-hidden="true"></i> <span>${issuer}</span>
            </span>
            <span class="text-xs font-semibold text-slate-400">${cert.date}</span>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">${title}</h4>
        </div>
        <div class="flex gap-2 mt-6">
          <a href="${cert.pdf}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm">
            <i class="fa-solid fa-download" aria-hidden="true"></i>
            <span>${downloadText}</span>
          </a>
          <a href="${cert.verify}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all shadow-sm">
            <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i>
            <span>${verifyText}</span>
          </a>
        </div>
      `;
      container.appendChild(div);
    });
  }

  // Switch Awards/Certifications Section Tabs
  window.switchAwardsTab = function(tabId) {
    // Hide all awards tab content containers
    document.querySelectorAll('.awards-tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    // Reset button states
    const btnEdu = document.getElementById('tabAwardsEducationBtn');
    const btnCerts = document.getElementById('tabAwardsCertsBtn');
    const btnReview = document.getElementById('tabAwardsReviewBtn');

    const defaultBtnClass = "flex-grow sm:flex-initial px-4 py-2.5 text-sm font-bold rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";
    const activeBtnClass = "flex-grow sm:flex-initial px-4 py-2.5 text-sm font-bold rounded-xl transition-all bg-white dark:bg-slate-900 text-primary-700 dark:text-primary-300 shadow-sm";

    if (btnEdu && btnCerts && btnReview) {
      btnEdu.className = defaultBtnClass;
      btnCerts.className = defaultBtnClass;
      btnReview.className = defaultBtnClass;

      if (tabId === 'education') {
        btnEdu.className = activeBtnClass;
        document.getElementById('awards-education-content').classList.remove('hidden');
      } else if (tabId === 'certs') {
        btnCerts.className = activeBtnClass;
        document.getElementById('awards-certs-content').classList.remove('hidden');
      } else if (tabId === 'review') {
        btnReview.className = activeBtnClass;
        document.getElementById('awards-review-content').classList.remove('hidden');
      }
    }
  };

  window.downloadBlogPDF = function(title, pdfUrl) {
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';
    const promptMsg = currentLang === 'ar'
      ? "الرجاء إدخال كلمة المرور للوصول إلى ملف الـ PDF:\n(تلميح: كلمة المرور المطلوبة تبدأ بـ Ch...)"
      : "Please enter the password to access the PDF file:\n(Hint: starts with Ch...)";
    const successMsg = currentLang === 'ar'
      ? "تم التحقق من كلمة المرور بنجاح! جاري تحميل الملف..."
      : "Password verified successfully! Downloading file...";
    const errorMsg = currentLang === 'ar'
      ? "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى."
      : "Incorrect password. Please try again.";

    const enteredPassword = prompt(promptMsg);

    if (enteredPassword === null) {
      return;
    }

    if (enteredPassword === "Chihab2020") {
      alert(successMsg);
      const link = document.createElement('a');
      link.href = pdfUrl || "assets/pdf/certifications/Certificate of Completion Azzeddine Reghais.pdf";
      link.target = "_blank";
      link.download = pdfUrl ? pdfUrl.split('/').pop() : "Article_Document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(errorMsg);
    }
  };

  // Re-render components if language selection changes
  document.addEventListener('languageChanged', () => {
    renderFiles();
    renderBookings();
    renderConferences();
    renderCertifications();
    renderReviewerCerts();
    loadScholarData();
    updateWhatsAppLinks();
  });

  // Run initial renders
  renderFiles();
  renderBookings();
  renderConferences();
  renderCertifications();
  renderReviewerCerts();
  loadScholarData();
  updateWhatsAppLinks();

})();
