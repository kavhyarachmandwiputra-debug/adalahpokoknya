// Doctor Schedule Modal Logic
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('doctorModal');
  const closeBtn = document.querySelector('.modal-close');
  const doctorList = document.getElementById('doctorList');
  const todayDateDisplay = document.getElementById('todayDate');

  // Day mappings (Indonesian)
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Get today's day name in Indonesian
  function getTodayDayName() {
    const today = new Date();
    return dayNames[today.getDay()];
  }

  // Format today's date
  function formatTodayDate() {
    const today = new Date();
    const dayName = getTodayDayName();
    const date = today.getDate();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return `${dayName}, ${date} ${month} ${year}`;
  }

  // Get doctors on duty today
  function getDoctorsOnDutyToday() {
    const todayDay = getTodayDayName();
    const doctorCards = document.querySelectorAll('.team-card[data-doctor-name]');
    const doctorsOnDuty = [];

    doctorCards.forEach(card => {
      const dutyDays = card.getAttribute('data-doctor-duty');
      // Check if today's day is in the duty schedule
      if (dutyDays && dutyDays.includes(todayDay)) {
        doctorsOnDuty.push({
          name: card.getAttribute('data-doctor-name'),
          role: card.getAttribute('data-doctor-role'),
          image: card.getAttribute('data-doctor-image'),
          duty: card.getAttribute('data-doctor-duty')
        });
      }
    });

    return doctorsOnDuty;
  }

  // Populate doctor list in modal
  function populateDoctorList() {
    const doctors = getDoctorsOnDutyToday();
    doctorList.innerHTML = '';

    if (doctors.length === 0) {
      doctorList.innerHTML = `
        <div class="empty-doctor-message">
          <p>Maaf, tidak ada dokter yang bertugas hari ini.</p>
          <p>Silakan hubungi kami untuk informasi jadwal dokter lainnya.</p>
        </div>
      `;
      return;
    }

    doctors.forEach(doctor => {
      const doctorItem = document.createElement('div');
      doctorItem.className = 'doctor-item';
      doctorItem.innerHTML = `
        <img src="${doctor.image}" alt="${doctor.name}">
        <div class="doctor-info">
          <h3>${doctor.name}</h3>
          <p class="doctor-role">${doctor.role}</p>
          <p class="doctor-duty">📅 Jadwal Bertugas: ${doctor.duty}</p>
        </div>
      `;

      // Click to select/deselect doctor
      doctorItem.addEventListener('click', () => {
        // clear previous selection
        const prev = doctorList.querySelector('.doctor-item.selected');
        if (prev && prev !== doctorItem) prev.classList.remove('selected');
        doctorItem.classList.toggle('selected');

        // If selected, store and show consult button
        const selected = doctorList.querySelector('.doctor-item.selected');
        if (selected) {
          selectedDoctor = doctor;
          document.getElementById('selectedDoctorName').textContent = doctor.name;
          const consultHidden = document.querySelector('.modal-consult');
          if (consultHidden) consultHidden.classList.remove('cta-hidden');
        } else {
          selectedDoctor = null;
          document.getElementById('selectedDoctorName').textContent = '-';
          const consultHidden = document.querySelector('.modal-consult');
          if (consultHidden) consultHidden.classList.add('cta-hidden');
        }
      });

      doctorList.appendChild(doctorItem);
    });

    // update pagination once items have been added
    updatePagination();
  }

  // Update pagination (current/total) display
  const paginationEl = document.getElementById('doctorPagination');
  function updatePagination() {
    if (!paginationEl) return;
    const items = doctorList.querySelectorAll('.doctor-item');
    const total = items.length;
    if (total === 0) {
      paginationEl.setAttribute('aria-hidden','true');
      paginationEl.textContent = '';
      return;
    }
    const slideWidth = doctorList.clientWidth || 1;
    const idx = Math.round(doctorList.scrollLeft / slideWidth) + 1;
    const current = Math.min(Math.max(idx,1), total);
    paginationEl.textContent = `${current}/${total}`;
    paginationEl.setAttribute('aria-hidden','false');
  }

  // update pagination on scroll (live), and after snapping we'll ensure it's exact
  doctorList.addEventListener('scroll', () => {
    updatePagination();
  });

  // Open modal
  function openDoctorModal() {
    todayDateDisplay.textContent = formatTodayDate();
    populateDoctorList();
    modal.style.display = 'block';
    // reset scroll to first slide and focus for keyboard control
    doctorList.scrollLeft = 0;
    doctorList.focus();
    updatePagination();
    document.addEventListener('keydown', keydownHandler);
  }

  // Close modal
  function closeDoctorModal() {
    modal.style.display = 'none';
    document.removeEventListener('keydown', keydownHandler);
  }

  // Close modal when close button clicked
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDoctorModal);
  }

  // Close modal when clicking outside modal content
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeDoctorModal();
    }
  });

  // Expose function globally for calculator button
  window.openDoctorModalFromCTA = function() {
    openDoctorModal();
  };

  // Modal navigation buttons (prev/next scroll) and drag-to-scroll
  const prevBtn = document.querySelector('.modal-prev');
  const nextBtn = document.querySelector('.modal-next');

  function scrollByItem(direction = 1) {
    const gap = parseInt(getComputedStyle(doctorList).gap) || 20;
    const slideWidth = doctorList.clientWidth;
    const scrollAmount = slideWidth + gap;
    doctorList.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollByItem(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByItem(1));

  // Snap to nearest slide after interaction
  function snapToClosest() {
    const slideWidth = doctorList.clientWidth;
    if (slideWidth === 0) return;
    const idx = Math.round(doctorList.scrollLeft / slideWidth);
    doctorList.scrollTo({ left: idx * slideWidth, behavior: 'smooth' });
  }

  // Keyboard navigation (left/right arrows, Esc to close)
  function keydownHandler(e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByItem(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); scrollByItem(1); }
    else if (e.key === 'Escape') { closeDoctorModal(); }
  }

  // Pointer drag support for desktop (mouse) and touch (pointer events)
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  doctorList.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.clientX;
    scrollStart = doctorList.scrollLeft;
    doctorList.classList.add('dragging');
    if (e.pointerId) doctorList.setPointerCapture(e.pointerId);
  });

  doctorList.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const x = e.clientX;
    const walk = startX - x;
    doctorList.scrollLeft = scrollStart + walk;
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
    doctorList.addEventListener(evt, (e) => {
      isDown = false;
      doctorList.classList.remove('dragging');
      try { if (e.pointerId) doctorList.releasePointerCapture(e.pointerId); } catch (err) { }
      // Snap to closest slide when interaction ends
      snapToClosest();
    });
  });

  // Consultation form functionality
  let selectedDoctor = null; // currently selected doctor object
  const consultBtn = document.querySelector('.modal-consult');
  const consultModal = document.getElementById('consultModal');
  const consultModalClose = document.getElementById('consultModalClose');
  const modalConsultForm = document.getElementById('modalConsultForm');
  const consultCancel = document.getElementById('consultCancel');
  const consultSuccess = document.getElementById('consultSuccess');

  function populateFromPatient() {
    const nameEl = document.getElementById('calcName');
    const genderEl = document.getElementById('calcGender');
    const ageEl = document.getElementById('calcAge');
    const heightEl = document.getElementById('calcHeight');
    const name = nameEl ? nameEl.value : '';
    const genderVal = genderEl ? genderEl.value : '';
    const age = ageEl ? ageEl.value : '';
    const height = heightEl ? heightEl.value : '';
    const nameOut = document.getElementById('fromPatientName');
    const infoOut = document.getElementById('fromPatientInfo');
    if (nameOut) nameOut.textContent = `Nama: ${name || '-'}`;
    if (infoOut) infoOut.textContent = `Jenis Kelamin: ${genderVal || '-'} | Usia: ${age || '-'} bulan | Tinggi: ${height || '-'} cm`;
    const today = new Date();
    const dayEl = document.getElementById('consultDay');
    const dateEl = document.getElementById('consultDate');
    if (dayEl) dayEl.value = dayNames[today.getDay()];
    if (dateEl) {
      const y = today.getFullYear(), m = String(today.getMonth()+1).padStart(2,'0'), d = String(today.getDate()).padStart(2,'0');
      dateEl.value = `${y}-${m}-${d}`;
    }
  }

  // helpers to open/close consult modal
  function consultKeydownHandler(e) { if (e.key === 'Escape') closeConsultModal(); }
  function openConsultModal() {
    if (!consultModal) return;
    populateFromPatient();
    consultModal.style.display = 'block';
    consultModal.setAttribute('aria-hidden','false');

    // ensure form visible and success hidden
    if (modalConsultForm) modalConsultForm.classList.remove('cta-hidden');
    if (consultSuccess) consultSuccess.classList.add('cta-hidden');

    // focus the first control inside the modal for accessibility
    setTimeout(() => {
      const firstControl = consultModal.querySelector('input, select, textarea, button');
      if (firstControl && typeof firstControl.focus === 'function') firstControl.focus();
    }, 300);

    // add escape key handler for the consult modal
    document.addEventListener('keydown', consultKeydownHandler);

    // close the doctor modal when opening consult popup
    closeDoctorModal();
  }
  function closeConsultModal() {
    if (!consultModal) return;
    consultModal.style.display = 'none';
    consultModal.setAttribute('aria-hidden','true');
    if (modalConsultForm && modalConsultForm.reset) modalConsultForm.reset();
    if (consultSuccess) consultSuccess.classList.add('cta-hidden');
    document.removeEventListener('keydown', consultKeydownHandler);
  }

  if (consultBtn) {
    consultBtn.addEventListener('click', () => {
      if (!selectedDoctor) { alert('Silakan pilih dokter terlebih dahulu.'); return; }
      // set selected doctor hidden value (shared form)
      const consultHiddenInput = document.getElementById('consultDoctor');
      if (consultHiddenInput) consultHiddenInput.value = selectedDoctor.name;
      openConsultModal();
    });
    // hide consult button initially
    consultBtn.classList.add('cta-hidden');
  }

  if (consultCancel) {
    consultCancel.addEventListener('click', () => {
      closeConsultModal();
    });
  }

  // close consult modal when pressing the close icon
  if (consultModalClose) {
    consultModalClose.addEventListener('click', () => {
      closeConsultModal();
    });
  }

  // close when clicking outside consult modal content
  window.addEventListener('click', (event) => {
    if (consultModal && event.target === consultModal) {
      closeConsultModal();
    }
  });

  if (modalConsultForm) {
    modalConsultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const parent = document.getElementById('consultParent').value;
      if (!parent) { alert('Mohon isi nama orang tua'); return; }
      // Show confirmation message (replace form)
      modalConsultForm.classList.add('cta-hidden');
      consultSuccess.classList.remove('cta-hidden');
      // Auto-reset and close after a short delay
      setTimeout(() => {
        closeConsultModal();
      }, 4000);
    });
  }



  // When modal opens/close ensure consult button/selection reset
  function resetSelection() {
    const consultHidden = document.querySelector('.modal-consult');
    if (consultHidden) consultHidden.classList.add('cta-hidden');
    selectedDoctor = null;
    const prev = doctorList.querySelector('.doctor-item.selected');
    if (prev) prev.classList.remove('selected');
    const selName = document.getElementById('selectedDoctorName'); if (selName) selName.textContent = '-';
    const consultDoctorInput = document.getElementById('consultDoctor'); if (consultDoctorInput) consultDoctorInput.value = '';
  }

  // call reset when modal hidden
  const modalObserver2 = new MutationObserver(() => {
    if (modal.style.display === 'none') resetSelection();
  });
  modalObserver2.observe(modal, { attributes: true, attributeFilter: ['style'] });

});

// Toggle class active for navbar (defensive selectors)
const navbarNav = document.querySelector('.navBar-nav');
const menuBtn = document.querySelector('#menu');

if (menuBtn && navbarNav) {
  menuBtn.addEventListener('click', function (e) {
    e.preventDefault();
    navbarNav.classList.toggle('active');
  });
}

// Tutup sidebar saat klik diluar
document.addEventListener('click', function (e) {
  if (navbarNav && menuBtn) {
    if (!menuBtn.contains(e.target) && !navbarNav.contains(e.target)) {
      navbarNav.classList.remove('active');
    }
  }
});

// Highlight navbar menu on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navBar-nav a');

function updateActiveNav() {
  // Only run scroll spy on homepage (where #home exists)
  if (!document.querySelector('#home')) return;

  let current = '';

  sections.forEach(section => {
    // Increased offset to account for Sticky Navbar (approx 100px) + Breathing room
    const sectionTop = section.offsetTop - 180;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');

    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// Run on scroll
window.addEventListener('scroll', updateActiveNav);
document.addEventListener('DOMContentLoaded', updateActiveNav);

// Scroll Animations (IntersectionObserver)
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      // Stop observing once shown (optional, keeps it cleaner)
      // observer.unobserve(entry.target); 
    }
  });
}, observerOptions);

// Select elements to animate
// We will programmatically add .hidden class then observe them to avoid cluttering HTML
document.addEventListener('DOMContentLoaded', () => {
  const elementsToAnimate = document.querySelectorAll('.service-card, .team-card, .about-img, .about .content, .fakta-item, section h2, .calc-container');

  elementsToAnimate.forEach((el, index) => {
    el.classList.add('hidden');
    // Add stagger delay based on index within its container? 
    // Simple random stagger for natural feel or just let CSS handle base transition
    observer.observe(el);
  });

  // Stagger check
  document.querySelectorAll('.service-container, .fakta-container').forEach(container => {
    const children = Array.from(container.children);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 100}ms`;
    });
  });
});


// Manual Team Slider (vanilla JS) - Preserved & Optimized
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.team-slider');
  if (!slider) return;

  const track = slider.querySelector('.team-track');
  let slides = Array.from(track.querySelectorAll('.team-card'));
  let currentIndex = 0;

  function getItemsToShow() {
    const w = window.innerWidth;
    if (w < 600) return 1;
    if (w < 1000) return 2;
    return 4;
  }

  let itemsToShow = getItemsToShow();

  function setSizes() {
    itemsToShow = getItemsToShow();
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${100 / itemsToShow}%`;
    });
    moveTo(currentIndex);
    createDots();
  }

  function moveTo(index) {
    const maxIndex = Math.max(0, slides.length - itemsToShow);
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;
    currentIndex = index;
    const offset = (currentIndex * (100 / itemsToShow));
    track.style.transform = `translateX(-${offset}%)`;
    updateDots();
  }

  // Controls - Fixed Logic
  const prevBtn = slider.querySelector('.team-prev');
  const nextBtn = slider.querySelector('.team-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling issues
      moveTo(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveTo(currentIndex + 1);
    });
  }

  // Dots
  const dotsContainer = slider.querySelector('.team-dots');
  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const count = Math.max(1, slides.length - itemsToShow + 1);
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'team-dot';
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => moveTo(i));
      dotsContainer.appendChild(btn);
    }
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = Array.from(dotsContainer.children);
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentIndex));
  }

  // Autoplay
  let autoplay = setInterval(() => moveTo(currentIndex + 1), 4000);
  slider.addEventListener('mouseenter', () => clearInterval(autoplay));
  slider.addEventListener('mouseleave', () => autoplay = setInterval(() => moveTo(currentIndex + 1), 4000));

  // Drag / swipe support (pointer events)
  let isDragging = false;
  let startX = 0;
  let currentDelta = 0;
  let startOffsetPercent = 0;

  function getTranslatePercent() {
    return currentIndex * (100 / itemsToShow);
  }

  function onPointerDown(e) {
    // Ignore if clicking on controls
    if (e.target.closest('.team-prev') || e.target.closest('.team-next') || e.target.closest('.team-dot')) {
      return;
    }

    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentDelta = 0;
    startOffsetPercent = getTranslatePercent();
    track.style.transition = 'none';
    clearInterval(autoplay);
    if (e.pointerId) slider.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentDelta = x - startX;
    const deltaPercent = (currentDelta / slider.clientWidth) * 100;
    const newPercent = startOffsetPercent - deltaPercent;
    track.style.transform = `translateX(-${newPercent}%)`;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const threshold = Math.max(40, slider.clientWidth * 0.12); // px
    if (Math.abs(currentDelta) > threshold) {
      if (currentDelta < 0) {
        moveTo(currentIndex + 1);
      } else {
        moveTo(currentIndex - 1);
      }
    } else {
      moveTo(currentIndex);
    }
    autoplay = setInterval(() => moveTo(currentIndex + 1), 4000);
    try { if (e.pointerId) slider.releasePointerCapture(e.pointerId); } catch (err) { }
  }

  // Pointer events (Unified for Mouse & Touch)
  // 'touch-action: pan-y' in CSS handles vertical scroll, we only care about horizontal drag here.

  slider.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp); // Handle cancel events

  // Remove redundant touch/mouse specific listeners to strictly use Pointer Events
  // This prevents issues where both touch and mouse events might fire or conflict

  // Ensure we don't interfere with vertical scrolling unless intended?
  // relying on browser 'touch-action' behavior is best.

  window.addEventListener('resize', () => setSizes());

  // init
  setSizes();

  if (window.feather) feather.replace();
});

// Stunting Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stuntingForm');
  const resultDiv = document.getElementById('calcResult');
  const ctaDiv = document.getElementById('calcCta');

  // Select elements that were created dynamically or need animation in new sections
  const newElements = document.querySelectorAll('.mpasi-card, .blog-card, .hpk-item, .imunisasi-wrapper');
  newElements.forEach(el => {
    el.classList.add('hidden');
    observer.observe(el);
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('calcName').value;
      const gender = document.getElementById('calcGender').value;
      const age = parseFloat(document.getElementById('calcAge').value);
      const height = parseFloat(document.getElementById('calcHeight').value);

      if (!name || isNaN(age) || isNaN(height)) {
        alert("Mohon isi semua data dengan benar.");
        return;
      }

      // Simplified WHO Logic (Demonstration)
      let threshold = 46; // base at 0
      if (age <= 6) threshold += (age * 2.5);
      else if (age <= 12) threshold = 61 + ((age - 6) * 1.6);
      else if (age <= 24) threshold = 71 + ((age - 12) * 0.8);
      else threshold = 81 + ((age - 24) * 0.5);

      if (gender === 'boy') threshold += 1;

      let status = "";
      let statusClass = "";
      let message = "";
      let showCta = false;

      if (height < threshold) {
        status = "Potensi Stunting";
        statusClass = "status-danger";
        message = `Perhatian: Tinggi anak (${height}cm) berada di bawah simulasi batas normal (${threshold.toFixed(1)}cm). Jangan panik, tapi segera konsultasikan.`;
        showCta = true;
      } else if (height < threshold + 3) {
        status = "Resiko Ringan";
        statusClass = "status-warning";
        message = `Waspada: Tinggi anak (${height}cm) mendekati batas bawah. Fokus pada perbaikan gizi protein hewani.`;
        showCta = true;
      } else {
        status = "Tumbuh Normal";
        statusClass = "status-normal";
        message = `Bagus! Tinggi anak (${height}cm) sesuai jalur pertumbuhan. Pertahankan pola makan sehat.`;
        showCta = false;
      }

      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
                <h3>Halo, Ayah/Bunda ${name}</h3>
                <p>Status Gizi (Simulasi): <span style="font-weight:bold; font-size:1.2rem;" class="${statusClass}">${status}</span></p>
                <p style="margin-top:0.5rem; font-size:0.95rem;">${message}</p>
            `;


      if (showCta) {
        ctaDiv.style.display = 'block';
        // Clear and create new button with event listener
        ctaDiv.innerHTML = '<p style="margin-bottom:0.8rem; font-weight:600;">Direkomendasikan penanganan segera:</p>';
        const btnContainer = document.createElement('div');
        const consultBtn = document.createElement('button');
        consultBtn.className = 'cta-btn-danger';
        consultBtn.textContent = 'Konsultasi Dokter Anak Sekarang';
        consultBtn.style.marginTop = '1rem';
        consultBtn.style.border = 'none';
        consultBtn.style.cursor = 'pointer';
        consultBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.openDoctorModalFromCTA();
        });
        btnContainer.appendChild(consultBtn);
        ctaDiv.appendChild(btnContainer);
      } else {
        ctaDiv.style.display = 'none';
      }

      // Scroll to result
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
});

// WOW Factors: Typing Effect
document.addEventListener('DOMContentLoaded', () => {
  const textElement = document.querySelector('.typing-text');
  if (!textElement) return;

  const words = ["Gemilang", "Sehat", "Cerdas", "Bebas Stunting"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 200;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      textElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 100;
    } else {
      textElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 200;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  type();
});

// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('.contact form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const inputs = this.querySelectorAll('input');
      const name = inputs[0].value;
      const contact = inputs[1].value; // Email/WA
      const message = inputs[2].value;

      if (!name || !contact || !message) {
        alert('Mohon lengkapi semua data.');
        return;
      }

      const subject = `Konsultasi Stunting - ${name}`;
      const body = `Halo Admin Klinik Smartone,%0D%0A%0D%0ASaya ingin berkonsultasi.%0D%0A%0D%0ANama: ${name}%0D%0AKontak (Email/WA): ${contact}%0D%0APesan/Keluhan:%0D%0A${message}%0D%0A%0D%0ATerima Kasih.`;

      // Open Mail Client
      window.location.href = `mailto:admin@smartone.id?subject=${subject}&body=${body}`;
    });
  }
});

// WOW Factors: Counter Up Animation
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.counter');
  const speed = 200; // The lower the slower

  const countFunction = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const updateCount = () => {
          const target = +counter.getAttribute('data-val');
          const count = +counter.innerText;

          // Lower increment = slower
          const inc = target / speed;

          if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 20);
          } else {
            counter.innerText = target + "+"; // Add plus sign
          }
        };
        updateCount();
        observer.unobserve(counter);
      }
    });
  }

  const counterObserver = new IntersectionObserver(countFunction, {
    threshold: 0.5
  });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });
});

// Hero Carousel Logic
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-slider .slide');
  if (slides.length === 0) return;

  let currentSlide = 0;
  const slideInterval = 5000; // 5 seconds

  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  setInterval(nextSlide, slideInterval);
});
