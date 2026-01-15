// Toggle class active for navbar (defensive selectors)
const navbarNav = document.querySelector(".navBar-nav");
const menuBtn = document.querySelector("#menu");

if (menuBtn && navbarNav) {
  menuBtn.addEventListener("click", function (e) {
    e.preventDefault();
    navbarNav.classList.toggle("active");
  });
}

// Tutup sidebar saat klik diluar
document.addEventListener("click", function (e) {
  if (navbarNav && menuBtn) {
    if (!menuBtn.contains(e.target) && !navbarNav.contains(e.target)) {
      navbarNav.classList.remove("active");
    }
  }
});

// Highlight navbar menu on scroll
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".navBar-nav a");

function updateActiveNav() {
  // Only run scroll spy on homepage (where #home exists)
  if (!document.querySelector("#home")) return;

  let current = "";

  sections.forEach((section) => {
    // Increased offset to account for Sticky Navbar (approx 100px) + Breathing room
    const sectionTop = section.offsetTop - 180;
    const sectionHeight = section.offsetHeight;

    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// Run on scroll
window.addEventListener("scroll", updateActiveNav);
document.addEventListener("DOMContentLoaded", updateActiveNav);

// Scroll Animations (IntersectionObserver)
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      // Stop observing once shown (optional, keeps it cleaner)
      // observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Select elements to animate
// We will programmatically add .hidden class then observe them to avoid cluttering HTML
document.addEventListener("DOMContentLoaded", () => {
  const elementsToAnimate = document.querySelectorAll(
    ".service-card, .team-card, .about-img, .about .content, .fakta-item, section h2, .calc-container"
  );

  elementsToAnimate.forEach((el, index) => {
    el.classList.add("hidden");
    // Add stagger delay based on index within its container?
    // Simple random stagger for natural feel or just let CSS handle base transition
    observer.observe(el);
  });

  // Stagger check
  document
    .querySelectorAll(".service-container, .fakta-container")
    .forEach((container) => {
      const children = Array.from(container.children);
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 100}ms`;
      });
    });
});

// Manual Team Slider (vanilla JS) - Preserved & Optimized
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".team-slider");
  if (!slider) return;

  const track = slider.querySelector(".team-track");
  let slides = Array.from(track.querySelectorAll(".team-card"));
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
    slides.forEach((slide) => {
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
    const offset = currentIndex * (100 / itemsToShow);
    track.style.transform = `translateX(-${offset}%)`;
    updateDots();
  }

  // Controls - Fixed Logic
  const prevBtn = slider.querySelector(".team-prev");
  const nextBtn = slider.querySelector(".team-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent bubbling issues
      moveTo(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      moveTo(currentIndex + 1);
    });
  }

  // Dots
  const dotsContainer = slider.querySelector(".team-dots");
  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";
    const count = Math.max(1, slides.length - itemsToShow + 1);
    for (let i = 0; i < count; i++) {
      const btn = document.createElement("button");
      btn.className = "team-dot";
      btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
      btn.addEventListener("click", () => moveTo(i));
      dotsContainer.appendChild(btn);
    }
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = Array.from(dotsContainer.children);
    dots.forEach((d, idx) =>
      d.classList.toggle("active", idx === currentIndex)
    );
  }

  // Autoplay
  let autoplay = setInterval(() => moveTo(currentIndex + 1), 4000);
  slider.addEventListener("mouseenter", () => clearInterval(autoplay));
  slider.addEventListener(
    "mouseleave",
    () => (autoplay = setInterval(() => moveTo(currentIndex + 1), 4000))
  );

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
    if (
      e.target.closest(".team-prev") ||
      e.target.closest(".team-next") ||
      e.target.closest(".team-dot")
    ) {
      return;
    }

    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentDelta = 0;
    startOffsetPercent = getTranslatePercent();
    track.style.transition = "none";
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
    track.style.transition = "";
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
    try {
      if (e.pointerId) slider.releasePointerCapture(e.pointerId);
    } catch (err) {}
  }

  // Pointer events (Unified for Mouse & Touch)
  // 'touch-action: pan-y' in CSS handles vertical scroll, we only care about horizontal drag here.

  slider.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp); // Handle cancel events

  // Remove redundant touch/mouse specific listeners to strictly use Pointer Events
  // This prevents issues where both touch and mouse events might fire or conflict

  // Ensure we don't interfere with vertical scrolling unless intended?
  // relying on browser 'touch-action' behavior is best.

  window.addEventListener("resize", () => setSizes());

  // init
  setSizes();

  if (window.feather) feather.replace();
});

// Stunting Calculator Logic
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("stuntingForm");
  const resultDiv = document.getElementById("calcResult");
  const ctaDiv = document.getElementById("calcCta");

  // Select elements that were created dynamically or need animation in new sections
  const newElements = document.querySelectorAll(
    ".mpasi-card, .blog-card, .hpk-item, .imunisasi-wrapper"
  );
  newElements.forEach((el) => {
    el.classList.add("hidden");
    observer.observe(el);
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("calcName").value;
      const gender = document.getElementById("calcGender").value;
      const age = parseFloat(document.getElementById("calcAge").value);
      const height = parseFloat(document.getElementById("calcHeight").value);

      if (!name || isNaN(age) || isNaN(height)) {
        alert("Mohon isi semua data dengan benar.");
        return;
      }

      // Simplified WHO Logic (Demonstration)
      let threshold = 46; // base at 0
      if (age <= 6) threshold += age * 2.5;
      else if (age <= 12) threshold = 61 + (age - 6) * 1.6;
      else if (age <= 24) threshold = 71 + (age - 12) * 0.8;
      else threshold = 81 + (age - 24) * 0.5;

      if (gender === "boy") threshold += 1;

      let status = "";
      let statusClass = "";
      let message = "";
      let showCta = false;

      if (height < threshold) {
        status = "Potensi Stunting";
        statusClass = "status-danger";
        message = `Perhatian: Tinggi anak (${height}cm) berada di bawah simulasi batas normal (${threshold.toFixed(
          1
        )}cm). Jangan panik, tapi segera konsultasikan.`;
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

      resultDiv.style.display = "block";
      resultDiv.innerHTML = `
                <h3>Halo, Ayah/Bunda ${name}</h3>
                <p>Status Gizi (Simulasi): <span style="font-weight:bold; font-size:1.2rem;" class="${statusClass}">${status}</span></p>
                <p style="margin-top:0.5rem; font-size:0.95rem;">${message}</p>
            `;

      if (showCta) {
        ctaDiv.style.display = "block";
        // Clear and create new button with event listener
        ctaDiv.innerHTML =
          '<p style="margin-bottom:0.8rem; font-weight:600;">Direkomendasikan penanganan segera:</p>';
        const btnContainer = document.createElement("div");
        const consultBtn = document.createElement("button");
        consultBtn.className = "cta-btn-danger";
        consultBtn.textContent = "Konsultasi Dokter Anak Sekarang";
        consultBtn.style.marginTop = "1rem";
        consultBtn.style.border = "none";
        consultBtn.style.cursor = "pointer";
        consultBtn.addEventListener("click", (e) => {
          e.preventDefault();
          window.openDoctorModalFromCTA();
        });
        btnContainer.appendChild(consultBtn);
        ctaDiv.appendChild(btnContainer);
      } else {
        ctaDiv.style.display = "none";
      }

      // Scroll to result
      resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
});

// WOW Factors: Typing Effect
document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.querySelector(".typing-text");
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
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector(".contact form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const inputs = this.querySelectorAll("input");
      const name = inputs[0].value;
      const contact = inputs[1].value; // Email/WA
      const message = inputs[2].value;

      if (!name || !contact || !message) {
        alert("Mohon lengkapi semua data.");
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
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter");
  const speed = 200; // The lower the slower

  const countFunction = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const updateCount = () => {
          const target = +counter.getAttribute("data-val");
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
  };

  const counterObserver = new IntersectionObserver(countFunction, {
    threshold: 0.5,
  });

  counters.forEach((counter) => {
    counterObserver.observe(counter);
  });
});

// Hero Carousel Logic
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero-slider .slide");
  if (slides.length === 0) return;

  let currentSlide = 0;
  const slideInterval = 5000; // 5 seconds

  function nextSlide() {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }

  setInterval(nextSlide, slideInterval);
});

// Doctor Modal Logic
window.openDoctorModalFromCTA = function () {
  // Get today's day name
  const daysOfWeek = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const today = new Date();
  const dayName = daysOfWeek[today.getDay()];

  // Format date display
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("id-ID", dateOptions);

  // Get all doctors from team cards
  const doctorCards = document.querySelectorAll(".team-card");
  const doctorsOnDuty = [];

  doctorCards.forEach((card) => {
    const name = card.dataset.doctorName;
    const role = card.dataset.doctorRole;
    const image = card.dataset.doctorImage;
    const dutyDays = card.dataset.doctorDuty; // Format: "Senin, Rabu, Jumat"

    // Check if doctor is on duty today
    const dutyArray = dutyDays.split(", ");
    if (dutyArray.includes(dayName)) {
      doctorsOnDuty.push({ name, role, image });
    }
  });

  // Display modal
  const modal = document.getElementById("doctorModal");
  const doctorList = document.getElementById("doctorList");
  const todayDateEl = document.getElementById("todayDate");
  const carouselDots = document.getElementById("doctorCarouselDots");

  todayDateEl.textContent = formattedDate;

  if (doctorsOnDuty.length === 0) {
    doctorList.innerHTML = `
      <p style="text-align: center; padding: 2rem; color: #999;">
        Maaf, tidak ada dokter yang bertugas hari ini. 
        <br><br>
        <a href="#contact" style="color: var(--primary); text-decoration: underline;">
          Hubungi kami untuk jadwal konsultasi lain
        </a>
      </p>
    `;
    carouselDots.innerHTML = "";
    document.getElementById("doctorPrevBtn").style.display = "none";
    document.getElementById("doctorNextBtn").style.display = "none";
  } else {
    // Display doctors as carousel slides (2 per slide on desktop, 1 on mobile)
    doctorList.innerHTML = doctorsOnDuty
      .map(
        (doctor) => `
      <div class="doctor-carousel-item">
        <div class="doctor-card-modal">
          <div class="doctor-card-modal-image">
            <img src="${doctor.image}" alt="${
          doctor.name
        }" onerror="this.src='https://via.placeholder.com/150?text=Dokter'">
          </div>
          <div class="doctor-card-modal-info">
            <h3>${doctor.name}</h3>
            <p class="doctor-role">${doctor.role}</p>
            <p class="doctor-status">Bertugas hari ini</p>
            <a href="https://wa.me/6281234567890?text=Halo%20Dokter%20${encodeURIComponent(
              doctor.name
            )}%20dari%20Klinik%20Smartone" 
               target="_blank" class="doctor-contact-btn">
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // Calculate number of slides (1 item per slide)
    const itemsPerSlide = 1;
    const numSlides = Math.ceil(doctorsOnDuty.length / itemsPerSlide);

    // Create carousel dots
    carouselDots.innerHTML = Array.from({ length: numSlides })
      .map(
        (_, i) =>
          `<button class="doctor-carousel-dot ${
            i === 0 ? "active" : ""
          }" data-slide="${i}"></button>`
      )
      .join("");

    // Attach dot click handlers
    document.querySelectorAll(".doctor-carousel-dot").forEach((dot) => {
      dot.addEventListener("click", function () {
        const slideIndex = parseInt(this.dataset.slide);
        window.doctorCarouselCurrentSlide = slideIndex;
        window.updateDoctorCarouselPosition();
        window.updateDoctorCarouselDots();
      });
    });

    // Show carousel controls
    document.getElementById("doctorPrevBtn").style.display = "flex";
    document.getElementById("doctorNextBtn").style.display = "flex";

    // Initialize carousel
    window.doctorCarouselCurrentSlide = 0;
    window.doctorCarouselItemsPerSlide = itemsPerSlide;
    window.doctorCarouselNumSlides = numSlides;
    window.updateDoctorCarouselPosition();
  }

  modal.style.display = "flex";

  // Close modal on button click
  document.getElementById("closeDoctorModal").onclick = function () {
    modal.style.display = "none";
  };

  // Close modal on outside click
  modal.onclick = function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };

  // Carousel navigation
  document.getElementById("doctorPrevBtn").onclick = function () {
    window.doctorCarouselCurrentSlide =
      (window.doctorCarouselCurrentSlide - 1 + window.doctorCarouselNumSlides) %
      window.doctorCarouselNumSlides;
    window.updateDoctorCarouselPosition();
    window.updateDoctorCarouselDots();
  };

  document.getElementById("doctorNextBtn").onclick = function () {
    window.doctorCarouselCurrentSlide =
      (window.doctorCarouselCurrentSlide + 1) % window.doctorCarouselNumSlides;
    window.updateDoctorCarouselPosition();
    window.updateDoctorCarouselDots();
  };
};

// Helper functions for carousel
window.updateDoctorCarouselPosition = function () {
  const track = document.getElementById("doctorList");
  const itemsPerSlide = window.doctorCarouselItemsPerSlide || 1;
  const offset = -window.doctorCarouselCurrentSlide * 100;
  track.style.transform = `translateX(${offset}%)`;
};

window.updateDoctorCarouselDots = function () {
  document.querySelectorAll(".doctor-carousel-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === window.doctorCarouselCurrentSlide);
  });
};
