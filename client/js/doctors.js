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

let selectedDoctorId = null;
let onDoctorChangeCallback = null;

// Trạng thái bộ lọc Danh bạ bác sĩ
let directorySpecialtyFilter = "all";
let directorySearchQuery = "";

// Trạng thái bộ lọc Đặt lịch khám
let bookingSpecialtyFilter = "all";
let bookingSearchQuery = "";

/**
 * Chuẩn hóa chuỗi tìm kiếm (xóa dấu tiếng Việt, chuyển chữ thường)
 */
function normalizeString(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .trim();
}
if (typeof window !== "undefined") {
  window.normalizeString = normalizeString;
}

/**
 * Chuẩn hóa chuỗi chuyên khoa để so sánh linh hoạt (bỏ tiền tố/hậu tố 'khoa', 'chuyên khoa')
 */
function cleanSpecialtyName(str) {
  return normalizeString(str)
    .replace(/^(chuyen khoa|khoa)\s+/, "")
    .replace(/\s+khoa$/, "")
    .trim();
}

/**
 * Kiểm tra xem chuyên khoa của bác sĩ có khớp với bộ lọc không
 * Hỗ trợ khớp chính xác, khớp tương đối và tiền tố/hậu tố "Chuyên khoa" / "Khoa"
 */
function matchesSpecialty(docSpecialty, filterSpecialty) {
  if (!filterSpecialty || filterSpecialty === "all") return true;
  if (!docSpecialty) return false;

  const s1 = normalizeString(docSpecialty);
  const s2 = normalizeString(filterSpecialty);

  if (s1 === s2) return true;

  const clean1 = cleanSpecialtyName(docSpecialty);
  const clean2 = cleanSpecialtyName(filterSpecialty);

  if (clean1 === clean2) return true;
  if (clean1.includes(clean2) || clean2.includes(clean1)) return true;

  return false;
}

/**
 * Kiểm tra bác sĩ có khớp với từ khóa tìm kiếm hay không
 * Live search theo từng ký tự nhập vào (không dấu, chữ thường)
 * Tìm kiếm theo: Tên bác sĩ, Số điện thoại, Chuyên khoa, Học vị, Mã bác sĩ
 */
function doctorMatchesQuery(doc, query) {
  if (!query) return true;
  const q = normalizeString(query);
  if (!q) return true;

  // Gom các trường thông tin của bác sĩ (tên, số điện thoại, chuyên khoa, học vị, mã bác sĩ)
  // thành chuỗi chuẩn hóa không dấu để so khớp chuỗi ký tự nhập vào
  const searchableText = [
    doc.name,
    doc.phone,
    doc.specialty,
    doc.degree,
    doc.id,
    doc.DoctorId,
  ]
    .map(normalizeString)
    .join(" ");

  return searchableText.includes(q);
}


// Khởi tạo danh sách bác sĩ và bộ lọc tìm kiếm
async function initDoctors(onSelectCallback) {
  onDoctorChangeCallback = onSelectCallback;
  const searchInput = document.getElementById("doctorSearchInput");

  // 💡 GỌI API LẤY DANH SÁCH BÁC SĨ THẬT TỪ DYNAMODB
  try {
    if (window.CareSyncAPI && window.CareSyncAPI.doctorApi) {
      const apiDoctors = await window.CareSyncAPI.doctorApi.getAll();
      if (apiDoctors && apiDoctors.length > 0) {
        DOCTORS_DATA = apiDoctors;
        window.DOCTORS_DATA = DOCTORS_DATA;
      }
    }
  } catch (error) {
    console.warn(
      "Không kết nối được API DynamoDB, dùng dữ liệu dự phòng:",
      error.message,
    );
  }

  // 1. Khởi tạo bộ lọc & danh sách bác sĩ tại form Đặt lịch khám
  renderBookingSpecialtyTabs();
  filterBookingDoctors();

  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      bookingSearchQuery = e.target.value.trim();
      filterBookingDoctors();
    });
  }

  // 2. Khởi tạo danh bạ bác sĩ & bộ lọc Danh bạ
  initDoctorDirectory();

  // Kích hoạt callback ban đầu nếu có bác sĩ được chọn
  if (typeof onDoctorChangeCallback === "function" && selectedDoctorId) {
    onDoctorChangeCallback(getSelectedDoctor());
  }
}

// ============================================================================
// BỘ LỌC VÀ HIỂN THỊ TRÊN FORM ĐẶT LỊCH (BOOKING)
// ============================================================================

/**
 * Render động các nút lọc chuyên khoa tại Form Đặt lịch
 */
function renderBookingSpecialtyTabs() {
  const tabsContainer = document.getElementById("bookingSpecialtyTabs");
  if (!tabsContainer) return;

  const specialtySet = new Set();
  DOCTORS_DATA.forEach((doc) => {
    if (doc.specialty && doc.specialty.trim()) {
      specialtySet.add(doc.specialty.trim());
    }
  });

  const uniqueSpecialties = Array.from(specialtySet);

  let html = `
    <button type="button" class="tab-btn ${bookingSpecialtyFilter === "all" ? "is-active" : ""}" data-specialty="all">
      Tất cả (${DOCTORS_DATA.length})
    </button>
  `;

  uniqueSpecialties.forEach((spec) => {
    const isActive = bookingSpecialtyFilter === spec;
    const count = DOCTORS_DATA.filter((d) =>
      matchesSpecialty(d.specialty, spec),
    ).length;
    html += `
      <button type="button" class="tab-btn ${isActive ? "is-active" : ""}" data-specialty="${spec}">
        ${spec} (${count})
      </button>
    `;
  });

  tabsContainer.innerHTML = html;

  const tabButtons = tabsContainer.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      bookingSpecialtyFilter = btn.dataset.specialty || "all";
      filterBookingDoctors();
    });
  });
}

/**
 * Lọc bác sĩ trên form Đặt lịch theo chuyên khoa & từ khóa tìm kiếm
 */
function filterBookingDoctors() {
  let filtered = DOCTORS_DATA;

  // Lọc theo chuyên khoa
  if (bookingSpecialtyFilter !== "all") {
    filtered = filtered.filter((doc) =>
      matchesSpecialty(doc.specialty, bookingSpecialtyFilter),
    );
  }

  // Lọc theo từ khóa tìm kiếm (họ tên, chuyên khoa, học vị, mã BS...)
  if (bookingSearchQuery) {
    filtered = filtered.filter((doc) => doctorMatchesQuery(doc, bookingSearchQuery));
  }

  renderDoctors(filtered);
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
    card.title = "Bấm để chọn bác sĩ";

    card.innerHTML = `
      <div class="doctor-avatar-wrapper">
        <img src="${doc.avatar || "assets/images/doctor-placeholder.jpg"}" alt="${doc.name}" class="doctor-avatar" loading="lazy">
        <span class="doctor-check-icon" aria-hidden="true">&#10003;</span>
      </div>
      <div class="doctor-info">
        <h4 class="doctor-name">${doc.name}</h4>
        <span class="doctor-specialty">${doc.specialty || "Đa khoa"}</span>
        <div class="doctor-badges">
          <span class="badge ${doc.isActive ? "badge-primary" : "badge-neutral"}">${doc.isActive ? "Hoạt động" : "Tạm ngưng"}</span>
        </div>
      </div>
    `;

    // Khi bấm vào ô bác sĩ: chỉ chọn bác sĩ khám bệnh (không mở modal)
    const handleCardClick = (e) => {
      selectDoctor(doc.id);
    };

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

// ============================================================================
// BỘ LỌC VÀ HIỂN THỊ DANH BẠ BÁC SĨ (DOCTOR DIRECTORY)
// ============================================================================

/**
 * Render động các tab chuyên khoa cho Danh bạ từ DOCTORS_DATA
 */
function renderDirectoryTabs() {
  const tabsContainer = document.getElementById("directorySpecialtyTabs");
  if (!tabsContainer) return;

  const specialtySet = new Set();
  DOCTORS_DATA.forEach((doc) => {
    if (doc.specialty && doc.specialty.trim()) {
      specialtySet.add(doc.specialty.trim());
    }
  });

  const uniqueSpecialties = Array.from(specialtySet);

  let html = `
    <button type="button" class="tab-btn ${directorySpecialtyFilter === "all" ? "is-active" : ""}" data-specialty="all">
      Tất cả chuyên khoa (${DOCTORS_DATA.length})
    </button>
  `;

  uniqueSpecialties.forEach((spec) => {
    const isActive = directorySpecialtyFilter === spec;
    const count = DOCTORS_DATA.filter((d) =>
      matchesSpecialty(d.specialty, spec),
    ).length;
    html += `
      <button type="button" class="tab-btn ${isActive ? "is-active" : ""}" data-specialty="${spec}">
        ${spec} (${count})
      </button>
    `;
  });

  tabsContainer.innerHTML = html;

  const tabButtons = tabsContainer.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      directorySpecialtyFilter = btn.dataset.specialty || "all";
      renderDoctorDirectory();
    });
  });
}

// Khởi tạo danh sách danh bạ bác sĩ
function initDoctorDirectory() {
  const directoryGrid = document.getElementById("doctorsDirectoryGrid");
  const searchInput = document.getElementById("directorySearchInput");
  const searchBtn = document.getElementById("btnDirectorySearch");
  const searchIcon = document.getElementById("directorySearchIcon");

  if (!directoryGrid) return;

  // Render động các tab chuyên khoa từ danh sách bác sĩ
  renderDirectoryTabs();

  const handleDirectorySearch = (val) => {
    directorySearchQuery = (val || "").trim();
    // Khi người dùng gõ tìm kiếm từ khóa, nếu đang ở tab chuyên khoa hẹp thì tự động chuyển về tất cả để tìm bao quát
    if (directorySearchQuery && directorySpecialtyFilter !== "all") {
      directorySpecialtyFilter = "all";
      const tabs = document.querySelectorAll("#directorySpecialtyTabs .tab-btn");
      tabs.forEach((t) => {
        if (t.dataset.specialty === "all") t.classList.add("is-active");
        else t.classList.remove("is-active");
      });
    }
    renderDoctorDirectory();
  };

  if (searchInput) {
    // Tìm kiếm tức thì khi gõ
    searchInput.addEventListener("input", (e) => {
      handleDirectorySearch(e.target.value);
    });

    // Khi người dùng bấm nút Clear (dấu X) trong input type="search"
    searchInput.addEventListener("search", (e) => {
      handleDirectorySearch(e.target.value);
    });

    // Khi người dùng nhấn Enter
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleDirectorySearch(searchInput.value);
      }
    });
  }

  // Sự kiện khi bấm nút "Tìm kiếm"
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      if (searchInput) handleDirectorySearch(searchInput.value);
    });
  }

  // Sự kiện khi click biểu tượng kính lúp
  if (searchIcon) {
    searchIcon.addEventListener("click", () => {
      if (searchInput) {
        searchInput.focus();
        handleDirectorySearch(searchInput.value);
      }
    });
  }

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
    filtered = filtered.filter((doc) =>
      matchesSpecialty(doc.specialty, directorySpecialtyFilter),
    );
  }

  // Filter tìm kiếm theo tên, chuyên khoa, học vị, chức vụ, mã BS (dùng doctorMatchesQuery chuẩn xác)
  if (directorySearchQuery) {
    filtered = filtered.filter((doc) => doctorMatchesQuery(doc, directorySearchQuery));
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
          <img src="${doc.avatar || "assets/images/doctor-placeholder.jpg"}" alt="${doc.name}" class="directory-avatar" loading="lazy">
        </div>
        <div class="directory-meta">
          <span class="badge ${doc.isActive ? "badge-primary" : "badge-neutral"}">${doc.isActive ? "Hoạt động" : "Tạm ngưng"}</span>
          <h3 class="directory-doctor-name">${doc.name}</h3>
          <span class="directory-doctor-sub">${doc.specialty || "Đa khoa"}</span>
          <div class="directory-doctor-contact">
            <span class="contact-item">
              <span class="material-symbols-rounded contact-icon">phone</span>
              ${doc.phone || "1900 1234"}
            </span>
            <span class="contact-item">
              <span class="material-symbols-rounded contact-icon">mail</span>
              ${doc.email || "support@caresync.vn"}
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

        // Reset bộ lọc đặt lịch để hiển thị bác sĩ đã chọn
        bookingSpecialtyFilter = "all";
        bookingSearchQuery = "";
        const bSearch = document.getElementById("doctorSearchInput");
        if (bSearch) bSearch.value = "";
        renderBookingSpecialtyTabs();
        filterBookingDoctors();

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

// ============================================================================
// CHI TIẾT BÁC SĨ (MODAL) VÀ CHỌN BÁC SĨ (SELECTION)
// ============================================================================

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
    avatarEl.src = doc.avatar || "assets/images/doctor-placeholder.jpg";
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
    statusEl.textContent = doc.isActive
      ? "Đang hoạt động"
      : "Tạm ngưng tiếp nhận";
  }

  // 6. Phòng khám tiếp nhận
  if (roomEl) roomEl.textContent = doc.room || "Phòng khám Đa khoa";

  // 7. Kinh nghiệm làm việc
  if (expEl)
    expEl.textContent = doc.experience || "10+ năm kinh nghiệm trong ngành Y";

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
        : [
            "08:00",
            "08:30",
            "09:00",
            "09:30",
            "10:00",
            "14:00",
            "14:30",
            "15:00",
          ];

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

      // Reset bộ lọc đặt lịch để hiển thị bác sĩ đã chọn
      bookingSpecialtyFilter = "all";
      bookingSearchQuery = "";
      const bSearch = document.getElementById("doctorSearchInput");
      if (bSearch) bSearch.value = "";
      renderBookingSpecialtyTabs();
      filterBookingDoctors();

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

// Reset bộ lọc Danh bạ
function resetDirectoryFilter() {
  directorySpecialtyFilter = "all";
  directorySearchQuery = "";
  const searchInput = document.getElementById("directorySearchInput");
  if (searchInput) searchInput.value = "";
  renderDirectoryTabs();
  renderDoctorDirectory();
}

// Reset bộ lọc Đặt lịch
function resetBookingFilter() {
  bookingSpecialtyFilter = "all";
  bookingSearchQuery = "";
  const searchInput = document.getElementById("doctorSearchInput");
  if (searchInput) searchInput.value = "";
  renderBookingSpecialtyTabs();
  filterBookingDoctors();
}

// Reset lại lựa chọn bác sĩ
function resetDoctorSelection() {
  selectedDoctorId = null;
  resetBookingFilter();
  if (typeof onDoctorChangeCallback === "function") {
    onDoctorChangeCallback(null);
  }
}

// Xuất hàm ra phạm vi toàn cục để tương tác từ các module khác
window.showDoctorDetailModal = showDoctorDetailModal;
window.selectDoctor = selectDoctor;
window.renderDoctors = renderDoctors;
window.filterBookingDoctors = filterBookingDoctors;
window.renderDoctorDirectory = renderDoctorDirectory;
window.renderDirectoryTabs = renderDirectoryTabs;
window.renderBookingSpecialtyTabs = renderBookingSpecialtyTabs;
window.resetDirectoryFilter = resetDirectoryFilter;
window.resetBookingFilter = resetBookingFilter;
window.resetDoctorSelection = resetDoctorSelection;
window.getDoctorById = function (id) {
  if (!id) return null;
  return (
    DOCTORS_DATA.find(
      (d) => d.id === id || d.doctorId === id || d.DoctorId === id,
    ) || null
  );
};
window.DOCTORS_DATA = DOCTORS_DATA;
