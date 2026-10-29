let selectedTimeSlot = "08:30";
let currentDoctor = null;

// Khởi tạo ô booking
function initBooking() {
  const dateInput = document.getElementById("appointmentDate");
  const timeSlotButtons = document.querySelectorAll(".time-slot-btn");
  const bookingForm = document.getElementById("bookingForm");
  const resetBtn = document.getElementById("resetBookingBtn");

  // Chọn ngày bé nhất là hôm nay
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (dateInput) {
    dateInput.min = todayStr;
    // Chọn ngày mai mặc định nếu có thể
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomYyyy = tomorrow.getFullYear();
    const tomMm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const tomDd = String(tomorrow.getDate()).padStart(2, "0");
    dateInput.value = `${tomYyyy}-${tomMm}-${tomDd}`;
    dateInput.addEventListener("change", handleDateChange);
  }

  // Chọn giờ
  timeSlotButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled || btn.classList.contains("is-unavailable")) return;

      timeSlotButtons.forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      selectedTimeSlot = btn.dataset.time || btn.textContent.trim();
      updateSummary();
    });
  });

  // Realtime input listeners for summary & error clearing
  const patientNameInput = document.getElementById("patientName");
  const patientPhoneInput = document.getElementById("patientPhone");
  const patientEmailInput = document.getElementById("patientEmail");
  const patientReasonInput = document.getElementById("patientReason");

  [
    patientNameInput,
    patientPhoneInput,
    patientEmailInput,
    patientReasonInput,
  ].forEach((input) => {
    if (input) {
      input.addEventListener("input", () => {
        clearFieldError(input);
        updateSummary();
      });
    }
  });

  // Nút Submit
  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingSubmit);
  }

  // Nút Reset
  if (resetBtn) {
    resetBtn.addEventListener("click", handleBookingReset);
  }

  // Hiển thị tóm tắt
  updateSummary();

  // Khởi tạo My Appointments section
  initMyAppointments();
}

// Cập nhật thông tin bác sĩ
function updateSelectedDoctor(doc) {
  currentDoctor = doc;
  updateSummary();
}

// Định dạng ngày VN
function formatDateToVN(dateStr) {
  if (!dateStr) return "Chưa chọn ngày";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Xử lý thay đổi ngày
function handleDateChange(e) {
  const dateInput = e.target;
  const selectedDate = new Date(dateInput.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    showFieldError(dateInput, "Vui lòng không chọn ngày khám trong quá khứ");
  } else {
    clearFieldError(dateInput);
  }
  updateSummary();
}

// Cập nhật tóm tắt
function updateSummary() {
  const summaryDoctorEl = document.getElementById("summaryDoctor");
  const summarySpecialtyEl = document.getElementById("summarySpecialty");
  const summaryDateEl = document.getElementById("summaryDate");
  const summaryTimeEl = document.getElementById("summaryTime");
  const summaryPatientEl = document.getElementById("summaryPatient");
  const dateInput = document.getElementById("appointmentDate");
  const patientNameInput = document.getElementById("patientName");

  if (summaryDoctorEl) {
    summaryDoctorEl.textContent = currentDoctor
      ? currentDoctor.name
      : "Chưa chọn";
  }
  if (summarySpecialtyEl) {
    summarySpecialtyEl.textContent = currentDoctor
      ? currentDoctor.specialty
      : "--";
  }
  if (summaryDateEl) {
    const rawDate = dateInput ? dateInput.value : "";
    summaryDateEl.textContent = rawDate ? formatDateToVN(rawDate) : "Chưa chọn";
  }
  if (summaryTimeEl) {
    summaryTimeEl.textContent = selectedTimeSlot
      ? selectedTimeSlot
      : "Chưa chọn";
  }
  if (summaryPatientEl) {
    const nameVal = patientNameInput ? patientNameInput.value.trim() : "";
    summaryPatientEl.textContent = nameVal.length > 0 ? nameVal : "Chưa nhập";
  }
}

// Kiểm tra form
function validateBookingForm() {
  let isValid = true;

  const patientNameInput = document.getElementById("patientName");
  const patientPhoneInput = document.getElementById("patientPhone");
  const patientEmailInput = document.getElementById("patientEmail");
  const dateInput = document.getElementById("appointmentDate");

  // Kiểm tra bác sĩ
  if (!currentDoctor) {
    showToast(
      "Thiếu thông tin",
      "Vui lòng chọn một bác sĩ từ danh sách",
      "warning",
    );
    isValid = false;
  }

  // Kiểm tra ngày
  if (!dateInput || !dateInput.value) {
    showFieldError(dateInput, "Vui lòng chọn ngày khám");
    isValid = false;
  } else {
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showFieldError(dateInput, "Ngày khám không được trong quá khứ");
      isValid = false;
    }
  }

  // Chọn giờ khám
  if (!selectedTimeSlot) {
    showToast("Thiếu thông tin", "Vui lòng chọn một khung giờ khám", "warning");
    isValid = false;
  }

  // Tên bệnh nhân
  if (!patientNameInput || patientNameInput.value.trim().length < 2) {
    showFieldError(
      patientNameInput,
      "Vui lòng nhập họ và tên đầy đủ (tối thiểu 2 ký tự)",
    );
    isValid = false;
  }

  // Ktra sđt
  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  if (!patientPhoneInput || !phoneRegex.test(patientPhoneInput.value.trim())) {
    showFieldError(
      patientPhoneInput,
      "Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số, ví dụ 0912345678)",
    );
    isValid = false;
  }

  // Ktra email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patientEmailInput || !emailRegex.test(patientEmailInput.value.trim())) {
    showFieldError(patientEmailInput, "Vui lòng nhập địa chỉ email hợp lệ");
    isValid = false;
  }

  return isValid;
}

// Hiện lỗi input
function showFieldError(inputElement, errorMessage) {
  if (!inputElement) return;
  const formGroup = inputElement.closest(".form-group");
  if (formGroup) {
    formGroup.classList.add("has-error");
    const errorEl = formGroup.querySelector(".form-error-msg");
    if (errorEl) {
      errorEl.textContent = errorMessage;
    }
  }
}

// Xóa lỗi input
function clearFieldError(inputElement) {
  if (!inputElement) return;
  const formGroup = inputElement.closest(".form-group");
  if (formGroup) {
    formGroup.classList.remove("has-error");
  }
}

// Xử lý Submit đặt lịch qua AWS DynamoDB
async function handleBookingSubmit(e) {
  e.preventDefault();
  // 1. Kiểm tra tính hợp lệ của các ô nhập liệu
  if (!validateBookingForm()) {
    showToast(
      "Kiểm tra lại thông tin",
      "Vui lòng hoàn thành các trường bắt buộc theo đúng định dạng",
      "danger",
    );
    return;
  }
  // 2. Khóa nút bấm và hiển thị trạng thái đang xử lý
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Xác nhận đặt lịch";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Đang gửi lên AWS...</span>";
  }
  // 3. Thu thập dữ liệu từ Form
  const patientName = document.getElementById("patientName").value.trim();
  const patientPhone = document.getElementById("patientPhone").value.trim();
  const patientEmail = document.getElementById("patientEmail").value.trim();
  const patientReason =
    document.getElementById("patientReason").value.trim() ||
    "Khám tổng quát định kỳ";
  const rawDate = document.getElementById("appointmentDate").value;
  const formattedDate = formatDateToVN(rawDate);
  try {
    let appointmentId = "APT-" + Date.now();
    // 💡 4. GỌI API TẠO PHIẾU KHÁM TRÊN AWS DYNAMODB
    if (window.CareSyncAPI && window.CareSyncAPI.appointmentApi) {
      const response = await window.CareSyncAPI.appointmentApi.create({
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorSpecialty: currentDoctor.specialty,
        appointmentDate: rawDate,
        slotTime: selectedTimeSlot,
        patientName: patientName,
        patientPhone: patientPhone,
        patientEmail: patientEmail,
        reason: patientReason,
      });
      const bookedData = response.data || response;
      if (bookedData && bookedData.id) {
        appointmentId = bookedData.id;
      }
    }
    // 5. Điền thông tin lên Vé khám (Ticket Modal)
    const ticketCodeEl = document.getElementById("ticketCode");
    const ticketDoctorEl = document.getElementById("ticketDoctor");
    const ticketSpecialtyEl = document.getElementById("ticketSpecialty");
    const ticketRoomEl = document.getElementById("ticketRoom");
    const ticketDateEl = document.getElementById("ticketDate");
    const ticketTimeEl = document.getElementById("ticketTime");
    const ticketPatientEl = document.getElementById("ticketPatient");
    const ticketPhoneEl = document.getElementById("ticketPhone");
    const ticketReasonEl = document.getElementById("ticketReason");
    if (ticketCodeEl) ticketCodeEl.textContent = appointmentId;
    if (ticketDoctorEl) ticketDoctorEl.textContent = currentDoctor.name;
    if (ticketSpecialtyEl)
      ticketSpecialtyEl.textContent = currentDoctor.specialty;
    if (ticketRoomEl) ticketRoomEl.textContent = currentDoctor.room;
    if (ticketDateEl) ticketDateEl.textContent = formattedDate;
    if (ticketTimeEl) ticketTimeEl.textContent = selectedTimeSlot;
    if (ticketPatientEl) ticketPatientEl.textContent = patientName;
    if (ticketPhoneEl) ticketPhoneEl.textContent = patientPhone;
    if (ticketReasonEl) ticketReasonEl.textContent = patientReason;
    // 6. Lưu vào danh sách Lịch hẹn của tôi (LocalStorage)
    const newAppointment = {
      id: appointmentId,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      doctorSpecialty: currentDoctor.specialty,
      doctorRoom: currentDoctor.room,
      doctorAvatar: currentDoctor.avatar,
      date: formattedDate,
      rawDate: rawDate,
      time: selectedTimeSlot,
      patientName: patientName,
      patientPhone: patientPhone,
      patientEmail: patientEmail,
      patientReason: patientReason,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    };
    saveNewAppointment(newAppointment);
    renderMyAppointments();
    // 7. Mở cửa sổ popup Vé Khám
    const confirmationModal = document.getElementById("confirmationModal");
    if (confirmationModal) {
      confirmationModal.classList.add("is-open");
      confirmationModal.setAttribute("aria-hidden", "false");
    }
    showToast(
      "Đặt lịch thành công!",
      `Mã phiếu khám của bạn là: ${appointmentId}`,
      "success",
    );
    // sendTestEmail();
  } catch (error) {
    console.error("Lỗi đặt lịch:", error);
    // 💡 8. BẮT ĐÚNG MÃ LỖI 409 CONFLICT (CHỐNG TRÙNG LỊCH CỦA DYNAMODB)
    if (error.status === 409) {
      showToast(
        "Trùng lịch khám!",
        "Khung giờ này vừa có người đặt rồi! Vui lòng chọn khung giờ khác.",
        "warning",
      );
      // Khóa nút giờ này trên giao diện và bỏ chọn
      const timeSlotButtons = document.querySelectorAll(".time-slot-btn");
      timeSlotButtons.forEach((btn) => {
        if ((btn.dataset.time || btn.textContent.trim()) === selectedTimeSlot) {
          btn.classList.add("is-unavailable");
          btn.disabled = true;
          btn.classList.remove("is-selected");
        }
      });
      selectedTimeSlot = "";
      updateSummary();
    } else {
      showToast(
        "Đặt lịch thất bại",
        error.message || "Đã có lỗi xảy ra khi tạo phiếu khám.",
        "danger",
      );
    }
  } finally {
    // 9. Mở lại nút bấm khi đã xử lý xong
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// const TEST_EMAIL_API =
//   "https://wkiutrrdb8.execute-api.us-east-1.amazonaws.com/test-email";

// // Gửi email mẫu qua AWS Lambda + SNS
// async function sendTestEmail() {
//   try {
//     const response = await fetch(TEST_EMAIL_API, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({}),
//     });
//     const result = await response.json();
//     if (!response.ok || !result.success) {
//       throw new Error(result.message || "Không gửi được email mẫu");
//     }
//     console.log("Gửi email mẫu thành công:", result);
//   } catch (error) {
//     console.error("Lỗi gửi email mẫu:", error);
//     showToast(
//       "Không gửi được email",
//       "Đặt lịch demo vẫn được lưu, nhưng email mẫu chưa gửi thành công.",
//       "danger",
//     );
//   }
// }

// Đặt lại form
function handleBookingReset() {
  const confirmed = confirm(
    "Bạn có chắc chắn muốn đặt lại toàn bộ thông tin đã nhập trên biểu mẫu không?",
  );
  if (!confirmed) return;

  const form = document.getElementById("bookingForm");
  if (form) form.reset();

  // Reset lỗi
  const errorGroups = document.querySelectorAll(".form-group.has-error");
  errorGroups.forEach((g) => g.classList.remove("has-error"));

  // Reset ngày
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomYyyy = tomorrow.getFullYear();
  const tomMm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const tomDd = String(tomorrow.getDate()).padStart(2, "0");
  const dateInput = document.getElementById("appointmentDate");
  if (dateInput) {
    dateInput.value = `${tomYyyy}-${tomMm}-${tomDd}`;
  }

  // Reset giờ khám
  selectedTimeSlot = "08:30";
  const slotButtons = document.querySelectorAll(".time-slot-btn");
  slotButtons.forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.time === "08:30");
  });

  // Reset chọn bác sĩ
  if (typeof resetDoctorSelection === "function") {
    resetDoctorSelection();
  }

  updateSummary();
  showToast("Đã đặt lại", "Biểu mẫu đã được đưa về trạng thái ban đầu", "info");
}

function showToast(title, message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: "&#10004;",
    warning: "&#9888;",
    danger: "&#10006;",
    info: "&#8505;",
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || "&#8505;"}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Đóng thông báo">&times;</button>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  const removeToast = () => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 250);
  };

  closeBtn.addEventListener("click", removeToast);

  container.appendChild(toast);
  // Hiệu ứng
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Tự động đóng sau 4.5 giây
  setTimeout(removeToast, 4500);
}

/* Quản lý lịch hẹn */
const STORAGE_KEY_APPOINTMENTS = "caresync_appointments";
let currentAppointmentFilter = "all";
let currentAppointmentSearch = "";

// Khởi tạo lịch hẹn
function initMyAppointments() {
  seedInitialAppointments();
}

// tạo cuộc hẹn demo
function seedInitialAppointments() {
  const existing = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
  if (!existing || JSON.parse(existing).length === 0) {
    const sampleAppointments = [
      {
        id: "CS-108234",
        doctorId: "doc-1",
        doctorName: "BS.CKII Nguyễn Văn Bình",
        doctorSpecialty: "Chuyên khoa Tim mạch",
        doctorRoom: "Phòng khám 201 (Tầng 2)",
        doctorAvatar: "assets/images/doctor-1.jpg",
        date: "25/10/2026",
        rawDate: "2026-10-25",
        time: "08:30",
        patientName: "Trần Mai Anh",
        patientPhone: "0987654321",
        patientEmail: "maianh.tran@gmail.com",
        patientReason: "Tái khám theo dõi huyết áp định kỳ",
        status: "upcoming",
        createdAt: "2026-10-15T08:00:00.000Z",
      },
      {
        id: "CS-902145",
        doctorId: "doc-4",
        doctorName: "BS.CKI Phạm Thị Lan",
        doctorSpecialty: "Chuyên khoa Da liễu",
        doctorRoom: "Phòng khám 402 (Tầng 4)",
        doctorAvatar: "assets/images/doctor-4.jpg",
        date: "28/10/2026",
        rawDate: "2026-10-28",
        time: "14:30",
        patientName: "Lê Hoàng Nam",
        patientPhone: "0912345678",
        patientEmail: "hoangnam.le@gmail.com",
        patientReason: "Tư vấn điều trị viêm da dị ứng",
        status: "upcoming",
        createdAt: "2026-10-14T10:30:00.000Z",
      },
    ];
    localStorage.setItem(
      STORAGE_KEY_APPOINTMENTS,
      JSON.stringify(sampleAppointments),
    );
  }
}

// Lấy tất cả cuộc hẹn từ localStorage
function getAppointmentsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading appointments from storage:", err);
    return [];
  }
}

// Lưu cuộc hẹn
function saveNewAppointment(appt) {
  const list = getAppointmentsFromStorage();
  list.unshift(appt);
  localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(list));
}

// Cập nhật cuộc hẹn
function updateAppointmentInStorage(id, updates) {
  const list = getAppointmentsFromStorage();
  const index = list.findIndex((a) => a.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(list));
  }
}

// Đồng bộ danh sách ca khám (ủy thác cho module lookup)
function renderMyAppointments() {
  const searchInput = document.getElementById("appointmentSearchInput");
  const phone = searchInput ? searchInput.value.trim() : "";
  if (phone && window.CareSyncLookup && typeof window.CareSyncLookup.lookupByPhone === "function") {
    window.CareSyncLookup.lookupByPhone(phone);
  }
}

// Xuất các hàm lưu trữ cho toàn ứng dụng sử dụng
window.getAppointmentsFromStorage = getAppointmentsFromStorage;
window.saveNewAppointment = saveNewAppointment;
window.updateAppointmentInStorage = updateAppointmentInStorage;
window.renderMyAppointments = renderMyAppointments;
window.showToast = showToast;
