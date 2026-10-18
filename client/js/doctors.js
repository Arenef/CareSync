let DOCTORS_DATA = [
  {
    id: "doc-1",
    name: "BS.CKII Nguyễn Văn Bình",
    specialty: "Chuyên khoa Tim mạch",
    phone: "0900111222",
    email: "doc1@caresync.vn",
    isActive: true,
    avatar: "assets/images/doctor-1.jpg",
  },
  {
    id: "doc-2",
    name: "ThS.BS Trần Thị Lan Hương",
    specialty: "Chuyên khoa Nội tổng quát",
    phone: "0900222333",
    email: "doc2@caresync.vn",
    isActive: true,
    avatar: "assets/images/doctor-2.jpg",
  },
  {
    id: "doc-3",
    name: "PGS.TS Lê Minh Tuấn",
    specialty: "Chuyên khoa Nhi",
    phone: "0900333444",
    email: "doc3@caresync.vn",
    isActive: true,
    avatar: "assets/images/doctor-3.jpg",
  },
  {
    id: "doc-4",
    name: "BS.CKI Phạm Thị Lan",
    specialty: "Chuyên khoa Da liễu",
    phone: "0900444555",
    email: "doc4@caresync.vn",
    isActive: true,
    avatar: "assets/images/doctor-4.jpg",
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
  // 💡 GỌI API LẤY 10 BÁC SĨ THẬT TỪ DYNAMODB
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

// Khởi tạo danh sách bác sĩ
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
      <div class="directory-card-top">
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
        <button type="button" class="btn btn-primary btn-sm action-book-with-doc" data-id="${doc.id}" ${!doc.isActive ? "disabled" : ""}>
          <span>Đặt lịch với BS</span>
        </button>
      </div>
    `;

    // Click "Đặt lịch với BS"
    const bookBtn = card.querySelector(".action-book-with-doc");
    if (bookBtn) {
      bookBtn.addEventListener("click", () => {
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

// Hiển thị danh sách bác sĩ
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

    card.innerHTML = `
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

    const handleSelect = () => {
      selectDoctor(doc.id);
    };

    card.addEventListener("click", handleSelect);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect();
      }
    });

    doctorGrid.appendChild(card);
  });
}

// Chọn bác sĩ và cập nhật
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
