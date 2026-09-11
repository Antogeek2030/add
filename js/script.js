/* ============================================
   Woodsbridge Gutter Specialists - Main Script
   ============================================ */

/* -------------------------------------------------
   CUSTOMIZE: Formspree endpoint
   Replace the value below with your own Formspree form ID.
   Create a free form at https://formspree.io
   Example: "https://formspree.io/f/xxxxxxxx"
   ------------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xpwzgkqr"; // <-- CHANGE THIS

/* -------------------------------------------------
   CUSTOMIZE: Business details (used for mailto fallback)
   ------------------------------------------------- */
const BUSINESS_EMAIL = "info@woodsbridgegutterspecialists.com";
const BUSINESS_PHONE = "(555) 123-4567";

/* -------------------------------------------------
   CUSTOMIZE: Neighborhoods data
   You can also load from /data/neighborhoods.json
   ------------------------------------------------- */
const NEIGHBORHOODS = [
  "Downtown Woodsbridge",
  "Riverside Heights",
  "Oakridge Estates",
  "Maple Grove",
  "Pinecrest Village",
  "Lakeside Park",
  "Cedar Hollow",
  "Willow Creek",
  "Summit View",
  "Meadowbrook",
  "Hilltop Manor",
  "Brookside Terrace"
];

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initBeforeAfterSlider();
  initContactForm();
  renderNeighborhoods();
  setActiveNav();
});

/* ========== Mobile Navigation ========== */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("open", !isOpen);
  });

  // Close on link click (mobile)
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    });
  });
}

/* ========== Before / After Image Slider ========== */
function initBeforeAfterSlider() {
  const slider = document.querySelector(".ba-slider");
  if (!slider) return;

  const afterImg = slider.querySelector(".ba-after");
  const handle = slider.querySelector(".ba-handle");
  if (!afterImg || !handle) return;

  let isDragging = false;

  const updateSlider = (clientX) => {
    const rect = slider.getBoundingClientRect();
    let percent = ((clientX - rect.left) / rect.width) * 100;
    percent = Math.max(5, Math.min(95, percent));
    afterImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    handle.style.left = `${percent}%`;
  };

  const startDrag = (e) => {
    isDragging = true;
    slider.style.cursor = "ew-resize";
  };

  const stopDrag = () => {
    isDragging = false;
    slider.style.cursor = "";
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateSlider(clientX);
  };

  handle.addEventListener("mousedown", startDrag);
  handle.addEventListener("touchstart", startDrag, { passive: true });

  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: true });

  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("touchend", stopDrag);

  // Also allow clicking anywhere on the slider
  slider.addEventListener("click", (e) => {
    if (e.target === handle || handle.contains(e.target)) return;
    updateSlider(e.clientX);
  });
}

/* ========== Contact Form ========== */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll(".form-group").forEach((g) => g.classList.remove("has-error"));
    if (statusEl) {
      statusEl.className = "form-status";
      statusEl.textContent = "";
    }

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const phone = form.querySelector("#phone");
    const message = form.querySelector("#message");

    let valid = true;

    if (!name.value.trim()) {
      showError(name, "Please enter your name.");
      valid = false;
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
      showError(email, "Please enter a valid email address.");
      valid = false;
    }

    if (phone.value.trim() && !isValidPhone(phone.value)) {
      showError(phone, "Please enter a valid phone number.");
      valid = false;
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, "Please enter a message (at least 10 characters).");
      valid = false;
    }

    if (!valid) return;

    // Disable button while submitting
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          message: message.value.trim(),
          _subject: `New quote request from ${name.value.trim()}`
        })
      });

      if (response.ok) {
        form.reset();
        if (statusEl) {
          statusEl.className = "form-status success";
          statusEl.textContent = "Thank you! Your message has been sent. We'll get back to you soon.";
        }
      } else {
        throw new Error("Form submission failed");
      }
    } catch (err) {
      // Graceful mailto fallback
      const subject = encodeURIComponent(`Quote Request from ${name.value.trim()}`);
      const body = encodeURIComponent(
        `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\nPhone: ${phone.value.trim()}\n\nMessage:\n${message.value.trim()}`
      );
      const mailto = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;

      if (statusEl) {
        statusEl.className = "form-status error";
        statusEl.innerHTML = `Sorry, we couldn't send your message automatically. <a href="${mailto}">Click here to email us instead</a>.`;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });
}

function showError(input, msg) {
  const group = input.closest(".form-group");
  if (group) {
    group.classList.add("has-error");
    const err = group.querySelector(".error-msg");
    if (err) err.textContent = msg;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\s\-+().]{7,}$/.test(phone);
}

/* ========== Render Neighborhoods ========== */
function renderNeighborhoods() {
  const container = document.getElementById("neighborhoods-list");
  if (!container) return;

  container.innerHTML = NEIGHBORHOODS.map(
    (name) => `<div class="area-card"><strong>${name}</strong></div>`
  ).join("");
}

/* ========== Active Nav Link ========== */
function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html") || (path === "index.html" && href === "./index.html")) {
      link.classList.add("active");
    }
  });
}
