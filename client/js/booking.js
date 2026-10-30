let selectedTimeSlot = null;
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
    dateInput.value = "";
    dateInput.addEventListener("change", handleDateChange);
  }

  // Khởi tạo các khung giờ khám
  renderBookingTimeSlots();

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
}

// Cập nhật thông tin bác sĩ
function updateSelectedDoctor(doc) {
  currentDoctor = doc;
  renderBookingTimeSlots();
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
  renderBookingTimeSlots();
  updateSummary();
}

/**
 * Render động và cập nhật trạng thái các khung giờ khám
 * - Theo khung giờ làm việc riêng của bác sĩ (workingSlots)
 * - Khóa các khung giờ đã trôi qua nếu ngày khám là ngày hôm nay
 */
function renderBookingTimeSlots() {
  const container = document.getElementById("timeSlotsGrid");
  if (!container) return;

  const dateInput = document.getElementById("appointmentDate");
  const selectedDateStr = dateInput ? dateInput.value : "";

  // 1. Xác định danh sách khung giờ theo bác sĩ đang chọn
  let slots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "14:00",
    "14:30",
    "15:00",
  ];
  if (
    currentDoctor &&
    Array.isArray(currentDoctor.workingSlots) &&
    currentDoctor.workingSlots.length > 0
  ) {
    slots = currentDoctor.workingSlots;
  }

  // 2. Kiểm tra nếu ngày khám được chọn là hôm nay
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const isToday = selectedDateStr === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  container.innerHTML = "";

  slots.forEach((time) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time-slot-btn";
    btn.dataset.time = time;
    btn.textContent = time;

    // Phân tích giờ/phút của ca khám
    const [h, m] = time.split(":").map(Number);
    const slotMinutes = h * 60 + (m || 0);

    // Khóa các khung giờ đã trôi qua nếu là ngày hôm nay
    const isPast = isToday && slotMinutes < currentMinutes;

    if (isPast) {
      btn.classList.add("is-unavailable");
      btn.disabled = true;
      btn.title = "Đã qua khung giờ khám";
      btn.setAttribute("aria-disabled", "true");
      // Nếu khung giờ này đang được chọn thì tự động hủy chọn
      if (selectedTimeSlot === time) {
        selectedTimeSlot = null;
      }
    } else {
      btn.title = "Khung giờ khả dụng";
      if (selectedTimeSlot === time) {
        btn.classList.add("is-selected");
      }
    }

    btn.addEventListener("click", () => {
      if (btn.disabled || btn.classList.contains("is-unavailable")) return;

      const allBtns = container.querySelectorAll(".time-slot-btn");
      allBtns.forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      selectedTimeSlot = time;
      updateSummary();
    });

    container.appendChild(btn);
  });

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
        doctorRoom: currentDoctor.room,
        doctorAvatar: currentDoctor.avatar,
        appointmentDate: rawDate,
        slotTime: selectedTimeSlot,
        patientName: patientName,
        patientPhone: patientPhone,
        patientEmail: patientEmail,
        reason: patientReason,
      });
      const bookedData = response.data || response;
      if (bookedData && (bookedData.id || bookedData.AppointmentId)) {
        appointmentId = bookedData.id || bookedData.AppointmentId;
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
    // Không tự động bung lịch hẹn ra vùng Lịch hẹn của tôi;
    // Người dùng chỉ xem được khi nhập số điện thoại để tra cứu
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
  const dateInput = document.getElementById("appointmentDate");
  if (dateInput) {
    dateInput.value = "";
  }

  // Reset giờ khám
  selectedTimeSlot = null;
  renderBookingTimeSlots();

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

// Mở phiếu khám (Ticket Modal)
function openAppointmentTicketModal(appt) {
  if (!appt) return;
  const ticketCodeEl = document.getElementById("ticketCode");
  const ticketDoctorEl = document.getElementById("ticketDoctor");
  const ticketSpecialtyEl = document.getElementById("ticketSpecialty");
  const ticketRoomEl = document.getElementById("ticketRoom");
  const ticketDateEl = document.getElementById("ticketDate");
  const ticketTimeEl = document.getElementById("ticketTime");
  const ticketPatientEl = document.getElementById("ticketPatient");
  const ticketPhoneEl = document.getElementById("ticketPhone");
  const ticketReasonEl = document.getElementById("ticketReason");

  if (ticketCodeEl) ticketCodeEl.textContent = appt.id || "--";
  if (ticketDoctorEl) ticketDoctorEl.textContent = appt.doctorName || "--";
  if (ticketSpecialtyEl) ticketSpecialtyEl.textContent = appt.doctorSpecialty || "--";
  if (ticketRoomEl)
    ticketRoomEl.textContent = appt.doctorRoom || "Phòng khám 101";
  if (ticketDateEl) ticketDateEl.textContent = appt.date || "--";
  if (ticketTimeEl) ticketTimeEl.textContent = appt.time || "--";
  if (ticketPatientEl) ticketPatientEl.textContent = appt.patientName || "--";
  if (ticketPhoneEl) ticketPhoneEl.textContent = appt.patientPhone || "--";
  if (ticketReasonEl)
    ticketReasonEl.textContent = appt.patientReason || appt.reason || "Khám định kỳ";

  const confirmationModal = document.getElementById("confirmationModal");
  if (confirmationModal) {
    confirmationModal.classList.add("is-open");
    confirmationModal.setAttribute("aria-hidden", "false");
  }
}

// Xuất các hàm dùng chung
window.openAppointmentTicketModal = openAppointmentTicketModal;
window.showToast = showToast;
