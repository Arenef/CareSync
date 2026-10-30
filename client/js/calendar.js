/**
 * ============================================================================
 * CareSync - Shared Calendar Module (js/calendar.js)
 * Module hiển thị lịch hẹn dạng Calendar tháng trực quan, có thể tái sử dụng
 * cho cả Bệnh nhân (Tra cứu lịch hẹn) & Bác sĩ (Quản lý ca khám)
 * ============================================================================
 */

(function () {
  "use strict";

  /**
   * Chuẩn hóa chuỗi ngày tháng bất kỳ thành đối tượng Date (00:00:00)
   * Hỗ trợ:
   * - "Hôm nay", "Ngày mai", "today", "tomorrow"
   * - ISO YYYY-MM-DD
   * - DD/MM/YYYY hoặc DD-MM-YYYY
   * - SlotKey dạng "2026-10-30#09:00"
   * - Date object hoặc chuỗi hợp lệ
   */
  function parseApptDate(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return new Date(
        dateInput.getFullYear(),
        dateInput.getMonth(),
        dateInput.getDate(),
      );
    }

    const str = String(dateInput).trim();
    const lower = str.toLowerCase();

    const now = new Date();
    if (lower === "hôm nay" || lower === "hom nay" || lower === "today") {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (lower === "ngày mai" || lower === "ngay mai" || lower === "tomorrow") {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    // Tách SlotKey nếu có dạng "2026-10-30#09:00"
    if (str.includes("#")) {
      return parseApptDate(str.split("#")[0]);
    }

    // YYYY-MM-DD (ISO)
    const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      return new Date(
        parseInt(isoMatch[1], 10),
        parseInt(isoMatch[2], 10) - 1,
        parseInt(isoMatch[3], 10),
      );
    }

    // DD/MM/YYYY hoặc DD-MM-YYYY
    const vnMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (vnMatch) {
      return new Date(
        parseInt(vnMatch[3], 10),
        parseInt(vnMatch[2], 10) - 1,
        parseInt(vnMatch[1], 10),
      );
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      );
    }
    return null;
  }

  /**
   * Định dạng Date thành khóa 'YYYY-MM-DD'
   */
  function formatDateKey(d) {
    if (!d) return "";
    const dateObj = d instanceof Date ? d : parseApptDate(d);
    if (!dateObj || isNaN(dateObj.getTime())) return "";
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  /**
   * Định dạng ngày tiếng Việt hiển thị chi tiết (ví dụ: Thứ Sáu, 30/10/2026)
   */
  function formatVietnameseDate(dateInput) {
    const dateObj =
      dateInput instanceof Date ? dateInput : parseApptDate(dateInput);
    if (!dateObj || isNaN(dateObj.getTime())) return "--";

    const daysOfWeek = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const dayName = daysOfWeek[dateObj.getDay()];
    const d = String(dateObj.getDate()).padStart(2, "0");
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const y = dateObj.getFullYear();

    const today = new Date();
    const isToday =
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate();

    if (isToday) {
      return `Hôm nay, ${dayName} (${d}/${m}/${y})`;
    }
    return `${dayName}, ${d}/${m}/${y}`;
  }

  /**
   * Kiểm tra xem 2 ngày có cùng ngày/tháng/năm hay không
   */
  function isSameDay(d1, d2) {
    const date1 = d1 instanceof Date ? d1 : parseApptDate(d1);
    const date2 = d2 instanceof Date ? d2 : parseApptDate(d2);
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Xác định tháng và ngày ban đầu khi mở lịch từ danh sách cuộc hẹn
   */
  function setupInitialCalendarDate(appointments) {
    if (!appointments || appointments.length === 0) {
      const now = new Date();
      return {
        monthDate: new Date(now.getFullYear(), now.getMonth(), 1),
        selectedDateKey: formatDateKey(now),
      };
    }

    // Ưu tiên các cuộc hẹn chưa hủy
    const activeAppts = appointments.filter((a) => {
      const s = (a.status || a.Status || "").toLowerCase();
      return s !== "cancelled" && s !== "da_huy";
    });
    const targetList = activeAppts.length > 0 ? activeAppts : appointments;

    for (const appt of targetList) {
      const d = parseApptDate(
        appt.date ||
          appt.appointmentDate ||
          appt.AppointmentDate ||
          appt.slotKey ||
          appt.SlotKey,
      );
      if (d) {
        return {
          monthDate: new Date(d.getFullYear(), d.getMonth(), 1),
          selectedDateKey: formatDateKey(d),
        };
      }
    }

    const now = new Date();
    return {
      monthDate: new Date(now.getFullYear(), now.getMonth(), 1),
      selectedDateKey: formatDateKey(now),
    };
  }

  /**
   * Render giao diện Calendar 2 cột (Lưới tháng bên trái, chi tiết ca khám bên phải)
   * @param {Object} options
   */
  function renderCalendarView(options) {
    const {
      container,
      appointments = [],
      currentDate = new Date(),
      selectedDate = null,
      role = "patient", // "patient" | "doctor"
      badgeLabel = null,
      renderCard = null,
      emptyMessage = null,
      emptySubtext = null,
      statsLabel = "ca khám",
      onMonthChange = () => {},
      onDateSelect = () => {},
      onSwitchMode = () => {},
    } = options;

    if (!container) return;

    // 1. Phân nhóm cuộc hẹn theo dateKey ('YYYY-MM-DD')
    const apptsByDate = {};
    appointments.forEach((appt) => {
      const d = parseApptDate(
        appt.date ||
          appt.appointmentDate ||
          appt.AppointmentDate ||
          appt.slotKey ||
          appt.SlotKey,
      );
      if (d) {
        const key = formatDateKey(d);
        if (!apptsByDate[key]) apptsByDate[key] = [];
        apptsByDate[key].push(appt);
      }
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0 - 11
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const keysInMonth = Object.keys(apptsByDate).filter((k) =>
      k.startsWith(monthPrefix),
    );

    // Xác định ngày được chọn mặc định trong tháng
    let currentSelectedKey = selectedDate;
    if (
      !currentSelectedKey ||
      !currentSelectedKey.startsWith(monthPrefix) ||
      !apptsByDate[currentSelectedKey]
    ) {
      if (keysInMonth.length > 0) {
        keysInMonth.sort();
        currentSelectedKey = keysInMonth[0];
      } else {
        const today = new Date();
        if (today.getFullYear() === year && today.getMonth() === month) {
          currentSelectedKey = formatDateKey(today);
        } else {
          currentSelectedKey = `${monthPrefix}-01`;
        }
      }
    }

    // Đếm tổng số ca khám trong tháng
    let monthTotalAppts = 0;
    keysInMonth.forEach((k) => {
      monthTotalAppts += apptsByDate[k].length;
    });

    // 2. Tạo DOM Calendar Container
    const calContainer = document.createElement("div");
    calContainer.className = "appointment-calendar-view";

    // Header Toolbar
    const headerBar = document.createElement("div");
    headerBar.className = "cal-view-header";
    headerBar.innerHTML = `
      <div class="cal-nav-group">
        <button type="button" class="cal-nav-btn cal-prev-btn" title="Tháng trước" aria-label="Tháng trước">
          <span class="material-symbols-rounded">chevron_left</span>
        </button>
        <h3 class="cal-month-title">Tháng ${month + 1}, ${year}</h3>
        <button type="button" class="cal-nav-btn cal-next-btn" title="Tháng sau" aria-label="Tháng sau">
          <span class="material-symbols-rounded">chevron_right</span>
        </button>
        <button type="button" class="btn btn-secondary btn-sm cal-today-btn">
          <span class="material-symbols-rounded" style="font-size: 16px;">today</span>
          <span>Hôm nay</span>
        </button>
      </div>

      <div class="cal-header-right">
        <span class="cal-stats-badge">
          <span class="material-symbols-rounded" style="font-size: 16px; color: var(--color-primary);">event</span>
          <span>Tháng này: <strong>${monthTotalAppts}</strong> ${statsLabel}</span>
        </span>
        <div class="cal-view-switcher" role="group" aria-label="Chế độ hiển thị">
          <button type="button" class="cal-switch-btn is-active cal-switch-to-cal" title="Xem dạng Calendar">
            <span class="material-symbols-rounded">calendar_month</span>
            <span>Lịch khám</span>
          </button>
          <button type="button" class="cal-switch-btn cal-switch-to-list" title="Xem dạng Danh sách thẻ">
            <span class="material-symbols-rounded">view_agenda</span>
            <span>Danh sách</span>
          </button>
        </div>
      </div>
    `;
    calContainer.appendChild(headerBar);

    // Main 2-column layout
    const mainLayout = document.createElement("div");
    mainLayout.className = "cal-main-layout";

    // Cột trái: Khung Lịch Tháng (Month Box)
    const monthBox = document.createElement("div");
    monthBox.className = "cal-month-box";

    // Hàng thứ trong tuần (T2 -> CN)
    const weekdaysRow = document.createElement("div");
    weekdaysRow.className = "cal-weekdays";
    const weekdaysNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    weekdaysNames.forEach((w) => {
      const wEl = document.createElement("div");
      wEl.className = "cal-weekday";
      wEl.textContent = w;
      weekdaysRow.appendChild(wEl);
    });
    monthBox.appendChild(weekdaysRow);

    // Lưới các ô ngày (Days Grid)
    const daysGrid = document.createElement("div");
    daysGrid.className = "cal-days-grid";

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Thứ 2 = 0, CN = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const totalCells = startDayIndex + daysInMonth <= 35 ? 35 : 42;
    const todayStr = formatDateKey(new Date());

    // Cột phải: Khung Chi tiết Ca khám (Details Panel)
    const detailsPanel = document.createElement("div");
    detailsPanel.className = "cal-details-panel";

    // Context options chuyển cho từng cell
    const cellContext = {
      apptsByDate,
      todayStr,
      currentSelectedKey,
      year,
      month,
      role,
      badgeLabel,
      statsLabel,
      emptyMessage,
      emptySubtext,
      renderCard,
      onMonthChange,
      onDateSelect,
      onDateClicked: (dateKey) => {
        currentSelectedKey = dateKey;
        cellContext.currentSelectedKey = dateKey;
        onDateSelect(dateKey);
        const allCells = daysGrid.querySelectorAll(".cal-day-cell");
        allCells.forEach((c) => {
          c.classList.toggle("is-selected", c.dataset.date === dateKey);
        });
        renderSelectedDateDetails(detailsPanel, dateKey, cellContext);
      },
    };

    // Buffer tháng trước
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const cellDate = new Date(year, month - 1, dNum);
      const dateKey = formatDateKey(cellDate);
      daysGrid.appendChild(createDayCell(cellDate, dateKey, true, cellContext));
    }

    // Ngày trong tháng
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      const dateKey = formatDateKey(cellDate);
      daysGrid.appendChild(
        createDayCell(cellDate, dateKey, false, cellContext),
      );
    }

    // Buffer tháng sau
    const nextDaysCount = totalCells - (startDayIndex + daysInMonth);
    for (let d = 1; d <= nextDaysCount; d++) {
      const cellDate = new Date(year, month + 1, d);
      const dateKey = formatDateKey(cellDate);
      daysGrid.appendChild(createDayCell(cellDate, dateKey, true, cellContext));
    }

    monthBox.appendChild(daysGrid);

    // Chú thích trạng thái (Legend)
    const legend = document.createElement("div");
    legend.className = "cal-legend";
    legend.innerHTML = `
      <div class="cal-legend-item">
        <span class="cal-legend-dot dot-upcoming"></span>
        <span>${role === "doctor" ? "Ca khám đã đăng ký" : "Lịch khám sắp tới"}</span>
      </div>
      <div class="cal-legend-item">
        <span class="cal-legend-dot dot-cancelled"></span>
        <span>${role === "doctor" ? "Ca đã hủy" : "Lịch đã hủy"}</span>
      </div>
      <div class="cal-legend-item">
        <span class="cal-legend-box box-selected"></span>
        <span>Ngày đang chọn</span>
      </div>
    `;
    monthBox.appendChild(legend);
    mainLayout.appendChild(monthBox);

    // Render nội dung cột chi tiết ca khám ban đầu
    renderSelectedDateDetails(detailsPanel, currentSelectedKey, cellContext);
    mainLayout.appendChild(detailsPanel);

    calContainer.appendChild(mainLayout);
    container.appendChild(calContainer);

    // Gắn sự kiện Header Toolbar
    setupHeaderEvents(headerBar, {
      currentDate,
      onMonthChange,
      onDateSelect,
      onSwitchMode,
    });
  }

  /**
   * Tạo element cho một ô ngày trên lịch
   */
  function createDayCell(cellDate, dateKey, isOtherMonth, ctx) {
    const cell = document.createElement("div");
    cell.className = "cal-day-cell";
    cell.dataset.date = dateKey;

    if (isOtherMonth) cell.classList.add("is-other-month");
    if (dateKey === ctx.todayStr) cell.classList.add("is-today");
    if (dateKey === ctx.currentSelectedKey) cell.classList.add("is-selected");

    const appts = ctx.apptsByDate[dateKey] || [];
    if (appts.length > 0) {
      cell.classList.add("has-appt");
    }

    const dayNumber = cellDate.getDate();

    let badgesHtml = "";
    let dotsHtml = "";

    if (appts.length > 0) {
      dotsHtml = `<div class="cal-cell-dots">`;
      appts.forEach((a) => {
        const isCancelled =
          (a.status || a.Status || "").toLowerCase() === "cancelled" ||
          (a.status || a.Status || "").toLowerCase() === "da_huy";
        const dotClass = isCancelled ? "dot-cancelled" : "dot-upcoming";
        dotsHtml += `<span class="cal-cell-dot ${dotClass}"></span>`;
      });
      dotsHtml += `</div>`;

      badgesHtml = `<div class="cal-cell-badges">`;
      const displayAppts = appts.slice(0, 2);
      displayAppts.forEach((a) => {
        const isCancelled =
          (a.status || a.Status || "").toLowerCase() === "cancelled" ||
          (a.status || a.Status || "").toLowerCase() === "da_huy";
        const badgeClass = isCancelled ? "badge-cancelled" : "badge-upcoming";

        let label = "";
        if (typeof ctx.badgeLabel === "function") {
          label = ctx.badgeLabel(a);
        } else if (ctx.role === "doctor") {
          label = a.patientName || a.PatientName || "Bệnh nhân";
        } else {
          const docName = a.doctorName || a.DoctorName || "Bác sĩ";
          label = docName.replace(/^Bác sĩ\s+|^BS\.\s+/i, "BS. ");
        }

        const timeRaw =
          a.time || a.slotTime || a.SlotTime || a.appointmentTime || "";
        const timePart = timeRaw.split(" - ")[0] || timeRaw;

        badgesHtml += `
          <div class="cal-cell-badge ${badgeClass}" title="${label} (${timePart})">
            <span class="badge-time">${timePart}</span>
            <span class="badge-doc">${label}</span>
          </div>
        `;
      });

      if (appts.length > 2) {
        badgesHtml += `<div class="cal-cell-more">+${appts.length - 2} ca khác</div>`;
      }
      badgesHtml += `</div>`;
    }

    cell.innerHTML = `
      <div class="cal-day-header">
        <span class="cal-day-number">${dayNumber}</span>
        ${dateKey === ctx.todayStr ? '<span class="cal-today-badge">Hôm nay</span>' : ""}
        ${dotsHtml}
      </div>
      ${badgesHtml}
    `;

    // Sự kiện nhấp chọn ngày
    cell.addEventListener("click", () => {
      if (isOtherMonth) {
        const newMonth = new Date(
          cellDate.getFullYear(),
          cellDate.getMonth(),
          1,
        );
        ctx.onMonthChange(newMonth);
        ctx.onDateSelect(dateKey);
        return;
      }
      ctx.onDateClicked(dateKey);
    });

    return cell;
  }

  /**
   * Render nội dung khung Chi tiết Ca khám (Cột Phải)
   */
  function renderSelectedDateDetails(panel, selectedKey, ctx) {
    panel.innerHTML = "";

    const selectedDateObj = parseApptDate(selectedKey);
    const dateFormatted = formatVietnameseDate(selectedDateObj);
    const dayAppts = ctx.apptsByDate[selectedKey] || [];

    const pHeader = document.createElement("div");
    pHeader.className = "cal-details-header";
    pHeader.innerHTML = `
      <div class="cal-details-header-main">
        <div class="cal-details-date-title">
          <span class="material-symbols-rounded" style="color: var(--color-primary); font-size: 22px;">event_available</span>
          <h4>${dateFormatted}</h4>
        </div>
        <span class="cal-details-count ${dayAppts.length > 0 ? "has-data" : ""}">
          ${dayAppts.length} ${ctx.statsLabel || "ca khám"}
        </span>
      </div>
    `;
    panel.appendChild(pHeader);

    if (dayAppts.length > 0) {
      const listContainer = document.createElement("div");
      listContainer.className = "cal-details-list";

      dayAppts.forEach((appt) => {
        if (typeof ctx.renderCard === "function") {
          const card = ctx.renderCard(appt);
          if (card) listContainer.appendChild(card);
        }
      });

      panel.appendChild(listContainer);
    } else {
      const defaultEmptyMsg =
        ctx.role === "doctor"
          ? "Bác sĩ không có ca khám vào ngày này"
          : "Không có ca khám vào ngày này";
      const defaultEmptySub =
        ctx.role === "doctor"
          ? "Chọn các ngày có chấm xanh trên lịch để xem danh sách ca khám của bệnh nhân."
          : "Vui lòng chọn ngày có đánh dấu màu xanh trên lịch để xem phiếu hẹn khám đã đăng ký.";

      const emptyBox = document.createElement("div");
      emptyBox.className = "cal-empty-date";
      emptyBox.innerHTML = `
        <span class="material-symbols-rounded empty-icon">calendar_today</span>
        <h5>${ctx.emptyMessage || defaultEmptyMsg}</h5>
        <p>${ctx.emptySubtext || defaultEmptySub}</p>
      `;

      // Gợi ý các ngày khác có lịch khám trong cùng tháng
      const monthPrefix = `${ctx.year}-${String(ctx.month + 1).padStart(2, "0")}`;
      const otherKeysInMonth = Object.keys(ctx.apptsByDate)
        .filter(
          (k) => k.startsWith(monthPrefix) && ctx.apptsByDate[k].length > 0,
        )
        .sort();

      if (otherKeysInMonth.length > 0) {
        const shortcutsWrap = document.createElement("div");
        shortcutsWrap.className = "cal-month-shortcuts";
        shortcutsWrap.innerHTML = `<h6>Các ngày có lịch khám trong tháng:</h6>`;

        const chipsWrap = document.createElement("div");
        chipsWrap.className = "cal-shortcuts-chips";

        otherKeysInMonth.forEach((k) => {
          const dObj = parseApptDate(k);
          const count = ctx.apptsByDate[k].length;
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "cal-shortcut-chip";
          chip.innerHTML = `
            <span class="material-symbols-rounded" style="font-size: 14px;">calendar_today</span>
            <span>Ngày ${dObj.getDate()}/${dObj.getMonth() + 1} (${count} ca)</span>
          `;
          chip.addEventListener("click", () => {
            ctx.onDateClicked(k);
          });
          chipsWrap.appendChild(chip);
        });

        shortcutsWrap.appendChild(chipsWrap);
        emptyBox.appendChild(shortcutsWrap);
      }

      panel.appendChild(emptyBox);
    }
  }

  /**
   * Thiết lập sự kiện thanh Header của Lịch (Tháng trước, tháng sau, hôm nay, view toggle)
   */
  function setupHeaderEvents(headerBar, ctx) {
    const prevBtn = headerBar.querySelector(".cal-prev-btn");
    const nextBtn = headerBar.querySelector(".cal-next-btn");
    const todayBtn = headerBar.querySelector(".cal-today-btn");
    const btnSwitchList = headerBar.querySelector(".cal-switch-to-list");
    const btnSwitchCalendar = headerBar.querySelector(".cal-switch-to-cal");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const newD = new Date(
          ctx.currentDate.getFullYear(),
          ctx.currentDate.getMonth() - 1,
          1,
        );
        ctx.onMonthChange(newD);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const newD = new Date(
          ctx.currentDate.getFullYear(),
          ctx.currentDate.getMonth() + 1,
          1,
        );
        ctx.onMonthChange(newD);
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        const today = new Date();
        const newD = new Date(today.getFullYear(), today.getMonth(), 1);
        const todayKey = formatDateKey(today);
        ctx.onMonthChange(newD);
        ctx.onDateSelect(todayKey);
      });
    }

    if (btnSwitchList) {
      btnSwitchList.addEventListener("click", () => {
        ctx.onSwitchMode("list");
      });
    }

    if (btnSwitchCalendar) {
      btnSwitchCalendar.addEventListener("click", () => {
        ctx.onSwitchMode("calendar");
      });
    }
  }

  /**
   * Render dạng danh sách thẻ (List View)
   * @param {Object} options
   */
  function renderListView(options) {
    const {
      container,
      appointments = [],
      title = "Danh sách lịch khám",
      renderCard = null,
      onSwitchMode = () => {},
    } = options;

    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "appointment-list-view-wrapper";
    wrapper.style.gridColumn = "1 / -1";
    wrapper.style.width = "100%";

    const toolbar = document.createElement("div");
    toolbar.className = "cal-view-header list-mode-header";
    toolbar.style.marginBottom = "var(--spacing-md)";
    toolbar.innerHTML = `
      <div class="cal-nav-group">
        <h3 class="cal-month-title" style="font-size: var(--font-size-base); text-align: left;">
          <span class="material-symbols-rounded" style="color: var(--color-primary); vertical-align: middle; margin-right: 6px;">view_agenda</span>
          ${title} (${appointments.length})
        </h3>
      </div>
      <div class="cal-header-right">
        <div class="cal-view-switcher" role="group" aria-label="Chế độ hiển thị">
          <button type="button" class="cal-switch-btn cal-switch-to-cal" title="Xem dạng Calendar">
            <span class="material-symbols-rounded">calendar_month</span>
            <span>Lịch khám</span>
          </button>
          <button type="button" class="cal-switch-btn is-active cal-switch-to-list" title="Xem dạng Danh sách">
            <span class="material-symbols-rounded">view_agenda</span>
            <span>Danh sách</span>
          </button>
        </div>
      </div>
    `;

    const btnCal = toolbar.querySelector(".cal-switch-to-cal");
    if (btnCal) {
      btnCal.addEventListener("click", () => onSwitchMode("calendar"));
    }
    wrapper.appendChild(toolbar);

    const cardsGrid = document.createElement("div");
    cardsGrid.className = "appointments-list-grid";
    cardsGrid.style.marginTop = "var(--spacing-md)";

    appointments.forEach((appt) => {
      if (typeof renderCard === "function") {
        const card = renderCard(appt);
        if (card) cardsGrid.appendChild(card);
      }
    });

    wrapper.appendChild(cardsGrid);
    container.appendChild(wrapper);
  }

  // Xuất module ra window
  window.CareSyncCalendar = {
    parseApptDate,
    formatDateKey,
    formatVietnameseDate,
    isSameDay,
    setupInitialCalendarDate,
    renderCalendarView,
    renderListView,
  };
})();
