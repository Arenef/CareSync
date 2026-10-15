document.addEventListener("DOMContentLoaded", () => {
  // Initialize Navigation & Modals
  if (typeof initNavigation === "function") {
    initNavigation();
  }

  // Initialize Booking Form controls
  if (typeof initBooking === "function") {
    initBooking();
  }

  // Initialize Doctors dataset with callback to update booking summary
  if (
    typeof initDoctors === "function" &&
    typeof updateSelectedDoctor === "function"
  ) {
    initDoctors((selectedDoc) => {
      updateSelectedDoctor(selectedDoc);
    });
  }

  // Console log for student / examiner verification
  console.info("CareSync Frontend Application initialized successfully.");
});
