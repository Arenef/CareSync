/**
 * ============================================================================
 * CareSync - Doctor Authentication & Portal Module (js/doctor-auth.js)
 * Cổng đăng nhập Bác sĩ bằng xác thực OTP Email & xem danh sách ca khám
 * ============================================================================
 */

(function () {
  "use strict";

  const STORAGE_KEY = "caresync_doctor_session";
  const DEMO_EMAIL = "doc1@caresync.vn";
  const DEMO_OTP = "123456";

  let currentTargetEmail = "";

  // Các phần tử DOM Header
  const loginTriggerBtn = document.getElementById("doctorLoginTriggerBtn");
  const profileHeader = document.getElementById("doctorProfileHeader");
  const headerAvatar = document.getElementById("doctorHeaderAvatar");
  const headerName = document.getElementById("doctorHeaderName");
  const logoutBtn = document.getElementById("doctorLogoutBtn");

  // Các phần tử DOM Modal
  const loginModal = document.getElementById("doctorLoginModal");
  const emailStepForm = document.getElementById("doctorEmailStepForm");
  const otpStepForm = document.getElementById("doctorOtpStepForm");
  const emailInput = document.getElementById("doctorLoginEmailInput");
  const otpInput = document.getElementById("doctorLoginOtpInput");
  const emailError = document.getElementById("doctorEmailError");
  const otpError = document.getElementById("doctorOtpError");
  const btnSendOtp = document.getElementById("btnSendDoctorOtp");
  const btnVerifyOtp = document.getElementById("btnVerifyDoctorOtp");
  const btnBackToEmail = document.getElementById("btnBackToEmailStep");
  const targetEmailText = document.getElementById("otpTargetEmailText");

  // Các phần tử DOM Section Lịch hẹn
  const apptsTitle = document.querySelector(".appointments-title");
  const apptsSubtitle = document.querySelector(".appointments-subtitle");
  const lookupForm = document.getElementById("appointmentLookupForm");
  const apptsGrid = document.getElementById("myAppointmentsList");

  // Lưu lại nội dung gốc của Section Lịch hẹn để khôi phục khi Đăng xuất
  let originalApptsTitle = apptsTitle
    ? apptsTitle.textContent
    : "Lịch hẹn của tôi";
  let originalApptsSubtitle = apptsSubtitle ? apptsSubtitle.textContent : "";

  // ==========================================================================
  // 1. KHỞI CHẠY VÀ KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP (LIFECYCLE)
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    initDoctorAuthEvents();
    checkExistingDoctorSession();
  });

  function initDoctorAuthEvents() {
    // Mở popup modal khi bấm nút Header
    if (loginTriggerBtn) {
      loginTriggerBtn.addEventListener("click", openDoctorLoginModal);
    }

    // Đóng popup khi bấm nền ngoài hoặc nút X
    if (loginModal) {
      loginModal.addEventListener("click", (e) => {
        if (
          e.target === loginModal ||
          e.target.matches("[data-action='close-doctor-login']")
        ) {
          closeDoctorLoginModal();
        }
      });
    }

    // Nút đăng xuất
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleDoctorLogout);
    }

    // Nút quay lại bước nhập email
    if (btnBackToEmail) {
      btnBackToEmail.addEventListener("click", () => {
        showStep(1);
      });
    }

    // Form Bước 1: Gửi mã OTP
    if (emailStepForm) {
      emailStepForm.addEventListener("submit", handleSendDoctorOtp);
    }

    // Form Bước 2: Xác nhận mã OTP
    if (otpStepForm) {
      otpStepForm.addEventListener("submit", handleVerifyDoctorOtp);
    }
  }

  // ==========================================================================
  // 2. XỬ LÝ MODAL POPUP & CHUYỂN BƯỚC
  // ==========================================================================
  function openDoctorLoginModal() {
    if (!loginModal) return;
    showStep(1);
    loginModal.classList.add("is-open");
    loginModal.style.display = "flex";
    loginModal.style.opacity = "1";
    loginModal.style.visibility = "visible";
    document.body.classList.add("modal-open");
    setTimeout(() => emailInput && emailInput.focus(), 100);
  }

  function closeDoctorLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove("is-open");
    loginModal.style.display = "none";
    loginModal.style.opacity = "0";
    loginModal.style.visibility = "hidden";
    document.body.classList.remove("modal-open");
    resetLoginForm();
  }

  function showStep(stepNumber) {
    clearErrors();
    if (stepNumber === 1) {
      emailStepForm.style.display = "block";
      otpStepForm.style.display = "none";
      if (emailInput) emailInput.focus();
    } else {
      emailStepForm.style.display = "none";
      otpStepForm.style.display = "block";
      if (targetEmailText) targetEmailText.textContent = currentTargetEmail;
      if (otpInput) {
        otpInput.value = "";
        otpInput.focus();
      }
    }
  }

  function resetLoginForm() {
    if (emailStepForm) emailStepForm.reset();
    if (otpStepForm) otpStepForm.reset();
    currentTargetEmail = "";
    clearErrors();
  }

  function clearErrors() {
    if (emailError) {
      emailError.textContent = "";
      emailError.style.display = "none";
    }
    if (otpError) {
      otpError.textContent = "";
      otpError.style.display = "none";
    }
    if (emailInput) emailInput.classList.remove("is-invalid");
    if (otpInput) otpInput.classList.remove("is-invalid");
  }

  function showError(type, message) {
    if (type === "email" && emailError && emailInput) {
      emailError.textContent = message;
      emailError.style.display = "block";
      emailInput.classList.add("is-invalid");
      emailInput.focus();
    } else if (type === "otp" && otpError && otpInput) {
      otpError.textContent = message;
      otpError.style.display = "block";
      otpInput.classList.add("is-invalid");
      otpInput.focus();
    }
  }

  // Kiểm tra định dạng email chuẩn regex
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ==========================================================================
  // 3. XỬ LÝ GỬI & XÁC THỰC MÃ OTP (API CALLS)
  // ==========================================================================
  async function handleSendDoctorOtp(e) {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim().toLowerCase();

    // 1. Kiểm tra định dạng email
    if (!email) {
      showError("email", "Vui lòng nhập địa chỉ email bác sĩ!");
      return;
    }
    if (!isValidEmail(email)) {
      showError(
        "email",
        "Định dạng email không hợp lệ (Ví dụ: bacsi@caresync.vn)!",
      );
      return;
    }

    setBtnLoading(btnSendOtp, true, "Đang kiểm tra & gửi mã...");

    try {
      let res = null;

      // Ưu tiên gọi API Backend nếu có kết nối
      if (window.CareSyncAPI && window.CareSyncAPI.doctorAuthApi) {
        try {
          res = await window.CareSyncAPI.doctorAuthApi.sendOtp(email);
        } catch (apiErr) {
          // Nếu là tài khoản test cứng DEMO_EMAIL thì cho phép fallback để test offline mượt mà
          if (email === DEMO_EMAIL) {
            res = {
              success: true,
              message: "Mã OTP đã được gửi!",
              debugOtp: DEMO_OTP,
            };
          } else {
            throw apiErr;
          }
        }
      } else {
        // Fallback test
        await new Promise((r) => setTimeout(r, 600));
        res = {
          success: true,
          message: "Mã OTP đã được gửi về email!",
          debugOtp: DEMO_OTP,
        };
      }

      currentTargetEmail = email;
      showStep(2);

      showToastNotification("Gửi mã OTP thành công!", "success");
    } catch (err) {
      console.error("Lỗi gửi OTP Bác sĩ:", err);
      showError(
        "email",
        err.message ||
          "Email này không tồn tại trong danh sách bác sĩ của hệ thống!",
      );
    } finally {
      setBtnLoading(btnSendOtp, false, "Gửi mã xác thực OTP");
    }
  }

  async function handleVerifyDoctorOtp(e) {
    e.preventDefault();
    clearErrors();

    const otp = otpInput.value.trim();
    if (!otp) {
      showError("otp", "Vui lòng nhập mã OTP!");
      return;
    }
    if (otp.length < 6) {
      showError("otp", "Mã OTP phải có đủ 6 chữ số!");
      return;
    }

    setBtnLoading(btnVerifyOtp, true, "Đang xác thực...");

    try {
      let doctor = null;

      // 1. Hỗ trợ test nhanh với tài khoản cứng
      if (currentTargetEmail === DEMO_EMAIL && otp === DEMO_OTP) {
        doctor = {
          id: "doc-1",
          DoctorId: "doc-1",
          Name: "BS.CKII Nguyễn Văn Bình",
          Specialty: "Chuyên khoa Tim mạch can thiệp",
          Avatar: "assets/images/doctor-1.jpg",
          Email: DEMO_EMAIL,
          Phone: "0900111222",
        };
      } else if (window.CareSyncAPI && window.CareSyncAPI.doctorAuthApi) {
        try {
          const res = await window.CareSyncAPI.doctorAuthApi.verifyOtp(
            currentTargetEmail,
            otp,
          );
          doctor = res.doctor;
        } catch (apiErr) {
          // Cho phép mã 123456 làm pass test
          if (otp === DEMO_OTP) {
            doctor = {
              id: "doc-1",
              DoctorId: "doc-1",
              Name: "BS.CKII Nguyễn Văn Bình",
              Specialty: "Chuyên khoa Tim mạch can thiệp",
              Avatar: "assets/images/doctor-1.jpg",
              Email: currentTargetEmail,
            };
          } else {
            throw apiErr;
          }
        }
      } else {
        if (otp === DEMO_OTP || otp.length === 6) {
          doctor = {
            id: "doc-1",
            DoctorId: "doc-1",
            Name: "BS.CKII Nguyễn Văn Bình",
            Specialty: "Chuyên khoa Tim mạch can thiệp",
            Avatar: "assets/images/doctor-1.jpg",
            Email: currentTargetEmail,
          };
        } else {
          throw new Error("Mã OTP không chính xác. Vui lòng thử lại!");
        }
      }

      // Đăng nhập thành công -> Lưu session
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doctor));
      closeDoctorLoginModal();
      applyDoctorSession(doctor);
      showToastNotification(
        `Đăng nhập thành công! Chào mừng ${doctor.Name}.`,
        "success",
      );
    } catch (err) {
      console.error("Lỗi xác thực OTP:", err);
      showError(
        "otp",
        err.message || "Mã OTP không chính xác hoặc đã hết hạn!",
      );
    } finally {
      setBtnLoading(btnVerifyOtp, false, "Xác nhận & Đăng nhập");
    }
  }

  // ==========================================================================
  // 4. ÁP DỤNG TRẠNG THÁI ĐĂNG NHẬP / ĐĂNG XUẤT TRÊN GIAO DIỆN
  // ==========================================================================
  function checkExistingDoctorSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const doctor = JSON.parse(raw);
        if (doctor && (doctor.id || doctor.DoctorId)) {
          applyDoctorSession(doctor);
        }
      }
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Danh sách các Section dành riêng cho bệnh nhân cần ẩn khi Bác sĩ đăng nhập
  const PATIENT_SECTION_IDS = [
    "hero",
    "workflow",
    "doctorsDirectorySection",
    "bookingSection",
  ];

  function togglePatientSections(show) {
    PATIENT_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = show ? "" : "none";
    });

    const primaryNav = document.getElementById("primaryNav");
    if (primaryNav) primaryNav.style.display = show ? "" : "none";

    const addMoreBtn = document.querySelector(
      ".appointments-header a[href='#bookingSection']",
    );
    if (addMoreBtn) addMoreBtn.style.display = show ? "" : "none";

    const apptsTag = document.querySelector(".appointments-tag");
    if (apptsTag)
      apptsTag.textContent = show ? "Quản lý lịch khám" : "CỔNG BÁC SĨ";
  }

  function applyDoctorSession(doctor) {
    if (!doctor) return;

    // 1. Cập nhật thanh Header
    if (loginTriggerBtn) loginTriggerBtn.style.display = "none";
    if (profileHeader) {
      profileHeader.style.display = "flex";
      if (headerName)
        headerName.textContent = doctor.Name || "Bác sĩ phụ trách";
      if (headerAvatar) {
        headerAvatar.src = doctor.Avatar || "assets/images/doctor-1.jpg";
        headerAvatar.alt = doctor.Name || "Bác sĩ";
      }
    }

    // 2. Ẩn toàn bộ các section và thanh điều hướng của bệnh nhân
    togglePatientSections(false);

    // 3. Chuyển đổi Section "Lịch hẹn" thành trang làm việc duy nhất của Bác Sĩ
    if (apptsTitle) {
      apptsTitle.innerHTML = `Lịch khám của <span style="color: var(--color-primary);">${doctor.Name}</span>`;
    }
    if (apptsSubtitle) {
      apptsSubtitle.textContent = `Danh sách toàn bộ bệnh nhân đã đặt lịch khám trực tiếp với ${doctor.Name} (${doctor.Specialty || "Phòng khám"}).`;
    }
    if (lookupForm) lookupForm.style.display = "none";
    if (apptsGrid) apptsGrid.classList.remove("is-calendar-mode");

    // Cuộn mượt lên đầu trang hiển thị ngay lịch khám
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 4. Tải danh sách ca khám của Bác sĩ
    loadDoctorAppointments(doctor);
  }

  function handleDoctorLogout() {
    localStorage.removeItem(STORAGE_KEY);

    // 1. Khôi phục Header & hiện lại thanh Navbar cùng các section của bệnh nhân
    if (loginTriggerBtn) loginTriggerBtn.style.display = "inline-flex";
    if (profileHeader) profileHeader.style.display = "none";
    togglePatientSections(true);

    // 2. Khôi phục Section Lịch hẹn về chế độ Bệnh nhân tra cứu
    if (apptsTitle) apptsTitle.textContent = originalApptsTitle;
    if (apptsSubtitle) apptsSubtitle.textContent = originalApptsSubtitle;
    if (lookupForm) lookupForm.style.display = "block";

    // Render lại danh sách trống hoặc dữ liệu ban đầu
    if (apptsGrid) {
      apptsGrid.classList.remove("is-calendar-mode");
      if (typeof window.renderPromptState === "function") {
        window.renderPromptState();
      } else {
        apptsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
            <p style="font-size: var(--font-size-md);">Vui lòng nhập số điện thoại ở trên để tra cứu phiếu hẹn khám của bạn.</p>
          </div>
        `;
      }
    }

    // Cuộn về đầu trang
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToastNotification("Đã đăng xuất khỏi Cổng Bác sĩ.", "info");
  }

  // ==========================================================================
  // 5. TẢI VÀ RENDER DANH SÁCH BỆNH NHÂN CỦA BÁC SĨ (VỚI TÌM KIẾM & BỘ LỌC)
  // ==========================================================================
  let currentDoctorAppointments = [];
  let currentFilter = "ALL"; // ALL, TODAY, TOMORROW
  let currentSearchQuery = "";
  let doctorViewMode = "calendar"; // "calendar" | "list"
  let doctorCalendarDate = new Date(); // Tháng đang xem
  let doctorSelectedCalendarDate = null; // Ngày được chọn YYYY-MM-DD

  function getSampleAppointments(doctorId) {
    return [
      {
        id: "APT-1730198400001",
        patientName: "Nguyễn Thị Mai",
        patientPhone: "0912345678",
        patientEmail: "mai.nguyen@gmail.com",
        appointmentDate: "Hôm nay",
        slotTime: "08:30 - 09:00",
        reason: "Khám sức khỏe tim mạch định kỳ, theo dõi huyết áp",
        status: "CONFIRMED",
      },
      {
        id: "APT-1730198400002",
        patientName: "Trần Văn Hùng",
        patientPhone: "0988776655",
        patientEmail: "hung.tran@gmail.com",
        appointmentDate: "Hôm nay",
        slotTime: "09:30 - 10:00",
        reason: "Huyết áp cao không ổn định, xin tư vấn điều chỉnh thuốc",
        status: "CONFIRMED",
      },
      {
        id: "APT-1730198400003",
        patientName: "Lê Hoàng Yến",
        patientPhone: "0903112233",
        patientEmail: "yen.le@gmail.com",
        appointmentDate: "Ngày mai",
        slotTime: "14:00 - 14:30",
        reason: "Tư vấn can thiệp mạch vành & xét nghiệm chỉ số tim",
        status: "CONFIRMED",
      },
      {
        id: "APT-1730198400004",
        patientName: "Phạm Quốc Tuấn",
        patientPhone: "0934556677",
        patientEmail: "tuan.pham@gmail.com",
        appointmentDate: "Hôm nay",
        slotTime: "10:30 - 11:00",
        reason: "Tái khám định kỳ và theo dõi chỉ số huyết áp",
        status: "CONFIRMED",
      },
      {
        id: "APT-1730198400005",
        patientName: "Đỗ Kim Ngân",
        patientPhone: "0977889900",
        patientEmail: "ngan.do@gmail.com",
        appointmentDate: "Ngày mai",
        slotTime: "15:30 - 16:00",
        reason: "Đau tức ngực trái khi vận động mạnh",
        status: "CONFIRMED",
      },
    ];
  }

  async function loadDoctorAppointments(doctor) {
    if (!apptsGrid) return;

    const doctorId = doctor.id || doctor.DoctorId;
    apptsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
        <p style="color: var(--color-text-secondary);">Đang đồng bộ danh sách ca khám...</p>
      </div>
    `;

    let list = [];
    try {
      let isApiSuccess = false;
      if (window.CareSyncAPI && window.CareSyncAPI.doctorAuthApi) {
        try {
          const apiRes =
            await window.CareSyncAPI.doctorAuthApi.getAppointments(doctorId);
          if (Array.isArray(apiRes)) {
            list = apiRes;
            isApiSuccess = true;
          }
        } catch (_) {
          isApiSuccess = false;
        }
      }

      if (!isApiSuccess) {
        list = [];
      }

      currentDoctorAppointments = list;
      currentFilter = "ALL";
      currentSearchQuery = "";
      if (window.CareSyncCalendar) {
        const init = window.CareSyncCalendar.setupInitialCalendarDate(list);
        doctorCalendarDate = init.monthDate;
        doctorSelectedCalendarDate = init.selectedDateKey;
      }
      doctorViewMode = "calendar";
      renderDoctorAppointmentsView(doctor);
    } catch (err) {
      console.warn("Nạp dữ liệu mẫu cho bác sĩ:", err);
      currentDoctorAppointments = getSampleAppointments(doctorId);
      currentFilter = "ALL";
      currentSearchQuery = "";
      if (window.CareSyncCalendar) {
        const init = window.CareSyncCalendar.setupInitialCalendarDate(
          currentDoctorAppointments,
        );
        doctorCalendarDate = init.monthDate;
        doctorSelectedCalendarDate = init.selectedDateKey;
      }
      doctorViewMode = "calendar";
      renderDoctorAppointmentsView(doctor);
    }
  }

  function renderDoctorAppointmentsView(doctor) {
    if (!apptsGrid) return;

    const todayDate = new Date();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    // Tính toán số lượng theo bộ lọc ngày chuẩn xác (hỗ trợ cả YYYY-MM-DD lẫn chuỗi hôm nay)
    const totalCount = currentDoctorAppointments.length;
    const todayCount = currentDoctorAppointments.filter((a) => {
      const rawDateStr =
        a.appointmentDate ||
        a.AppointmentDate ||
        a.date ||
        a.slotKey ||
        a.SlotKey ||
        "";
      if (!window.CareSyncCalendar) return false;
      const parsedD = window.CareSyncCalendar.parseApptDate(rawDateStr);
      return (
        (parsedD && window.CareSyncCalendar.isSameDay(parsedD, todayDate)) ||
        rawDateStr.toLowerCase().includes("hôm nay") ||
        rawDateStr.toLowerCase().includes("today")
      );
    }).length;

    const tomorrowCount = currentDoctorAppointments.filter((a) => {
      const rawDateStr =
        a.appointmentDate ||
        a.AppointmentDate ||
        a.date ||
        a.slotKey ||
        a.SlotKey ||
        "";
      if (!window.CareSyncCalendar) return false;
      const parsedD = window.CareSyncCalendar.parseApptDate(rawDateStr);
      return (
        (parsedD && window.CareSyncCalendar.isSameDay(parsedD, tomorrowDate)) ||
        rawDateStr.toLowerCase().includes("ngày mai") ||
        rawDateStr.toLowerCase().includes("tomorrow")
      );
    }).length;

    // 1. Tạo thanh điều khiển phía trên (Thanh tìm kiếm & Bộ lọc Tất cả / Hôm nay / Ngày mai)
    const topBar = document.createElement("div");
    topBar.style.cssText =
      "grid-column: 1 / -1; margin-bottom: 20px; display: flex; flex-direction: column; gap: 14px;";
    topBar.innerHTML = `
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 260px; position: relative;">
          <input
            type="text"
            id="doctorSearchInput"
            class="form-control"
            placeholder="Tìm theo tên bệnh nhân, số điện thoại, mã hẹn..."
            value="${currentSearchQuery}"
            style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--color-border); font-size: 14px; background: var(--color-surface); color: var(--color-text); outline: none;"
          />
          ${
            currentSearchQuery
              ? `<button type="button" id="btnClearSearch" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 14px; color: var(--color-text-secondary); cursor: pointer;">Xóa</button>`
              : ""
          }
        </div>
        <button type="button" class="btn btn-secondary" id="btnRefreshDoctorAppts" style="padding: 9px 16px; font-size: 13px; font-weight: 500; border-radius: 8px;">
          Làm mới
        </button>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-right: 4px;">Lọc ca khám:</span>
        
        <button type="button" class="doctor-filter-chip ${currentFilter === "ALL" ? "is-active" : ""}" data-filter="ALL" style="${getFilterChipStyle(currentFilter === "ALL")}">
          Tất cả <span style="${getBadgeStyle(currentFilter === "ALL")}">${totalCount}</span>
        </button>

        <button type="button" class="doctor-filter-chip ${currentFilter === "TODAY" ? "is-active" : ""}" data-filter="TODAY" style="${getFilterChipStyle(currentFilter === "TODAY")}">
          Hôm nay <span style="${getBadgeStyle(currentFilter === "TODAY")}">${todayCount}</span>
        </button>

        <button type="button" class="doctor-filter-chip ${currentFilter === "TOMORROW" ? "is-active" : ""}" data-filter="TOMORROW" style="${getFilterChipStyle(currentFilter === "TOMORROW")}">
          Ngày mai <span style="${getBadgeStyle(currentFilter === "TOMORROW")}">${tomorrowCount}</span>
        </button>
      </div>
    `;

    // 2. Lọc danh sách theo currentFilter & currentSearchQuery
    const filteredList = getFilteredAppointments();

    apptsGrid.innerHTML = "";
    apptsGrid.appendChild(topBar);

    // Gắn sự kiện Search & Filters
    setupTopControlsEvents(doctor);

    if (filteredList.length === 0) {
      apptsGrid.classList.remove("is-calendar-mode");
      const emptyDiv = document.createElement("div");
      emptyDiv.style.cssText =
        "grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--color-bg-muted); border-radius: var(--radius-md); border: 1px dashed var(--color-border);";
      emptyDiv.innerHTML = `
        <h4 style="margin: 0 0 6px; font-size: 15px; color: var(--color-text);">Không tìm thấy ca hẹn khám nào!</h4>
        <p style="color: var(--color-text-secondary); max-width: 460px; margin: 0 auto; font-size: 13px;">
          ${
            currentSearchQuery || currentFilter !== "ALL"
              ? "Không có ca khám nào khớp với từ khóa hoặc bộ lọc đã chọn. Vui lòng thử tìm từ khóa khác hoặc bấm 'Tất cả'."
              : "Hiện tại chưa có bệnh nhân nào đặt lịch với Bác sĩ."
          }
        </p>
        ${
          currentSearchQuery || currentFilter !== "ALL"
            ? `<button type="button" id="btnResetFilters" class="btn btn-outline btn-sm" style="margin-top: 12px; font-size: 12px;">Xóa bộ lọc</button>`
            : ""
        }
      `;
      apptsGrid.appendChild(emptyDiv);

      const resetFiltersBtn = emptyDiv.querySelector("#btnResetFilters");
      if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", () => {
          currentFilter = "ALL";
          currentSearchQuery = "";
          renderDoctorAppointmentsView(doctor);
        });
      }
      return;
    }

    // 3. Khung chứa Calendar hoặc List (Tái sử dụng module window.CareSyncCalendar)
    const calWrapper = document.createElement("div");
    calWrapper.style.cssText = "grid-column: 1 / -1; width: 100%;";
    apptsGrid.appendChild(calWrapper);

    if (doctorViewMode === "calendar" && window.CareSyncCalendar) {
      apptsGrid.classList.add("is-calendar-mode");
      window.CareSyncCalendar.renderCalendarView({
        container: calWrapper,
        appointments: filteredList,
        currentDate: doctorCalendarDate,
        selectedDate: doctorSelectedCalendarDate,
        role: "doctor",
        renderCard: (appt) => createDoctorAppointmentCard(appt, doctor),
        emptyMessage: "Bác sĩ không có ca khám vào ngày này",
        emptySubtext:
          "Chọn các ngày có chấm xanh trên lịch để xem danh sách ca khám của bệnh nhân.",
        statsLabel: "ca khám",
        onMonthChange: (newDate) => {
          doctorCalendarDate = newDate;
          doctorSelectedCalendarDate = null;
          renderDoctorAppointmentsView(doctor);
        },
        onDateSelect: (dateKey) => {
          doctorSelectedCalendarDate = dateKey;
        },
        onSwitchMode: (mode) => {
          doctorViewMode = mode;
          renderDoctorAppointmentsView(doctor);
        },
      });
    } else if (window.CareSyncCalendar) {
      apptsGrid.classList.remove("is-calendar-mode");
      window.CareSyncCalendar.renderListView({
        container: calWrapper,
        appointments: filteredList,
        title: `Danh sách ca khám của ${doctor.Name || "Bác sĩ"}`,
        renderCard: (appt) => createDoctorAppointmentCard(appt, doctor),
        onSwitchMode: (mode) => {
          doctorViewMode = mode;
          renderDoctorAppointmentsView(doctor);
        },
      });
    }
  }

  function setupTopControlsEvents(doctor) {
    const searchInput = document.getElementById("doctorSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        renderDoctorAppointmentsView(doctor);
        const newSearchInput = document.getElementById("doctorSearchInput");
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(
            newSearchInput.value.length,
            newSearchInput.value.length,
          );
        }
      });
    }

    const clearSearchBtn = document.getElementById("btnClearSearch");
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        currentSearchQuery = "";
        renderDoctorAppointmentsView(doctor);
      });
    }

    const filterChips = document.querySelectorAll(".doctor-filter-chip");
    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        currentFilter = chip.getAttribute("data-filter");
        renderDoctorAppointmentsView(doctor);
      });
    });

    const refreshBtn = document.getElementById("btnRefreshDoctorAppts");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        loadDoctorAppointments(doctor);
      });
    }
  }

  function getFilteredAppointments() {
    const todayDate = new Date();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    return currentDoctorAppointments.filter((item) => {
      const rawDateStr =
        item.appointmentDate ||
        item.AppointmentDate ||
        item.date ||
        item.slotKey ||
        item.SlotKey ||
        "";
      const parsedD = window.CareSyncCalendar
        ? window.CareSyncCalendar.parseApptDate(rawDateStr)
        : null;

      // 1. Lọc theo thời gian (Hôm nay / Ngày mai)
      if (currentFilter === "TODAY") {
        const isMatch =
          (parsedD && window.CareSyncCalendar.isSameDay(parsedD, todayDate)) ||
          rawDateStr.toLowerCase().includes("hôm nay") ||
          rawDateStr.toLowerCase().includes("today");
        if (!isMatch) return false;
      } else if (currentFilter === "TOMORROW") {
        const isMatch =
          (parsedD &&
            window.CareSyncCalendar.isSameDay(parsedD, tomorrowDate)) ||
          rawDateStr.toLowerCase().includes("ngày mai") ||
          rawDateStr.toLowerCase().includes("tomorrow");
        if (!isMatch) return false;
      }

      // 2. Lọc theo từ khóa tìm kiếm
      if (currentSearchQuery) {
        const id = (item.id || item.AppointmentId || "").toLowerCase();
        const patientName = (
          item.patientName ||
          item.PatientName ||
          ""
        ).toLowerCase();
        const patientPhone = (
          item.patientPhone ||
          item.PatientPhone ||
          ""
        ).toLowerCase();
        const reason = (
          item.reason ||
          item.Reason ||
          item.patientReason ||
          ""
        ).toLowerCase();

        const match =
          id.includes(currentSearchQuery) ||
          patientName.includes(currentSearchQuery) ||
          patientPhone.includes(currentSearchQuery) ||
          reason.includes(currentSearchQuery);

        if (!match) return false;
      }

      return true;
    });
  }

  function createDoctorAppointmentCard(appt, doctor) {
    const card = document.createElement("div");
    card.className = "appointment-card";
    const apptId = appt.id || appt.AppointmentId || "APT-0";
    const patientName = appt.patientName || appt.PatientName || "Bệnh nhân";
    const patientPhone = appt.patientPhone || appt.PatientPhone || "--";
    const patientEmail = appt.patientEmail || appt.PatientEmail || "--";
    const apptDate =
      appt.appointmentDate || appt.AppointmentDate || appt.date || "Hôm nay";
    const slotTime = appt.slotTime || appt.SlotTime || appt.time || "--";
    const reason = appt.reason || appt.Reason || appt.patientReason || "";
    const isCancelled =
      (appt.status || appt.Status || "").toLowerCase() === "cancelled" ||
      (appt.status || appt.Status || "").toLowerCase() === "da_huy";

    card.innerHTML = `
      <div class="appointment-card-header">
        <span class="appointment-code-badge">${apptId}</span>
        ${
          isCancelled
            ? '<span class="badge badge-neutral">Đã hủy</span>'
            : '<span class="badge badge-success">Đã xác nhận</span>'
        }
      </div>

      <div class="appointment-doctor-row" style="margin-bottom: 12px;">
        <div class="appointment-doc-meta">
          <h4 class="appointment-doc-name" style="font-size: 16px;">${patientName}</h4>
          <span class="appointment-doc-spec">Bệnh nhân &bull; SĐT: ${patientPhone}</span>
        </div>
      </div>

      <div class="appointment-info-grid">
        <div class="appointment-info-col">
          <span class="appointment-info-label">Thời gian khám:</span>
          <span class="appointment-info-value highlight-time">${slotTime}, ${apptDate}</span>
        </div>
        <div class="appointment-info-col">
          <span class="appointment-info-label">Bệnh nhân:</span>
          <span class="appointment-info-value">${patientName}</span>
        </div>
        <div class="appointment-info-col">
          <span class="appointment-info-label">Số điện thoại:</span>
          <span class="appointment-info-value">${patientPhone}</span>
        </div>
        <div class="appointment-info-col">
          <span class="appointment-info-label">Email:</span>
          <span class="appointment-info-value">${patientEmail}</span>
        </div>
      </div>

      ${
        reason
          ? `
        <div class="appointment-reason-note">
          <strong>Lý do khám:</strong> ${reason}
        </div>
      `
          : ""
      }

      <div class="appointment-card-actions">
        <button type="button" class="btn btn-outline btn-sm action-view-ticket" data-id="${apptId}">
          <span class="material-symbols-rounded" style="font-size: 16px; margin-right: 4px;">receipt_long</span>
          <span>Xem phiếu khám</span>
        </button>
      </div>
    `;

    const viewBtn = card.querySelector(".action-view-ticket");
    if (viewBtn) {
      viewBtn.addEventListener("click", () => {
        if (typeof window.openAppointmentTicketModal === "function") {
          window.openAppointmentTicketModal({
            id: apptId,
            patientName: patientName,
            patientPhone: patientPhone,
            patientEmail: patientEmail,
            patientReason: reason,
            date: apptDate,
            time: slotTime,
            doctorName: doctor?.Name || appt.doctorName || "Bác sĩ phụ trách",
            doctorSpecialty:
              doctor?.Specialty ||
              appt.doctorSpecialty ||
              "Chuyên khoa đa khoa",
            doctorRoom: doctor?.Room || appt.doctorRoom || "Phòng khám 101",
            doctorAvatar:
              doctor?.Avatar ||
              appt.doctorAvatar ||
              "assets/images/doctor-1.jpg",
          });
        }
      });
    }

    return card;
  }

  function getFilterChipStyle(isActive) {
    if (isActive) {
      return "display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 13px; font-weight: 600; border-radius: 20px; border: 1px solid var(--color-primary); background: var(--color-primary); color: #fff; cursor: pointer; transition: all 0.2s;";
    }
    return "display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 13px; font-weight: 500; border-radius: 20px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s;";
  }

  function getBadgeStyle(isActive) {
    if (isActive) {
      return "background: rgba(255, 255, 255, 0.25); color: #fff; font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 10px;";
    }
    return "background: var(--color-bg-muted); color: var(--color-text-muted); font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 10px;";
  }

  // ==========================================================================
  // 6. TIỆN ÍCH HỖ TRỢ (HELPERS)
  // ==========================================================================
  function setBtnLoading(btn, isLoading, text) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = text;
    if (isLoading) {
      btn.style.opacity = "0.75";
      btn.style.cursor = "not-allowed";
    } else {
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  }

  function showToastNotification(message, type = "info") {
    if (typeof window.showToast === "function") {
      const title =
        type === "success"
          ? "Cổng Bác sĩ"
          : type === "error"
            ? "Thông báo lỗi"
            : "Thông báo";
      window.showToast(title, message, type);
      return;
    }
    console.log(`[Toast ${type}]: ${message}`);
  }
})();
