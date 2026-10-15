function initNavigation() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const primaryNav = document.getElementById("primaryNav");
  const navLinks = document.querySelectorAll(".nav-link");
  const heroCta = document.getElementById("heroBookingCta");
  const brandLogo = document.getElementById("brandLogo");
  const loginOpenBtns = document.querySelectorAll("[data-action='open-login']");
  const modals = document.querySelectorAll(".modal-overlay");

  // 1. Mobile Menu Hamburger Toggle
  if (hamburgerBtn && primaryNav) {
    hamburgerBtn.addEventListener("click", () => {
      const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
      hamburgerBtn.setAttribute("aria-expanded", String(!isExpanded));
      primaryNav.classList.toggle("is-open", !isExpanded);
    });

    // Đóng mobile khi click vào link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (primaryNav.classList.contains("is-open")) {
          primaryNav.classList.remove("is-open");
          hamburgerBtn.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Đóng khi click ngoài header
    document.addEventListener("click", (e) => {
      if (
        primaryNav.classList.contains("is-open") &&
        !primaryNav.contains(e.target) &&
        !hamburgerBtn.contains(e.target)
      ) {
        primaryNav.classList.remove("is-open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 2. Smooth Scrolling to Sections
  if (brandLogo) {
    brandLogo.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (heroCta) {
    heroCta.addEventListener("click", (e) => {
      e.preventDefault();
      const bookingSection = document.getElementById("bookingSection");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Xử lý khi click vào link
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        if (targetId === "#") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // Login Modal Triggers
  loginOpenBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("loginModal");
    });
  });

  // Đóng modal
  modals.forEach((modal) => {
    // Backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });

    // Close button inside modal
    const closeBtns = modal.querySelectorAll("[data-action='close-modal']");
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        closeModal(modal.id);
      });
    });
  });

  // Escape key global listener for modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModalEl = document.querySelector(".modal-overlay.is-open");
      if (openModalEl) {
        closeModal(openModalEl.id);
      }
    }
  });

  // form đăng nhập mẫu
  const loginForm = document.getElementById("demoLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      closeModal("loginModal");
      showToast(
        "Đăng nhập thành công (Demo)",
        "Chào mừng bạn quay trở lại với CareSync!",
        "success",
      );
    });
  }
}

// Mở modal theo ID
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const firstInput = modal.querySelector("input, button");
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
}

// Đóng modal theo ID
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // Khôi phục scroll
}
