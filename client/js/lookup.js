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

  // Dữ liệu bộ nhớ tạm sau khi tra cứu từ DynamoDB (KHÔNG dùng LocalStorage)
  let currentFetchedAppointments = [];
  let currentFilterTab = "all";
  let currentFilteredAppointments = [];
  let currentViewMode = "calendar"; // "calendar" | "list"
  let currentCalendarDate = new Date(); // Tháng đang xem
  let selectedCalendarDate = null; // Ngày được chọn dạng YYYY-MM-DD

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
    setupFilterTabs();
    initCancelOtpModal();

    // Khởi tạo trạng thái bảo mật ban đầu (chưa tra cứu -> 0 lịch hẹn)
    renderPromptState();
  }

  /**
   * Thiết lập liên kết "Lịch hẹn của tôi" trên Navbar
   */
  function setupNavLinks() {
    const navLinks = document.querySelectorAll(
      "a[href='#myAppointmentsSection']",
    );

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
   * Thiết lập sự kiện cho form tra cứu
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

    // Nút xóa nhanh nội dung -> trở về trạng thái yêu cầu nhập SĐT ban đầu
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearBtn.style.display = "none";
        clearError();
        searchInput.focus();
        currentFetchedAppointments = [];
        currentFilteredAppointments = [];
        currentViewMode = "calendar";
        currentCalendarDate = new Date();
        selectedCalendarDate = null;
        renderPromptState();
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
   * Thiết lập các Tab lọc trạng thái: Tất cả / Sắp tới / Đã hủy
   */
  function setupFilterTabs() {
    const tabButtons = document.querySelectorAll(".appointments-tabs .tab-btn");
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        currentFilterTab = btn.dataset.filter || "all";
        applyCurrentFilter();
      });
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
   * Hiển thị trạng thái bảo mật ban đầu khi chưa nhập số điện thoại
   */
  function renderPromptState() {
    updateCounts(0, 0, 0);
    if (emptyNotice) emptyNotice.classList.remove("show");

    if (appointmentsContainer) {
      appointmentsContainer.classList.remove("is-calendar-mode");
      appointmentsContainer.innerHTML = `
        <div class="appointments-prompt-state" style="grid-column: 1 / -1; text-align: center; padding: 48px var(--spacing-md); background: var(--color-bg-muted); border: 1px dashed var(--color-border); border-radius: var(--radius-lg);">
          <span class="material-symbols-rounded" style="font-size: 48px; color: var(--color-primary); margin-bottom: 12px; display: inline-block;">lock_person</span>
          <h4 style="font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); margin-bottom: 6px;">Tra cứu lịch hẹn cá nhân</h4>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); max-width: 500px; margin: 0 auto; line-height: 1.6;">
            Vì lý do bảo mật thông tin y tế, danh sách lịch hẹn không hiển thị công khai. Vui lòng <strong>nhập số điện thoại</strong> của bạn vào ô tìm kiếm bên trên và bấm nút <strong>Tra cứu</strong> để xem lịch khám.
          </p>
        </div>
      `;
    }
  }

  // Sử dụng tiện ích từ module CareSyncCalendar đã được tách
  const parseApptDate = (d) =>
    window.CareSyncCalendar ? window.CareSyncCalendar.parseApptDate(d) : null;
  const formatDateKey = (d) =>
    window.CareSyncCalendar ? window.CareSyncCalendar.formatDateKey(d) : "";
  const formatVietnameseDate = (d) =>
    window.CareSyncCalendar
      ? window.CareSyncCalendar.formatVietnameseDate(d)
      : "--";

  /**
   * Xác định tháng ban đầu để mở lịch dựa trên danh sách ca khám tìm được
   */
  function setupInitialCalendarDate(appointments) {
    if (window.CareSyncCalendar) {
      const init =
        window.CareSyncCalendar.setupInitialCalendarDate(appointments);
      currentCalendarDate = init.monthDate;
      selectedCalendarDate = init.selectedDateKey;
      return;
    }
    const now = new Date();
    currentCalendarDate = new Date(now.getFullYear(), now.getMonth(), 1);
    selectedCalendarDate = formatDateKey(now);
  }

  /**
   * Thực hiện tra cứu 100% từ AWS DynamoDB (GET /appointments?phone=...)
   */
  async function executeAppointmentLookup(phone) {
    const cleanPhone = phone.replace(/\s+/g, "");

    // Hiển thị trạng thái đang tải
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
    }

    if (appointmentsContainer) {
      appointmentsContainer.classList.remove("is-calendar-mode");
      appointmentsContainer.innerHTML = `
        <div class="appointments-loading-state" style="grid-column: 1 / -1; text-align: center; padding: 48px var(--spacing-md);">
          <div class="lookup-spinner" style="margin: 0 auto var(--spacing-sm);"></div>
          <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); font-weight: 500;">
            Đang tra cứu lịch hẹn trên AWS DynamoDB cho số điện thoại <strong>${cleanPhone}</strong>...
          </p>
        </div>
      `;
    }

    try {
      let appointments = [];

      // Gọi API trên AWS API Gateway (GET /appointments?phone=...)
      if (
        window.CareSyncAPI &&
        window.CareSyncAPI.appointmentApi &&
        typeof window.CareSyncAPI.appointmentApi.getByPhone === "function"
      ) {
        const apiRes =
          await window.CareSyncAPI.appointmentApi.getByPhone(cleanPhone);
        if (Array.isArray(apiRes)) {
          appointments = apiRes;
        }
      }

      currentFetchedAppointments = appointments;

      // Reset về Tab "Tất cả"
      currentFilterTab = "all";
      const tabButtons = document.querySelectorAll(
        ".appointments-tabs .tab-btn",
      );
      tabButtons.forEach((b) => {
        b.classList.toggle("is-active", (b.dataset.filter || "all") === "all");
      });

      if (currentFetchedAppointments.length > 0) {
        // Tự động chuyển giao diện sang dạng Calendar khi tìm thấy lịch hẹn
        setupInitialCalendarDate(currentFetchedAppointments);
        currentViewMode = "calendar";
        applyCurrentFilter();
        safeShowToast(
          "Tra cứu thành công",
          `Tìm thấy ${currentFetchedAppointments.length} lịch hẹn cho số điện thoại ${cleanPhone}`,
          "success",
        );
      } else {
        // Không tìm thấy bất kỳ lịch hẹn nào
        if (appointmentsContainer) {
          appointmentsContainer.classList.remove("is-calendar-mode");
          appointmentsContainer.innerHTML = "";
        }
        if (emptyNotice) {
          emptyNotice.classList.add("show");
          const emptyTitle = emptyNotice.querySelector("h4");
          const emptyDesc = emptyNotice.querySelector("p");
          if (emptyTitle) {
            emptyTitle.textContent = "Bạn không có lịch hẹn nào";
          }
          if (emptyDesc) {
            emptyDesc.textContent = `Không tìm thấy bất kỳ lịch hẹn nào gắn với số điện thoại ${cleanPhone}. Vui lòng kiểm tra lại số điện thoại hoặc đặt lịch khám mới.`;
          }
        }
        updateCounts(0, 0, 0);

        safeShowToast(
          "Không tìm thấy lịch hẹn",
          `Không tìm thấy lịch hẹn nào gắn với số điện thoại ${cleanPhone}. Vui lòng kiểm tra lại!`,
          "warning",
        );
      }
    } catch (error) {
      console.error("[Execute Lookup Error]:", error);
      if (appointmentsContainer) {
        appointmentsContainer.classList.remove("is-calendar-mode");
        appointmentsContainer.innerHTML = "";
      }
      if (emptyNotice) {
        emptyNotice.classList.add("show");
      }
      safeShowToast(
        "Lỗi kết nối",
        "Không thể tải lịch hẹn từ máy chủ AWS lúc này. Vui lòng thử lại sau!",
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
   * Lọc và hiển thị danh sách cuộc hẹn theo Tab hiện tại
   */
  function applyCurrentFilter() {
    if (!appointmentsContainer) return;

    if (
      !currentFetchedAppointments ||
      currentFetchedAppointments.length === 0
    ) {
      renderPromptState();
      return;
    }

    // Đếm số lượng theo trạng thái
    const upcomingCount = currentFetchedAppointments.filter(
      (a) => a.status === "upcoming" || a.status === "confirmed",
    ).length;
    const cancelledCount = currentFetchedAppointments.filter(
      (a) => a.status === "cancelled" || a.status === "da_huy",
    ).length;
    updateCounts(
      currentFetchedAppointments.length,
      upcomingCount,
      cancelledCount,
    );

    // Lọc theo tab
    let filtered = currentFetchedAppointments;
    if (currentFilterTab === "upcoming") {
      filtered = filtered.filter(
        (a) => a.status === "upcoming" || a.status === "confirmed",
      );
    } else if (currentFilterTab === "cancelled") {
      filtered = filtered.filter(
        (a) => a.status === "cancelled" || a.status === "da_huy",
      );
    }

    currentFilteredAppointments = filtered;
    appointmentsContainer.innerHTML = "";

    if (filtered.length === 0) {
      appointmentsContainer.classList.remove("is-calendar-mode");
      if (emptyNotice) {
        emptyNotice.classList.add("show");
        const emptyTitle = emptyNotice.querySelector("h4");
        const emptyDesc = emptyNotice.querySelector("p");
        if (emptyTitle) {
          emptyTitle.textContent = "Không có lịch hẹn nào";
        }
        if (emptyDesc) {
          emptyDesc.textContent =
            currentFilterTab === "upcoming"
              ? "Bạn không có lịch hẹn sắp tới nào."
              : "Bạn không có lịch hẹn nào đã hủy.";
        }
      }
      return;
    }

    if (emptyNotice) {
      emptyNotice.classList.remove("show");
    }

    // Hiển thị ở chế độ Calendar (mặc định) hoặc List
    if (currentViewMode === "calendar") {
      appointmentsContainer.classList.add("is-calendar-mode");
      renderCalendarView(filtered);
    } else {
      appointmentsContainer.classList.remove("is-calendar-mode");
      renderListView(filtered);
    }
  }

  /**
   * Render giao diện dạng Calendar khi tìm thấy lịch hẹn
   */
  function renderCalendarView(filtered) {
    if (!appointmentsContainer || !window.CareSyncCalendar) return;

    window.CareSyncCalendar.renderCalendarView({
      container: appointmentsContainer,
      appointments: filtered,
      currentDate: currentCalendarDate,
      selectedDate: selectedCalendarDate,
      role: "patient",
      renderCard: (appt) => createAppointmentCard(appt),
      emptyMessage: "Không có ca khám vào ngày này",
      emptySubtext:
        "Vui lòng chọn ngày có đánh dấu màu xanh trên lịch để xem phiếu hẹn khám đã đăng ký.",
      statsLabel: "ca khám",
      onMonthChange: (newDate) => {
        currentCalendarDate = newDate;
        selectedCalendarDate = null;
        applyCurrentFilter();
      },
      onDateSelect: (dateKey) => {
        selectedCalendarDate = dateKey;
      },
      onSwitchMode: (mode) => {
        currentViewMode = mode;
        applyCurrentFilter();
      },
    });
  }

  /**
   * Render dạng danh sách truyền thống (List View)
   */
  function renderListView(filtered) {
    if (!appointmentsContainer || !window.CareSyncCalendar) return;

    window.CareSyncCalendar.renderListView({
      container: appointmentsContainer,
      appointments: filtered,
      title: "Danh sách lịch khám",
      renderCard: (appt) => createAppointmentCard(appt),
      onSwitchMode: (mode) => {
        currentViewMode = mode;
        applyCurrentFilter();
      },
    });
  }

  /**
   * Tạo element thẻ lịch hẹn trực quan với thông tin đầy đủ
   */
  function createAppointmentCard(appt) {
    const isCancelled = appt.status === "cancelled" || appt.status === "da_huy";
    const statusBadge = isCancelled
      ? '<span class="badge badge-neutral">Đã hủy</span>'
      : '<span class="badge badge-success">Sắp tới</span>';

    const card = document.createElement("div");
    card.className = "appointment-card";
    card.dataset.id = appt.id;

    // Tự động đối chiếu thông tin bác sĩ từ Danh mục nếu thiếu
    const doctor =
      typeof window.getDoctorById === "function" && appt.doctorId
        ? window.getDoctorById(appt.doctorId)
        : null;

    const docName =
      appt.doctorName || (doctor && doctor.name) || "Bác sĩ phụ trách";
    const docSpec =
      appt.doctorSpecialty ||
      (doctor && doctor.specialty) ||
      "Chuyên khoa đa khoa";
    const docRoom =
      appt.doctorRoom || (doctor && doctor.room) || "Phòng khám 101";
    const docAvatar =
      appt.doctorAvatar ||
      (doctor && doctor.avatar) ||
      "assets/images/doctor-1.jpg";

    const dateVal =
      appt.date || appt.appointmentDate || appt.AppointmentDate || "--";
    const timeVal = appt.time || appt.slotTime || appt.SlotTime || "--";

    card.innerHTML = `
      <div class="appointment-card-header">
        <span class="appointment-code-badge">${appt.id}</span>
        ${statusBadge}
      </div>

      <div class="appointment-doctor-row">
        <img src="${docAvatar}" alt="${docName}" class="appointment-doc-avatar" loading="lazy" onerror="this.src='assets/images/doctor-1.jpg'">
        <div class="appointment-doc-meta">
          <h4 class="appointment-doc-name">${docName}</h4>
          <span class="appointment-doc-spec">${docSpec} &bull; ${docRoom}</span>
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
        appt.patientReason || appt.reason
          ? `
        <div class="appointment-reason-note">
          <strong>Lý do khám:</strong> ${appt.patientReason || appt.reason}
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
          window.openAppointmentTicketModal({
            ...appt,
            doctorName: docName,
            doctorSpecialty: docSpec,
            doctorRoom: docRoom,
            doctorAvatar: docAvatar,
          });
        }
      });
    }

    // Sự kiện Hủy lịch
    const cancelBtn = card.querySelector(".action-cancel-appt");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        openCancelOtpModal({
          ...appt,
          doctorName: docName,
          doctorSpecialty: docSpec,
          doctorRoom: docRoom,
          doctorAvatar: docAvatar,
        });
      });
    }

    return card;
  }

  /**
   * Quản lý trạng thái và logic Modal xác thực OTP hủy lịch
   */
  let currentCancelAppt = null;
  let resendCountdownTimer = null;

  function initCancelOtpModal() {
    const modal = document.getElementById("cancelOtpModal");
    const closeBtn = document.getElementById("cancelModalCloseBtn");
    const requestBtn = document.getElementById("cancelRequestOtpBtn");
    const confirmBtn = document.getElementById("cancelConfirmOtpBtn");
    const resendBtn = document.getElementById("cancelResendOtpBtn");
    const otpInput = document.getElementById("cancelOtpInput");

    if (!modal) return;

    if (closeBtn) {
      closeBtn.addEventListener("click", closeCancelOtpModal);
    }

    if (requestBtn) {
      requestBtn.addEventListener("click", handleRequestOtp);
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", handleConfirmOtp);
    }

    if (resendBtn) {
      resendBtn.addEventListener("click", handleResendOtp);
    }

    if (otpInput) {
      otpInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          handleConfirmOtp();
        }
      });
      otpInput.addEventListener("input", () => {
        const errorEl = document.getElementById("cancelOtpError");
        if (errorEl) errorEl.style.display = "none";
      });
    }
  }

  function openCancelOtpModal(appt) {
    currentCancelAppt = appt;
    const modal = document.getElementById("cancelOtpModal");
    if (!modal) return;

    // Reset về Bước 1
    const stepRequest = document.getElementById("cancelStepRequest");
    const stepVerify = document.getElementById("cancelStepVerify");
    const requestBtn = document.getElementById("cancelRequestOtpBtn");
    const confirmBtn = document.getElementById("cancelConfirmOtpBtn");
    const otpInput = document.getElementById("cancelOtpInput");
    const otpError = document.getElementById("cancelOtpError");

    if (stepRequest) stepRequest.style.display = "block";
    if (stepVerify) stepVerify.style.display = "none";
    if (requestBtn) {
      requestBtn.style.display = "inline-flex";
      requestBtn.disabled = false;
      requestBtn.innerHTML =
        '<span class="material-symbols-rounded" style="font-size: 18px; vertical-align: middle; margin-right: 4px">send</span><span>Gửi mã OTP qua Email</span>';
    }
    if (confirmBtn) confirmBtn.style.display = "none";
    if (otpInput) otpInput.value = "";
    if (otpError) otpError.style.display = "none";

    // Điền thông tin vào phiếu tóm tắt
    const targetCode = document.getElementById("cancelTargetCode");
    const targetDoctor = document.getElementById("cancelTargetDoctor");
    const targetTime = document.getElementById("cancelTargetTime");
    const targetPatient = document.getElementById("cancelTargetPatient");

    if (targetCode) targetCode.textContent = appt.id || "APT-...";
    if (targetDoctor)
      targetDoctor.textContent = appt.doctorName || appt.doctorId || "--";
    if (targetTime)
      targetTime.textContent = `${appt.time || ""}, ${appt.date || ""}`;
    if (targetPatient) targetPatient.textContent = appt.patientName || "--";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCancelOtpModal() {
    const modal = document.getElementById("cancelOtpModal");
    if (modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
    if (resendCountdownTimer) {
      clearInterval(resendCountdownTimer);
      resendCountdownTimer = null;
    }
    currentCancelAppt = null;
  }

  async function handleRequestOtp() {
    if (!currentCancelAppt) return;
    const requestBtn = document.getElementById("cancelRequestOtpBtn");
    const originalText = requestBtn ? requestBtn.innerHTML : "";

    try {
      if (requestBtn) {
        requestBtn.disabled = true;
        requestBtn.innerHTML = "<span>Đang gửi mã qua SNS...</span>";
      }

      // Chuẩn hóa slotKey đúng định dạng ISO YYYY-MM-DD#HH:mm
      let slotKey = currentCancelAppt.slotKey;
      if (!slotKey && currentCancelAppt.date && currentCancelAppt.time) {
        slotKey = `${currentCancelAppt.date}#${currentCancelAppt.time}`;
      }

      // Gọi API yêu cầu gửi mã OTP
      const res = await window.CareSyncAPI.appointmentApi.requestCancel({
        doctorId: currentCancelAppt.doctorId,
        slotKey: slotKey,
      });

      // Chuyển sang Bước 2: Nhập OTP
      const stepRequest = document.getElementById("cancelStepRequest");
      const stepVerify = document.getElementById("cancelStepVerify");
      const confirmBtn = document.getElementById("cancelConfirmOtpBtn");
      const maskedEmailEl = document.getElementById("cancelMaskedEmail");
      const otpInput = document.getElementById("cancelOtpInput");

      if (stepRequest) stepRequest.style.display = "none";
      if (stepVerify) stepVerify.style.display = "block";
      if (requestBtn) requestBtn.style.display = "none";
      if (confirmBtn) {
        confirmBtn.style.display = "inline-flex";
        confirmBtn.disabled = false;
        confirmBtn.innerHTML =
          '<span class="material-symbols-rounded" style="font-size: 18px; vertical-align: middle; margin-right: 4px">check_circle</span><span>Xác nhận hủy lịch</span>';
      }
      if (maskedEmailEl) {
        maskedEmailEl.textContent =
          res.maskedEmail || currentCancelAppt.patientEmail || "email của bạn";
      }
      if (otpInput) {
        otpInput.value = "";
        setTimeout(() => otpInput.focus(), 150);
      }

      startResendCooldown();
      safeShowToast(
        "Đã gửi mã OTP",
        "Vui lòng kiểm tra hộp thư email của bạn để lấy mã xác nhận 6 số.",
        "info",
      );
    } catch (err) {
      console.error("Lỗi yêu cầu OTP hủy lịch:", err);
      safeShowToast(
        "Gửi OTP thất bại",
        err.message || "Không thể kết nối đến máy chủ AWS.",
        "danger",
      );
      if (requestBtn) {
        requestBtn.disabled = false;
        requestBtn.innerHTML = originalText;
      }
    }
  }

  async function handleConfirmOtp() {
    if (!currentCancelAppt) return;
    const otpInput = document.getElementById("cancelOtpInput");
    const otpVal = otpInput ? otpInput.value.trim() : "";
    const otpError = document.getElementById("cancelOtpError");
    const confirmBtn = document.getElementById("cancelConfirmOtpBtn");

    if (!otpVal || otpVal.length !== 6) {
      if (otpError) {
        otpError.textContent = "Vui lòng nhập đủ 6 chữ số mã OTP!";
        otpError.style.display = "block";
      }
      return;
    }

    const originalBtnText = confirmBtn ? confirmBtn.innerHTML : "";
    try {
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = "<span>Đang xác thực OTP...</span>";
      }
      if (otpError) otpError.style.display = "none";

      let slotKey = currentCancelAppt.slotKey;
      if (!slotKey && currentCancelAppt.date && currentCancelAppt.time) {
        slotKey = `${currentCancelAppt.date}#${currentCancelAppt.time}`;
      }

      // Gọi API xác thực OTP và hủy lịch trên DynamoDB
      await window.CareSyncAPI.appointmentApi.confirmCancel({
        doctorId: currentCancelAppt.doctorId,
        slotKey: slotKey,
        otp: otpVal,
      });

      // Cập nhật trạng thái trong mảng bộ nhớ (KHÔNG dùng LocalStorage)
      const targetId = currentCancelAppt.id;
      const targetItem = currentFetchedAppointments.find(
        (a) => a.id === targetId,
      );
      if (targetItem) {
        targetItem.status = "cancelled";
      }

      closeCancelOtpModal();

      safeShowToast(
        "Hủy lịch thành công!",
        `Lịch hẹn #${targetId} đã được hủy trên hệ thống AWS DynamoDB.`,
        "success",
      );

      // Cập nhật lại giao diện và số lượng
      applyCurrentFilter();
    } catch (err) {
      console.error("Lỗi xác nhận OTP hủy lịch:", err);
      if (otpError) {
        otpError.textContent =
          err.message || "Mã OTP không chính xác hoặc đã hết hạn!";
        otpError.style.display = "block";
      }
      safeShowToast(
        "Xác thực thất bại",
        err.message || "Mã OTP không chính xác.",
        "danger",
      );
    } finally {
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalBtnText;
      }
    }
  }

  function handleResendOtp() {
    handleRequestOtp();
  }

  function startResendCooldown() {
    const resendBtn = document.getElementById("cancelResendOtpBtn");
    const timerText = document.getElementById("cancelResendTimerText");
    const countdownEl = document.getElementById("cancelTimerCountdown");

    if (!resendBtn || !timerText || !countdownEl) return;

    let seconds = 60;
    resendBtn.style.display = "none";
    timerText.style.display = "inline";
    countdownEl.textContent = seconds;

    if (resendCountdownTimer) clearInterval(resendCountdownTimer);

    resendCountdownTimer = setInterval(() => {
      seconds--;
      countdownEl.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(resendCountdownTimer);
        resendCountdownTimer = null;
        timerText.style.display = "none";
        resendBtn.style.display = "inline";
      }
    }, 1000);
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
  window.openCancelOtpModal = openCancelOtpModal;
  window.renderPromptState = renderPromptState;
  window.CareSyncLookup = {
    lookupByPhone: executeAppointmentLookup,
    applyCurrentFilter: applyCurrentFilter,
    openCancelOtpModal: openCancelOtpModal,
  };
})();
