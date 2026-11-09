// js/main.js

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("authModal");
    const btnLogin = document.getElementById("btnOpenLogin");
    const btnRegister = document.getElementById("btnOpenRegister");
    const btnClose = document.getElementById("btnCloseModal");
   
    const tabLoginBtn = document.getElementById("tabLoginBtn");
    const tabRegBtn = document.getElementById("tabRegBtn");
    const loginForm = document.getElementById("loginForm");
    const regForm = document.getElementById("regForm");


    // Bu    Modal Login
    if (btnLogin) {
        btnLogin.addEventListener("click", () => {
            modal.style.display = "flex";
            switchTab("login");
        });
    }


    // Buka Modal Daftar
    if (btnRegister) {
        btnRegister.addEventListener("click", () => {
            modal.style.display = "flex";
            switchTab("register");
        });
    }


    // Tutup Modal
    if (btnClose) {
        btnClose.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }


    // Klik Luar Modal untuk Tutup
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });


    // Switch Tab Login / Register
    function switchTab(type) {
        if (type === "login") {
            tabLoginBtn.classList.add("active");
            tabRegBtn.classList.remove("active");
            loginForm.classList.add("active");
            regForm.classList.remove("active");
        } else {
            tabRegBtn.classList.add("active");
            tabLoginBtn.classList.remove("active");
            regForm.classList.add("active");
            loginForm.classList.remove("active");
        }
    }


    if (tabLoginBtn) tabLoginBtn.addEventListener("click", () => switchTab("login"));
    if (tabRegBtn) tabRegBtn.addEventListener("click", () => switchTab("register"));


    // ================================
    // NAVBAR ACTIVE MENU
    // ================================

    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener("click", function () {

            // Hapus active dari semua menu
            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            // Tambahkan active ke menu yang diklik
            this.classList.add("active");
        });
    });

});

// Fitur untuk memindahkan garis bawah pada menu Navbar
document.addEventListener('DOMContentLoaded', function () {
  // Hanya mengambil elemen 'a' yang ada di dalam .nav-links
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      // 1. Hapus class 'active' dari semua menu navbar
      navLinks.forEach(item => item.classList.remove('active'));

      // 2. Tambahkan class 'active' ke menu yang baru diklik
      this.classList.add('active');
    });
  });
});

/* TAMBAHAN NIKMAH */


  document.addEventListener("DOMContentLoaded", function () {
  const btnClaim = document.getElementById("btnClaimReward");
  const userPointsElem = document.getElementById("userPoints");
  const pointsSubtext = document.getElementById("pointsSubtext");
  const progressBarFill = document.getElementById("progressBarFill");
  const membershipBadge = document.getElementById("membershipBadge");


  // Ambil jumlah poin saat ini dari elemen HTML
  let currentPoints = parseInt(userPointsElem ? userPointsElem.textContent : "0", 10);
  const targetPoints = 5;


  // Fungsi untuk memperbarui tampilan UI Poin & Progress Bar
  function renderPointsUI() {
    if (userPointsElem) userPointsElem.textContent = currentPoints;


    // Hitung persentase progress bar (Maksimal 100%)
    const percentage = Math.min((currentPoints / targetPoints) * 100, 100);
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;


    // Perbarui teks petunjuk poin
    if (pointsSubtext) {
      if (currentPoints < targetPoints) {
        const remaining = targetPoints - currentPoints;
        pointsSubtext.innerHTML = `Kumpulkan <strong>${remaining} poin lagi</strong> untuk Akses Premium Gratis!`;
      } else {
        pointsSubtext.innerHTML = `🎉 <strong>Selamat!</strong> Poin Anda sudah cukup untuk diklaim.`;
      }
    }
  }


  // Jalankan render awal
  renderPointsUI();


  // LOGIKA UTAMA: Klik Tombol Klaim Rewards
  if (btnClaim) {
    btnClaim.addEventListener("click", function () {
      // KONDISI 1: Jika poin kurang dari 5
      if (currentPoints < targetPoints) {
        alert("Maaf, poin Anda belum mencukupi");
      }
      // KONDISI 2: Jika poin lebih dari atau sama dengan 5
      else {
        alert("Selamat! Anda berhasil mengklaim Akses Premium Gratis!");


        // 1. Kurangi 5 poin setelah klaim berhasil
        currentPoints -= targetPoints;
        renderPointsUI();


        // 2. Ubah Badge di Header Profil menjadi 'AKUN PREMIUM'
        if (membershipBadge) {
          membershipBadge.textContent = "AKUN PREMIUM";
          membershipBadge.classList.remove("badge-free");
          membershipBadge.classList.add("badge-premium");
        }
      }
    });
  }
});






document.addEventListener("DOMContentLoaded", function () {
  const avatarBtn = document.getElementById("navAvatarBtn");
  const profilePopup = document.getElementById("profilePopup");


  if (avatarBtn && profilePopup) {
    // Toggle pop-up saat tombol foto profil diklik
    avatarBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      profilePopup.classList.toggle("show");
      avatarBtn.classList.toggle("active");
    });


    // Cegah pop-up tertutup jika diklik di dalam kotak pop-up
    profilePopup.addEventListener("click", function (event) {
      event.stopPropagation();
    });


    // Tutup pop-up otomatis jika mengklik di luar area pop-up
    document.addEventListener("click", function () {
      if (profilePopup.classList.contains("show")) {
        profilePopup.classList.remove("show");
        avatarBtn.classList.remove("active");
      }
    });


    // Tutup pop-up jika menekan tombol Escape (ESC)
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && profilePopup.classList.contains("show")) {
        profilePopup.classList.remove("show");
        avatarBtn.classList.remove("active");
      }
    });
  }
});

