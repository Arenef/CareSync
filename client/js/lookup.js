(function () {
  "use strict";

  // Regex kiểm tra số điện thoại Việt Nam (10 chữ số, bắt đầu 03, 05, 07, 08, 09 hoặc +84)
  const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

  // DOM Elements
  let lookupForm = null;
  let searchInput = null;
  let clearBtn = null;
  let submitBtn = null;
  let errorMsg = null;
  let appointmentsContainer = null;
  let emptyNotice = null;

  /**
   * Khởi tạo module tra cứu
   */
  function initLookup() {
    lookupForm = document.getElementById("appointmentLookupForm");
    searchInput = document.getElementById("appointmentSearchInput");
    clearBtn = document.getElementById("appointmentSearchClearBtn");
    submitBtn = document.getElementById("sectionLookupSubmitBtn");
    errorMsg = document.getElementById("sectionLookupError");
    appointmentsContainer = document.getElementById("myAppointmentsList");
    emptyNotice = document.getElementById("emptyAppointmentsNotice");

    setupNavLinks();
    setupLookupForm();
  }

  /**
   * Thiết lập liên kết "Lịch hẹn của tôi" trên Navbar
   */
  function setupNavLinks() {
    const navLinks = document.querySelectorAll("a[href='#myAppointmentsSection']");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetSection = document.getElementById("myAppointmentsSection");
        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: "smooth" });
          if (searchInput) {
            setTimeout(() => {
              searchInput.focus();
              searchInput.select();
            }, 400);
          }
        }
      });
    });
  }

  /**
   * Thiết lập sự kiện cho form tra cứu tại Section
   */
  function setupLookupForm() {
    if (!lookupForm || !searchInput) return;

    // Xử lý khi gõ vào ô nhập: hiển thị nút xóa và xóa lỗi
    searchInput.addEventListener("input", () => {
      const val = searchInput.value.trim();
      if (clearBtn) {
        clearBtn.style.display = val.length > 0 ? "flex" : "none";
      }
      clearError();
    });

    // Nút xóa nhanh nội dung
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearBtn.style.display = "none";
        clearError();
        searchInput.focus();
        resetToAllAppointments();
      });
    }

    // Submit form tra cứu
    lookupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rawPhone = searchInput.value.trim();

      // Kiểm tra tính hợp lệ của số điện thoại
      if (!validatePhoneInput(rawPhone)) {
        return;
      }

      await executeAppointmentLookup(rawPhone);
    });
  }

  /**
   * Kiểm tra định dạng số điện thoại
   */
  function validatePhoneInput(phone) {
    const cleanPhone = phone.replace(/\s+/g, "");

    let message = "";
    if (!cleanPhone) {
      message = "Vui lòng nhập số điện thoại để tra cứu lịch hẹn";
    } else if (!VN_PHONE_REGEX.test(cleanPhone)) {
      message = "Số điện thoại không hợp lệ (Cần 10 chữ số, ví dụ: 0912345678)";
    }

    if (message) {
      showError(message);
      return false;
    }

    clearError();
    return true;
  }

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.add("show");
    }
    if (searchInput) {
      searchInput.classList.add("is-invalid");
      searchInput.focus();
    }
  }

  function clearError() {
    if (errorMsg && errorMsg.classList.contains("show")) {
      errorMsg.classList.remove("show");
    }
    if (searchInput) {
      searchInput.classList.remove("is-invalid");
    }
  }

  /**
   * Thực hiện tra cứu qua API của SV2 và cập nhật giao diện
   */
  async function executeAppointmentLookup(phone) {
    const cleanPhone = phone.replace(/\s+/g, "");

    // Hiển thị trạng thái đang tải
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
    }

    if (appointmentsContainer) {
      appointmentsContainer.innerHTML = `
        <div class="appointments-loading-state" style="grid-column: 1 / -1; text-align: center; padding: 48px var(--spacing-md);">
          <div class="lookup-spinner" style="margin: 0 auto var(--spacing-sm);"></div>
          <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); font-weight: 500;">
            Đang tra cứu lịch hẹn trên hệ thống CareSync cho số điện thoại <strong>${cleanPhone}</strong>...
          </p>
        </div>
      `;
    }

    try {
      let appointments = [];

      // 1. Gọi API của SV2 trên AWS API Gateway (GET /appointments?phone=...)
      if (
        window.CareSyncAPI &&
        window.CareSyncAPI.appointmentApi &&
        typeof window.CareSyncAPI.appointmentApi.getByPhone === "function"
      ) {
        try {
          appointments =
            await window.CareSyncAPI.appointmentApi.getByPhone(cleanPhone);
        } catch (apiErr) {
          console.warn("[Lookup API Call Warning]:", apiErr.message || apiErr);
        }
      }

      // 2. Fallback / Merge với dữ liệu demo trong localStorage
      const localAppointments = getLocalAppointments(cleanPhone);
      if (Array.isArray(localAppointments) && localAppointments.length > 0) {
        const existingIds = new Set(appointments.map((a) => a.id));
        localAppointments.forEach((localItem) => {
          if (!existingIds.has(localItem.id)) {
            appointments.push(localItem);
          }
        });
      }

      // 3. Hiển thị kết quả
      if (appointments && appointments.length > 0) {
        renderFilteredAppointments(appointments, cleanPhone);
        safeShowToast(
          "Tra cứu thành công",
          `Tìm thấy ${appointments.length} lịch hẹn cho số điện thoại ${cleanPhone}`,
          "success",
        );
      } else {
        // Không tìm thấy bất kỳ lịch hẹn nào
        if (appointmentsContainer) {
          appointmentsContainer.innerHTML = "";
        }
        if (emptyNotice) {
          emptyNotice.classList.add("show");
        }
        updateCounts(0, 0, 0);

        // YÊU CẦU: Bắn Toast khi không tìm thấy lịch hẹn
        safeShowToast(
          "Không tìm thấy lịch hẹn",
          `Không tìm thấy lịch hẹn nào gắn với số điện thoại ${cleanPhone}. Vui lòng kiểm tra lại!`,
          "warning",
        );
      }
    } catch (error) {
      console.error("[Execute Lookup Error]:", error);
      if (appointmentsContainer) {
        appointmentsContainer.innerHTML = "";
      }
      if (emptyNotice) {
        emptyNotice.classList.add("show");
      }
      safeShowToast(
        "Lỗi kết nối",
        "Không thể tải lịch hẹn lúc này. Vui lòng thử lại sau!",
        "danger",
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
      }
    }
  }

  /**
   * Lấy lịch hẹn từ localStorage
   */
  function getLocalAppointments(phone) {
    try {
      const raw = localStorage.getItem("caresync_appointments");
      if (!raw) return [];
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];

      const cleanTarget = phone.replace(/[^0-9]/g, "");
      return list.filter((appt) => {
        const apptPhone = (appt.patientPhone || "").replace(/[^0-9]/g, "");
        return (
          apptPhone === cleanTarget ||
          (appt.id && appt.id.toLowerCase() === phone.toLowerCase())
        );
      });
    } catch (e) {
      return [];
    }
  }

  /**
   * Render danh sách thẻ lịch hẹn tìm thấy vào #myAppointmentsList
   */
  function renderFilteredAppointments(list, phone) {
    if (!appointmentsContainer) return;

    if (emptyNotice) {
      emptyNotice.classList.remove("show");
    }

    appointmentsContainer.innerHTML = "";

    // Đếm số lượng theo trạng thái
    const upcomingCount = list.filter(
      (a) => a.status === "upcoming" || a.status === "confirmed",
    ).length;
    const cancelledCount = list.filter(
      (a) => a.status === "cancelled" || a.status === "da_huy",
    ).length;
    updateCounts(list.length, upcomingCount, cancelledCount);

    list.forEach((appt) => {
      const card = createAppointmentCard(appt);
      appointmentsContainer.appendChild(card);
    });
  }

  /**
   * Tạo element thẻ lịch hẹn trực quan
   */
  function createAppointmentCard(appt) {
    const isCancelled = appt.status === "cancelled" || appt.status === "da_huy";
    const statusBadge = isCancelled
      ? '<span class="badge badge-neutral">Đã hủy</span>'
      : '<span class="badge badge-success">Sắp tới</span>';

    const card = document.createElement("div");
    card.className = "appointment-card";
    card.dataset.id = appt.id;

    const dateVal = appt.date || appt.appointmentDate || "--";
    const timeVal = appt.time || appt.slotTime || "--";

    card.innerHTML = `
      <div class="appointment-card-header">
        <span class="appointment-code-badge">${appt.id}</span>
        ${statusBadge}
      </div>

      <div class="appointment-doctor-row">
        <img src="${appt.doctorAvatar || "assets/images/doctor-1.jpg"}" alt="${appt.doctorName || "Bác sĩ"}" class="appointment-doc-avatar" loading="lazy" onerror="this.src='assets/images/doctor-1.jpg'">
        <div class="appointment-doc-meta">
          <h4 class="appointment-doc-name">${appt.doctorName || "Bác sĩ phụ trách"}</h4>
          <span class="appointment-doc-spec">${appt.doctorSpecialty || "Chuyên khoa đa khoa"} &bull; ${appt.doctorRoom || "Phòng khám đa khoa"}</span>
        </div>
      </div>

      <div class="appointment-info-grid">
        <div class="appointment-info-col">
          <span class="appointment-info-label">Thời gian khám:</span>
          <span class="appointment-info-value highlight-time">${timeVal}, ${dateVal}</span>
        </div>
        <div class="appointment-info-col">
          <span class="appointment-info-label">Bệnh nhân:</span>
          <span class="appointment-info-value">${appt.patientName || "Khách hàng"}</span>
        </div>
        <div class="appointment-info-col">
          <span class="appointment-info-label">Số điện thoại:</span>
          <span class="appointment-info-value">${appt.patientPhone || "--"}</span>
        </div>
        <div class="appointment-info-col">
          <span class="appointment-info-label">Email:</span>
          <span class="appointment-info-value">${appt.patientEmail || "--"}</span>
        </div>
      </div>

      ${
        appt.patientReason
          ? `
        <div class="appointment-reason-note">
          <strong>Lý do khám:</strong> ${appt.patientReason}
        </div>
      `
          : ""
      }

      <div class="appointment-card-actions">
        <button type="button" class="btn btn-outline btn-sm action-view-ticket" data-id="${appt.id}">
          <span class="material-symbols-rounded" style="font-size: 16px; margin-right: 4px;">receipt_long</span>
          <span>Xem phiếu khám</span>
        </button>
        ${
          !isCancelled
            ? `
          <button type="button" class="btn btn-secondary btn-sm action-cancel-appt" data-id="${appt.id}" style="color: var(--color-danger);">
            <span class="material-symbols-rounded" style="font-size: 16px; margin-right: 4px;">cancel</span>
            <span>Hủy lịch</span>
          </button>
        `
            : ""
        }
      </div>
    `;

    // Sự kiện Xem phiếu khám -> mở confirmationModal
    const viewBtn = card.querySelector(".action-view-ticket");
    if (viewBtn) {
      viewBtn.addEventListener("click", () => {
        if (typeof window.openAppointmentTicketModal === "function") {
          window.openAppointmentTicketModal(appt);
        }
      });
    }

    // Sự kiện Hủy lịch
    const cancelBtn = card.querySelector(".action-cancel-appt");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        handleCancel(appt);
      });
    }

    return card;
  }

  /**
   * Xử lý hủy lịch
   */
  function handleCancel(appt) {
    const confirmed = confirm(
      `Bạn có chắc chắn muốn hủy lịch hẹn khám "${appt.id}" không?`,
    );
    if (!confirmed) return;

    if (typeof window.updateAppointmentInStorage === "function") {
      window.updateAppointmentInStorage(appt.id, { status: "cancelled" });
    }

    // Tải lại kết quả theo số điện thoại hiện tại
    const currentVal = searchInput ? searchInput.value.trim() : "";
    if (currentVal) {
      executeAppointmentLookup(currentVal);
    } else {
      resetToAllAppointments();
    }

    safeShowToast(
      "Đã hủy lịch khám",
      `Phiếu hẹn ${appt.id} đã được chuyển sang trạng thái đã hủy`,
      "info",
    );
  }

  /**
   * Khôi phục hiển thị tất cả lịch hẹn
   */
  function resetToAllAppointments() {
    if (typeof window.renderMyAppointments === "function") {
      window.renderMyAppointments();
    }
  }

  /**
   * Cập nhật số lượng trên các tab
   */
  function updateCounts(all, upcoming, cancelled) {
    const countAllEl = document.getElementById("countAll");
    const countUpcomingEl = document.getElementById("countUpcoming");
    const countCancelledEl = document.getElementById("countCancelled");

    if (countAllEl) countAllEl.textContent = all;
    if (countUpcomingEl) countUpcomingEl.textContent = upcoming;
    if (countCancelledEl) countCancelledEl.textContent = cancelled;
  }

  /**
   * Helper an toàn gọi Toast
   */
  function safeShowToast(title, message, type = "info") {
    if (typeof window.showToast === "function") {
      window.showToast(title, message, type);
    } else if (typeof showToast === "function") {
      showToast(title, message, type);
    } else {
      console.log(`[Toast ${type}]: ${title} - ${message}`);
    }
  }

  // Khởi động khi DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLookup);
  } else {
    initLookup();
  }

  // Xuất ra window
  window.CareSyncLookup = {
    lookupByPhone: executeAppointmentLookup,
    reset: resetToAllAppointments,
  };
})();
