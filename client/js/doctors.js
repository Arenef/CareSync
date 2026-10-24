let DOCTORS_DATA = [
  {
    id: "doc-1",
    name: "BS.CKII Nguyễn Văn Bình",
    specialty: "Chuyên khoa Tim mạch",
    phone: "0900111222",
    email: "doc1@caresync.vn",
    isActive: true,
    avatar: "assets/images/doctor-1.jpg",
    room: "Phòng khám 201 (Tầng 2)",
    degree: "Bác sĩ Chuyên khoa II",
    position: "Trưởng khoa Tim mạch can thiệp",
    experience: "15+ năm kinh nghiệm điều trị bệnh lý tim mạch & mạch vành",
    bio: "Từng tu nghiệp chuyên sâu tại Viện Tim TP.HCM. Chuyên chẩn đoán, điều trị tăng huyết áp, rối loạn nhịp tim, suy tim và can thiệp mạch vành an toàn, hiệu quả.",
    workingSlots: ["08:00", "08:30", "09:00", "10:00", "14:00", "15:00"],
  },
  {
    id: "doc-2",
    name: "ThS.BS Trần Thị Lan Hương",
    specialty: "Chuyên khoa Nội tổng quát",
    phone: "0900222333",
    email: "doc2@caresync.vn",
    isActive: true,
    avatar: "assets/images/doctor-2.jpg",
    room: "Phòng khám 105 (Tầng 1)",
    degree: "Thạc sĩ Y khoa",
    position: "Phó khoa Khám bệnh & Nội tổng quát",
    experience: "12+ năm công tác trong lĩnh vực Nội khoa và sàng lọc sức khỏe",
    bio: "Chuyên gia chẩn đoán sớm và điều trị các bệnh lý chuyển hóa, đái tháo đường, gan mật, tiêu hóa và tư vấn sức khỏe định kỳ cho gia đình.",
    workingSlots: ["08:00", "09:00", "10:00", "14:30", "15:30", "16:00"],
  },
  {
    id: "doc-3",
    name: "PGS.TS Lê Minh Tuấn",
    specialty: "Chuyên khoa Nhi",
    phone: "0900333444",
    email: "doc3@caresync.vn",
    isActive: true,
    avatar: "assets/images/doctor-3.jpg",
    room: "Phòng khám 302 (Tầng 3)",
    degree: "Phó Giáo sư, Tiến sĩ Y học",
    position: "Cố vấn cấp cao Nhi khoa",
    experience: "20+ năm kinh nghiệm thăm khám và giảng dạy Y khoa",
    bio: "Chuyên gia đầu ngành Nhi khoa tổng quát, dinh dưỡng trẻ em, các bệnh đường hô hấp và tiêm chủng phòng ngừa cho trẻ sơ sinh và trẻ nhỏ.",
    workingSlots: ["08:30", "09:30", "10:30", "14:00", "15:00", "16:30"],
  },
  {
    id: "doc-4",
    name: "BS.CKI Phạm Thị Lan",
    specialty: "Chuyên khoa Da liễu",
    phone: "0900444555",
    email: "doc4@caresync.vn",
    isActive: true,
    avatar: "assets/images/doctor-4.jpg",
    room: "Phòng khám 401 (Tầng 4)",
    degree: "Bác sĩ Chuyên khoa I",
    position: "Bác sĩ Chuyên khoa Da liễu & Thẩm mỹ",
    experience: "8+ năm kinh nghiệm da liễu lâm sàng và laser thẩm mỹ",
    bio: "Chuyên điều trị mụn trứng cá, viêm da cơ địa, nám da, sẹo rỗ và các liệu trình phục hồi da chuyên sâu theo phác đồ y khoa hiện đại.",
    workingSlots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
  },
];

let selectedDoctorId = DOCTORS_DATA[0].id;
let onDoctorChangeCallback = null;

let directorySpecialtyFilter = "all";
let directorySearchQuery = "";

// Khởi tạo danh sách bác sĩ và bộ lọc tìm kiếm
async function initDoctors(onSelectCallback) {
  onDoctorChangeCallback = onSelectCallback;
  const doctorGrid = document.getElementById("doctorListGrid");
  const searchInput = document.getElementById("doctorSearchInput");

  // 💡 GỌI API LẤY DANH SÁCH BÁC SĨ THẬT TỪ DYNAMODB
  try {
    if (window.CareSyncAPI && window.CareSyncAPI.doctorApi) {
      const apiDoctors = await window.CareSyncAPI.doctorApi.getAll();
      if (apiDoctors && apiDoctors.length > 0) {
        DOCTORS_DATA = apiDoctors;
        selectedDoctorId = DOCTORS_DATA[0].id;
      }
    }
  } catch (error) {
    console.warn("Không kết nối được API DynamoDB, dùng dữ liệu dự phòng:", error.message);
  }

  if (doctorGrid) {
    renderDoctors(DOCTORS_DATA);
  }

  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const keyword = e.target.value.trim().toLowerCase();
      const filtered = DOCTORS_DATA.filter((doc) => {
        return (
          doc.name.toLowerCase().includes(keyword) ||
          doc.specialty.toLowerCase().includes(keyword)
        );
      });
      renderDoctors(filtered);
    });
  }

  // Khởi tạo danh bạ bác sĩ
  initDoctorDirectory();

  // Kích hoạt callback ban đầu với lựa chọn mặc định
  if (typeof onDoctorChangeCallback === "function") {
    onDoctorChangeCallback(getSelectedDoctor());
  }
}

// Khởi tạo danh sách danh bạ bác sĩ
function initDoctorDirectory() {
  const directoryGrid = document.getElementById("doctorsDirectoryGrid");
  const searchInput = document.getElementById("directorySearchInput");
  const tabButtons = document.querySelectorAll(
    "#directorySpecialtyTabs .tab-btn",
  );

  if (!directoryGrid) return;

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      directorySearchQuery = e.target.value.trim().toLowerCase();
      renderDoctorDirectory();
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      directorySpecialtyFilter = btn.dataset.specialty || "all";
      renderDoctorDirectory();
    });
  });

  renderDoctorDirectory();
}

// Hiển thị danh sách bác sĩ theo chuyên khoa và tìm kiếm
function renderDoctorDirectory() {
  const directoryGrid = document.getElementById("doctorsDirectoryGrid");
  const emptyState = document.getElementById("emptyDirectoryState");

  if (!directoryGrid) return;

  // Filter theo chuyên khoa
  let filtered = DOCTORS_DATA;
  if (directorySpecialtyFilter !== "all") {
    filtered = filtered.filter(
      (doc) => doc.specialty === directorySpecialtyFilter,
    );
  }

  // Filter tìm kiếm
  if (directorySearchQuery) {
    filtered = filtered.filter((doc) => {
      const q = directorySearchQuery;
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q)
      );
    });
  }

  directoryGrid.innerHTML = "";

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.add("show");
    return;
  }

  if (emptyState) emptyState.classList.remove("show");

  filtered.forEach((doc) => {
    const card = document.createElement("div");
    card.className = "directory-doctor-card";
    card.dataset.id = doc.id;

    card.innerHTML = `
      <div class="directory-card-top" style="cursor: pointer;" title="Bấm để xem hồ sơ phóng to và thông tin chi tiết">
        <div class="directory-avatar-container">
          <img src="${doc.avatar}" alt="${doc.name}" class="directory-avatar" loading="lazy">
        </div>
        <div class="directory-meta">
          <span class="badge ${doc.isActive ? "badge-primary" : "badge-neutral"}">${doc.isActive ? "Hoạt động" : "Tạm ngưng"}</span>
          <h3 class="directory-doctor-name">${doc.name}</h3>
          <span class="directory-doctor-sub">${doc.specialty}</span>
          <div class="directory-doctor-contact">
            <span class="contact-item">
              <span class="material-symbols-rounded contact-icon">phone</span>
              ${doc.phone}
            </span>
            <span class="contact-item">
              <span class="material-symbols-rounded contact-icon">mail</span>
              ${doc.email}
            </span>
          </div>
        </div>
      </div>
      <div class="directory-footer">
        <button type="button" class="btn btn-secondary btn-sm action-view-doc" data-id="${doc.id}">
          <span class="material-symbols-rounded" style="font-size: 16px; vertical-align: middle; margin-right: 2px;">visibility</span>
          <span>Xem chi tiết</span>
        </button>
        <button type="button" class="btn btn-primary btn-sm action-book-with-doc" data-id="${doc.id}" ${!doc.isActive ? "disabled" : ""}>
          <span>Đặt lịch với BS</span>
        </button>
      </div>
    `;

    // Click vào phần thân trên của card để mở modal
    const cardTop = card.querySelector(".directory-card-top");
    if (cardTop) {
      cardTop.addEventListener("click", () => {
        showDoctorDetailModal(doc.id);
      });
    }

    // Click nút "Xem chi tiết"
    const viewBtn = card.querySelector(".action-view-doc");
    if (viewBtn) {
      viewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showDoctorDetailModal(doc.id);
      });
    }

    // Click nút "Đặt lịch với BS"
    const bookBtn = card.querySelector(".action-book-with-doc");
    if (bookBtn) {
      bookBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectDoctor(doc.id);
        const bookingSection = document.getElementById("bookingSection");
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: "smooth" });
        }
        if (typeof showToast === "function") {
          showToast(
            "Đã chọn bác sĩ",
            `Đã chọn ${doc.name}. Vui lòng chọn ngày & giờ khám bên dưới!`,
            "success",
          );
        }
      });
    }

    directoryGrid.appendChild(card);
  });
}

// Hiển thị danh sách bác sĩ trên form đặt lịch
function renderDoctors(doctors) {
  const doctorGrid = document.getElementById("doctorListGrid");
  const emptyState = document.getElementById("emptyDoctorState");
  if (!doctorGrid) return;

  doctorGrid.innerHTML = "";

  if (doctors.length === 0) {
    if (emptyState) emptyState.classList.add("show");
    return;
  }

  if (emptyState) emptyState.classList.remove("show");

  doctors.forEach((doc) => {
    const isSelected = doc.id === selectedDoctorId;
    const card = document.createElement("div");
    card.className = `doctor-card ${isSelected ? "is-selected" : ""}`;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-pressed", isSelected ? "true" : "false");
    card.dataset.id = doc.id;
    card.title = "Bấm để chọn bác sĩ và xem thông tin chi tiết";

    card.innerHTML = `
      <button type="button" class="doctor-quick-view-btn" data-action="quick-view" title="Xem ảnh phóng to & hồ sơ chi tiết bác sĩ">
        <span class="material-symbols-rounded">zoom_in</span>
      </button>
      <div class="doctor-avatar-wrapper">
        <img src="${doc.avatar}" alt="${doc.name}" class="doctor-avatar" loading="lazy">
        <span class="doctor-check-icon" aria-hidden="true">&#10003;</span>
      </div>
      <div class="doctor-info">
        <h4 class="doctor-name">${doc.name}</h4>
        <span class="doctor-specialty">${doc.specialty}</span>
        <div class="doctor-badges">
          <span class="badge ${doc.isActive ? "badge-primary" : "badge-neutral"}">${doc.isActive ? "Hoạt động" : "Tạm ngưng"}</span>
        </div>
      </div>
    `;

    // Khi bấm vào ô bác sĩ: vừa chọn bác sĩ vừa mở modal xem thông tin phóng to
    const handleCardClick = (e) => {
      selectDoctor(doc.id);
      showDoctorDetailModal(doc.id);
    };

    // Nút soi ảnh nhanh
    const quickViewBtn = card.querySelector("[data-action='quick-view']");
    if (quickViewBtn) {
      quickViewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectDoctor(doc.id);
        showDoctorDetailModal(doc.id);
      });
    }

    card.addEventListener("click", handleCardClick);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick(e);
      }
    });

    doctorGrid.appendChild(card);
  });
}

// Mở modal hiển thị ảnh phóng to và chi tiết hồ sơ bác sĩ từ DB
function showDoctorDetailModal(doctorId) {
  const doc = DOCTORS_DATA.find((d) => d.id === doctorId);
  if (!doc) return;

  const avatarEl = document.getElementById("doctorModalAvatar");
  const nameEl = document.getElementById("doctorModalName");
  const specialtyEl = document.getElementById("doctorModalSpecialty");
  const degreeEl = document.getElementById("doctorModalDegree");
  const roomEl = document.getElementById("doctorModalRoom");
  const phoneEl = document.getElementById("doctorModalPhone");
  const emailEl = document.getElementById("doctorModalEmail");
  const idEl = document.getElementById("doctorModalId");
  const statusEl = document.getElementById("doctorModalStatus");
  const expEl = document.getElementById("doctorModalExp");
  const bioEl = document.getElementById("doctorModalBio");
  const slotsContainer = document.getElementById("doctorModalSlots");
  const bookBtn = document.getElementById("doctorModalBookBtn");

  // 1. Phóng to ảnh bác sĩ
  if (avatarEl) {
    avatarEl.src = doc.avatar || "assets/images/doctor-1.jpg";
    avatarEl.alt = doc.name;
  }

  // 2. Họ và tên, chuyên khoa
  if (nameEl) nameEl.textContent = doc.name;
  if (specialtyEl) specialtyEl.textContent = doc.specialty || "Đa khoa";

  // 3. Học vị & Chức vụ
  if (degreeEl) {
    const roleText = [doc.degree, doc.position].filter(Boolean).join(" • ");
    degreeEl.textContent = roleText || "Bác sĩ Chuyên khoa";
  }

  // 4. Mã bác sĩ trong CSDL
  if (idEl) idEl.textContent = doc.id;

  // 5. Trạng thái hoạt động
  if (statusEl) {
    statusEl.className = `badge ${doc.isActive ? "badge-primary" : "badge-neutral"}`;
    statusEl.textContent = doc.isActive ? "Đang hoạt động" : "Tạm ngưng tiếp nhận";
  }

  // 6. Phòng khám tiếp nhận
  if (roomEl) roomEl.textContent = doc.room || "Phòng khám Đa khoa";

  // 7. Kinh nghiệm làm việc
  if (expEl) expEl.textContent = doc.experience || "10+ năm kinh nghiệm trong ngành Y";

  // 8. Số điện thoại & Email liên hệ
  if (phoneEl) {
    phoneEl.textContent = doc.phone || "1900 1234";
    phoneEl.href = `tel:${(doc.phone || "").replace(/\s/g, "")}`;
  }
  if (emailEl) {
    emailEl.textContent = doc.email || "support@caresync.vn";
    emailEl.href = `mailto:${doc.email || ""}`;
  }

  // 9. Giới thiệu chuyên môn (Bio)
  if (bioEl) {
    bioEl.textContent =
      doc.bio ||
      "Bác sĩ có nhiều năm kinh nghiệm công tác trong ngành Y, chuyên môn cao và luôn tận tâm, chu đáo chăm sóc người bệnh.";
  }

  // 10. Các khung giờ khám tiếp nhận từ CSDL
  if (slotsContainer) {
    slotsContainer.innerHTML = "";
    const slots =
      doc.workingSlots && doc.workingSlots.length > 0
        ? doc.workingSlots
        : ["08:00", "08:30", "09:00", "09:30", "10:00", "14:00", "14:30", "15:00"];

    slots.forEach((s) => {
      const chip = document.createElement("span");
      chip.className = "doctor-modal-slot-chip";
      chip.textContent = s;
      slotsContainer.appendChild(chip);
    });
  }

  // 11. Nút hành động đặt lịch ngay từ Modal
  if (bookBtn) {
    bookBtn.disabled = !doc.isActive;
    bookBtn.onclick = () => {
      selectDoctor(doc.id);
      if (typeof closeModal === "function") {
        closeModal("doctorDetailModal");
      }
      const bookingSection = document.getElementById("bookingSection");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" });
      }
      if (typeof showToast === "function") {
        showToast(
          "Đã chọn bác sĩ",
          `Đã chọn ${doc.name}. Vui lòng chọn ngày & giờ khám bên dưới!`,
          "success",
        );
      }
    };
  }

  // 12. Mở modal hiển thị
  if (typeof openModal === "function") {
    openModal("doctorDetailModal");
  } else {
    const modal = document.getElementById("doctorDetailModal");
    if (modal) {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }
  }
}

// Chọn bác sĩ và cập nhật giao diện
function selectDoctor(doctorId) {
  selectedDoctorId = doctorId;

  // Cập nhật lại class selected trong DOM
  const cards = document.querySelectorAll(".doctor-card");
  cards.forEach((c) => {
    const isCurrent = c.dataset.id === doctorId;
    c.classList.toggle("is-selected", isCurrent);
    c.setAttribute("aria-pressed", isCurrent ? "true" : "false");
  });

  if (typeof onDoctorChangeCallback === "function") {
    onDoctorChangeCallback(getSelectedDoctor());
  }
}

// Trả về bác sĩ hiện tại
function getSelectedDoctor() {
  return DOCTORS_DATA.find((d) => d.id === selectedDoctorId) || null;
}

// Reset lại lựa chọn bác sĩ
function resetDoctorSelection() {
  selectedDoctorId = DOCTORS_DATA[0].id;
  const searchInput = document.getElementById("doctorSearchInput");
  if (searchInput) {
    searchInput.value = "";
  }
  renderDoctors(DOCTORS_DATA);
  if (typeof onDoctorChangeCallback === "function") {
    onDoctorChangeCallback(getSelectedDoctor());
  }
}

// Xuất hàm ra phạm vi toàn cục để tương tác từ các module khác
window.showDoctorDetailModal = showDoctorDetailModal;
window.selectDoctor = selectDoctor;
