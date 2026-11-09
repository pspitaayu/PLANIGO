document.addEventListener("DOMContentLoaded", () => {
    let currentStep = 1;
    let selectedItems = [];

    const itinerarySchedule = new Map();

    const discoveryView = document.getElementById("discoveryView");
    const plannerStepView = document.getElementById("plannerStepView");
    const btnStartPlanner = document.getElementById("btnStartPlanner");
   
    const btnNext = document.getElementById("btnNextStep");
    const btnPrev = document.getElementById("btnPrevStep");
    const btnBackToDiscovery = document.getElementById("btnBackToDiscovery");


    // 1. Buka Stepper Form dari Tampilan Utama Catalog 
    if (btnStartPlanner) {
        btnStartPlanner.addEventListener("click", () => {
            discoveryView.style.display = "none";
            plannerStepView.style.display = "block";
            showStep(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // 2. Tombol "← Kembali ke Katalog"
    if (btnBackToDiscovery) {
        btnBackToDiscovery.addEventListener("click", () => {
            plannerStepView.style.display = "none";
            discoveryView.style.display = "block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // 3. Toggle Pilih/Batal Item (Wisata, Hotel, Kuliner, Transport)
    document.querySelectorAll(".btn-select").forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.getAttribute("data-name");
            const price = parseInt(btn.getAttribute("data-price") || "0");


            if (btn.classList.contains("selected")) {
                btn.classList.remove("selected");
                btn.innerText = "+ Pilih";
                selectedItems = selectedItems.filter(item => item.name !== name);
            } else {
                btn.classList.add("selected");
                btn.innerText = "✓ Terpilih";
                selectedItems.push({ name, price });
            }
        });
    });


    // 4. Navigasi Tombol Next (Lanjut)
    if (btnNext) {
        btnNext.addEventListener("click", () => {
            if (currentStep < 6) {
                currentStep++;
                showStep(currentStep);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }


    // 5. Navigasi Tombol Prev (Sebelumnya)
    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }


    // 6. Fungsi Menampilkan Step Aktif
    function showStep(step) {
        currentStep = step;


        // Tampilkan Konten Step yang Aktif
        document.querySelectorAll(".step-content").forEach((el, index) => {
            el.classList.toggle("active", (index + 1) === step);
        });


        // Update Indikator Stepper Bar
        document.querySelectorAll(".step-item").forEach((el, index) => {
            el.classList.toggle("active", (index + 1) <= step);
        });


        // Kontrol Visibilitas Tombol Navigasi Bawah
        if (step === 1) {
            if (btnBackToDiscovery) btnBackToDiscovery.style.display = "inline-block";
            if (btnPrev) btnPrev.style.display = "none";
            if (btnNext) btnNext.style.display = "inline-block";
        } else {
            if (btnBackToDiscovery) btnBackToDiscovery.style.display = "none";
            if (btnPrev) btnPrev.style.display = "inline-block";
            if (btnNext) btnNext.style.display = step === 6 ? "none" : "inline-block";
        }


        // Ubah Teks Label Tombol Next
        const stepLabels = ["", "Destinasi ➔", "Akomodasi ➔", "Kuliner ➔", "Mobilitas ➔", "Itinerary ➔", "Selesai ✨"];
        if (btnNext) {
            btnNext.innerText = `Lanjut: ${stepLabels[step]}`;
        }


        // Hitung & Render Timeline jika sudah di Step 6
        if (step === 6) {
            calculateSummary();
        }
    }


    // 7. Kalkulasi Ringkasan & Render Timeline di Step 6
    function calculateSummary() {
        const name = document.getElementById("inputName")?.value || "Wisatawan Planigo";
        const city = document.getElementById("inputCity")?.value || "Malang";
        const days = parseInt(document.getElementById("inputDays")?.value || "1");
        const persons = parseInt(document.getElementById("inputPersons")?.value || "1");


        const sumNameEl = document.getElementById("sumName");
        const sumCityEl = document.getElementById("sumCity");
        const sumDaysEl = document.getElementById("sumDays");
        const sumPersonsEl = document.getElementById("sumPersons");


        if (sumNameEl) sumNameEl.innerText = name;
        if (sumCityEl) sumCityEl.innerText = city;
        if (sumDaysEl) sumDaysEl.innerText = days;
        if (sumPersonsEl) sumPersonsEl.innerText = persons;


        const timelineEl = document.getElementById("itineraryTimeline");
        if (!timelineEl) return;
       
        timelineEl.innerHTML = "";
        let total = 0;
       
        if (selectedItems.length === 0) {
            timelineEl.innerHTML = `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <h5>Belum Ada Agenda</h5>
                        <p>Silakan pilih destinasi, penginapan, kuliner, atau transportasi di step sebelumnya.</p>
                    </div>
                </div>`;
        } else {
            let defaultHour = 8;

// TAMBAHAN BARU: URUTKAN ITEM BERDASARKAN JADWAL
            const sortedItems = [...selectedItems].sort((a, b) => {
                const scheduleA = itinerarySchedule.get(a.name) || {};
                const scheduleB = itinerarySchedule.get(b.name) || {};

                const dateA = scheduleA.date || "";
                const dateB = scheduleB.date || "";
                const timeA = scheduleA.time || "23:59";
                const timeB = scheduleB.time || "23:59";

                // Item yang sudah memiliki tanggal didahulukan
                if (dateA && !dateB) return -1;
                if (!dateA && dateB) return 1;

                // Urutkan berdasarkan tanggal
                if (dateA !== dateB) {
                    return dateA.localeCompare(dateB);
                }

                // Jika tanggal sama, urutkan berdasarkan jam
                return timeA.localeCompare(timeB);
            });

            sortedItems.forEach((item) => {
                total += item.price;

                const formattedTime =
                    `${String(defaultHour).padStart(2, "0")}:00`;

                // AMBIL JADWAL YANG TERSIMPAN
                const savedSchedule = itinerarySchedule.get(item.name) || {};
                const scheduleDate = savedSchedule.date || "";
                const scheduleTime = savedSchedule.time || formattedTime;

                const itemEl = document.createElement("div");
                itemEl.className = "timeline-item";

                itemEl.innerHTML = `
                    <div class="timeline-dot"></div>

                    <div class="timeline-content">
                        <h5>${item.name}</h5>
                        <p>Sudah ditambahkan ke agenda perjalanan kamu.</p>
                    </div>

                    <div class="timeline-time-box">

                        <!-- TAMBAHAN BARU: INPUT TANGGAL -->
                        <label>📅 Tanggal:</label>
                        <input
                            type="date"
                            class="date-input"
                            value="${scheduleDate}"
                            aria-label="Tanggal kunjungan ${item.name}"
                        >

                        <!-- INPUT JAM -->
                        <label>⏰ Jam:</label>
                        <input
                            type="time"
                            class="time-input"
                            value="${scheduleTime}"
                            aria-label="Jam kunjungan ${item.name}"
                        >
                    </div>
                `;

                // TAMBAHAN BARU: SIMPAN PERUBAHAN TANGGAL DAN JAM
                const dateInput = itemEl.querySelector(".date-input");
                const timeInput = itemEl.querySelector(".time-input");

                function updateSchedule() {
                    itinerarySchedule.set(item.name, {
                        date: dateInput.value,
                        time: timeInput.value
                    });

                    // Urutkan ulang tanpa membuat ulang input
                    sortTimelineItems(timelineEl);
                }

                dateInput.addEventListener("change", updateSchedule);
                timeInput.addEventListener("change", updateSchedule);

                timelineEl.appendChild(itemEl);

                defaultHour = (defaultHour + 2) % 24;
            });

            // TAMBAHAN BARU: PASTIKAN URUTAN AWAL SESUAI JADWAL
            sortTimelineItems(timelineEl);
        }

        const grandTotal = total * persons;
        const sumTotalCostEl = document.getElementById("sumTotalCost");
        const sumPerPersonCostEl = document.getElementById("sumPerPersonCost");

        if (sumTotalCostEl) {
            sumTotalCostEl.innerText =
                `Rp ${grandTotal.toLocaleString("id-ID")}`;
        }

        if (sumPerPersonCostEl) {
            sumPerPersonCostEl.innerText =
                `Rp ${total.toLocaleString("id-ID")}`;
        }
    }

    // TAMBAHAN BARU: FUNGSI PENGURUTAN TIMELINE
    function sortTimelineItems(timelineEl) {
        const items = Array.from(
            timelineEl.querySelectorAll(".timeline-item")
        );

        items.sort((a, b) => {
            const dateA = a.querySelector(".date-input")?.value || "";
            const dateB = b.querySelector(".date-input")?.value || "";

            const timeA = a.querySelector(".time-input")?.value || "";
            const timeB = b.querySelector(".time-input")?.value || "";

            // Item tanpa tanggal diletakkan setelah item bertanggal
            if (dateA && !dateB) return -1;
            if (!dateA && dateB) return 1;

            // Tanggal lebih awal muncul terlebih dahulu
            if (dateA !== dateB) {
                return dateA.localeCompare(dateB);
            }

            // Jika tanggal sama, bandingkan jam
            if (timeA && !timeB) return -1;
            if (!timeA && timeB) return 1;

            return timeA.localeCompare(timeB);
        });

        items.forEach(item => timelineEl.appendChild(item));
    }


    // =========================================================
    // SYSTEM FILTER CATEGORY PILLS (PERBAIKAN LOGIKA UTAMA)
    // =========================================================
    const pillBtns = document.querySelectorAll('.pill-btn');
    const cards = document.querySelectorAll('.dest-card');
    const sectionTitle = document.querySelector('.section-heading') || document.getElementById('section-title');


    function applyFilter(selectedCategory, btnText) {
        // 1. Ubah judul section jika elemennya ada
        if (sectionTitle && btnText) {
            const categoryText = btnText.trim().replace(/^[\s\S]*?\s/, '');
            sectionTitle.textContent = `Destinasi ${categoryText} di Malang`;
        }


        // 2. Filter Kartu berdasarkan data-category
        cards.forEach(card => {
            const cardCategories = (card.getAttribute('data-category') || '').split(' ');


            // Kartu HANYA muncul jika kategori kartu benar-benar cocok atau jika memilih 'semua'
            if (selectedCategory === 'semua' || cardCategories.includes(selectedCategory)) {
                card.classList.remove('hide');
                card.style.display = ''; // Menjamin kartu terlihat
            } else {
                card.classList.add('hide');
                card.style.display = 'none'; // Menyembunyikan kartu yang tidak cocok
            }
        });
    }


    pillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            pillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');


            const selectedCategory = btn.getAttribute('data-category');
            applyFilter(selectedCategory, btn.textContent);
        });
    });


    // Jalankan filter otomatis saat awal loading halaman (sesuai tombol active awal)
    const initialActiveBtn = document.querySelector('.pill-btn.active');
    if (initialActiveBtn) {
        applyFilter(initialActiveBtn.getAttribute('data-category'), initialActiveBtn.textContent);
    }
});


// 8. FUNGSI SIMPAN ITINERARY KE LOCALSTORAGE (Mendukung Banyak Data / Multiple Itinerary)
function saveItineraryToStorage(event) {
    if (event) event.preventDefault();

    const name = document.getElementById("inputName")?.value || "Wisatawan Planigo";
    const city = document.getElementById("inputCity")?.value || "Malang";
    const days = document.getElementById("inputDays")?.value || "1";
    const persons = document.getElementById("inputPersons")?.value || "1";
    const totalCost = document.getElementById("sumTotalCost") ? document.getElementById("sumTotalCost").innerText : "Rp 0";

    const timelineItems = [];
    const itemsEl = document.querySelectorAll("#itineraryTimeline .timeline-item");

    itemsEl.forEach((item) => {
        const titleEl = item.querySelector("h5");
        const timeInputEl = item.querySelector(".time-input");

        if (titleEl && titleEl.innerText !== "Belum Ada Agenda") {
            timelineItems.push({
                title: titleEl.innerText,
                time: timeInputEl ? timeInputEl.value : "08:00"
            });
        }
    });

    if (timelineItems.length === 0) {
        alert("Belum ada destinasi atau akomodasi yang dipilih! Silakan pilih terlebih dahulu di Step 2 - 5.");
        return;
    }

    // Buat objek itinerary baru dengan ID unik berdasarkan waktu (timestamp)
    const newItinerary = {
        id: Date.now(), 
        name: name,
        city: city,
        days: days,
        persons: persons,
        totalCost: totalCost,
        items: timelineItems,
        savedAt: new Date().toLocaleDateString("id-ID")
    };

    try {
        // 1. Ambil data lama dari localStorage (jika belum ada, buat array kosong)
        let savedList = JSON.parse(localStorage.getItem("planigo_saved_itinerary")) || [];

        // Jika data lama ternyata berupa objek tunggal (bukan array), ubah dulu jadi array
        if (!Array.isArray(savedList)) {
            savedList = [savedList];
        }

        // 2. Tambahkan itinerary baru ke dalam daftar array
        savedList.push(newItinerary);

        // 3. Simpan kembali array yang sudah diperbarui ke localStorage
        localStorage.setItem("planigo_saved_itinerary", JSON.stringify(savedList));

        alert("🎉 Itinerary berhasil disimpan!");
        window.location.href = "my-itinerary.html";
    } catch (e) {
        console.error("Gagal menyimpan ke localStorage:", e);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
}



// =========================================================
// FILTER RATING HOTEL (SINGLE SELECT / HANYA 1 YANG AKTIF)
// =========================================================
const ratingBtns = document.querySelectorAll('.rating-btn-group .star-btn');
const hotelCards = document.querySelectorAll('#stepContent3 .dest-card');


ratingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. Hapus class 'active' dari SEMUA tombol rating
        ratingBtns.forEach(b => b.classList.remove('active'));


        // 2. Tambahkan class 'active' HANYA pada tombol yang diklik
        btn.classList.add('active');


        // 3. Ambil nilai rating yang dipilih
        const selectedRating = btn.getAttribute('data-rating');


        // 4. Filter kartu hotel berdasarkan rating
        hotelCards.forEach(card => {
            const cardRating = card.getAttribute('data-rating');


            if (selectedRating === 'all' || cardRating === selectedRating) {
                card.style.display = 'flex';
                card.classList.remove('hide');
            } else {
                card.style.display = 'none';
                card.classList.add('hide');
            }
        });
    });
});


// =========================================================
// PROTEKSI NAVIGASI KELUAR SAAT PLANNER SEDANG BERJALAN
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const exitLinks = document.querySelectorAll(".nav-links a, .logo-container, .navbar .btn-secondary");


    exitLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const plannerStepView = document.getElementById("plannerStepView");
           
            if (plannerStepView && plannerStepView.style.display !== "none") {
                const href = link.getAttribute("href");
                if (href && href !== "#") {
                    const confirmLeave = confirm("⚠️ Peringatan: Proses pembuatan itinerary kamu belum disimpan.\n\nYakin ingin meninggalkan halaman ini?");
                    if (!confirmLeave) {
                        e.preventDefault();
                    }
                }
            }
        });
    });
});


// =========================================================
// FUNGSI POP-UP MODAL DETAIL DESTINASI
// =========================================================
window.openModal = function(title, description) {
    const modal = document.getElementById('detailModal');
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDescription');


    if (modal) {
        if (titleEl) titleEl.innerText = title;
        if (descEl) descEl.innerText = description;
        modal.style.display = 'block';
    }
};


window.closeModal = function() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.style.display = 'none';
    }
};


window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailModal');
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
});

// =========================================================
// FILTER AKOMODASI (JENIS + FASILITAS + RATING)
// =========================================================
const facilityCheckboxes = document.querySelectorAll('.facilities-group input[type="checkbox"]');
const typeButtons = document.querySelectorAll('.type-btn');
const filterPriceSelect = document.getElementById('filterPrice');
const allHotelCards = document.querySelectorAll('#stepContent3 .dest-card');

function applyAkomodasiFilter() {
    // 1. Cek Kategori yang sedang Aktif (Hotel, Homestay, dll)
    const activeTypeBtn = document.querySelector('.type-btn.active');
    const selectedCategory = activeTypeBtn ? activeTypeBtn.getAttribute('data-category') : 'semua';

    // 2. Cek Fasilitas yang sedang Dicentang
    const selectedFacilities = Array.from(facilityCheckboxes)
        .filter(cb => cb.checked)   
        .map(cb => cb.value || cb.closest('label').getAttribute('data-facilities'));

    // 3. Ambil Rating yang Ditiup/Dipilih
    const activeRatingBtn = document.querySelector('.rating-btn-group .star-btn.active');
    const selectedRating = activeRatingBtn ? activeRatingBtn.getAttribute('data-rating') : 'all';

// 4. Ambil Rentang Harga Langsung dari Dropdown
    const priceDropdown = document.getElementById('filterPrice') || document.querySelector('.select-wrapper select');
    const priceRangeValue = priceDropdown ? priceDropdown.value : 'all';
    
    let minPrice = 0;
    let maxPrice = Infinity;

    if (priceRangeValue && priceRangeValue !== 'all') {
        const parts = priceRangeValue.split('-');
        minPrice = parseInt(parts[0], 10);
        maxPrice = parseInt(parts[1], 10);
    }
    // 3. Filter Setiap Kartu berdasarkan Kategori DAN Fasilitas
    allHotelCards.forEach(card => {
        const cardCategory = (card.getAttribute('data-category') || '').split(' ');
        const cardFacilities = (card.getAttribute('data-facilities') || '').split(' ');
        const activeRatingBtn = (card.getAttribute('data-rating')|| '').split(' ');
        const cardPriceValue = card.getAttribute('data-price') || '0-0';
const cardPriceParts = cardPriceValue.split('-');

const cardMinPrice = parseInt(cardPriceParts[0], 10);
const cardMaxPrice = parseInt(cardPriceParts[1], 10);

        // Kartu cocok jika:
        // - Kategori sesuai (atau pilih 'semua')
        // - DAN Kartu punya semua fasilitas yang dicentang
        const matchCategory = (selectedCategory === 'semua') || cardCategory.includes(selectedCategory);
        const matchFacilities = selectedFacilities.every(fac => cardFacilities.includes(fac));
        const matchPrice =
    (priceRangeValue === 'all') ||
    (cardMinPrice >= minPrice && cardMaxPrice <= maxPrice);
        if (matchCategory && matchFacilities && matchPrice) {
            card.style.display = 'flex';
            card.classList.remove('hide');
        } else {
            card.style.display = 'none';
            card.classList.add('hide');
        }
    });
}

// Event Listener Checkbox Fasilitas
facilityCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyAkomodasiFilter);
});

filterPriceSelect.addEventListener('change', applyAkomodasiFilter);

// Event Listener Tombol Jenis Akomodasi (Hotel, Hostel, Homestay, dll)
typeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        typeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        applyAkomodasiFilter();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    applyAkomodasiFilter();
});

document.addEventListener("DOMContentLoaded", function () {


    // ==========================================
    // 1. AMBIL ELEMEN FILTER
    // ==========================================


    const categoryButtons = document.querySelectorAll(
        "#foodCategoryPills .pill-btn"
    );


    const priceFilter = document.getElementById("filterFoodPrice");


    const sortSelect = document.getElementById("sortSelect");


    const facilityGroup = document.getElementById("foodFacilityGroup");


    const facilityCheckboxes = facilityGroup
        ? facilityGroup.querySelectorAll('input[type="checkbox"]')
        : [];


    // Semua card kuliner di Step 4
    const foodCards = document.querySelectorAll(
        "#stepContent4 .dest-card"
    );




    // ==========================================
    // 2. FILTER BERDASARKAN KATEGORI
    // ==========================================


    categoryButtons.forEach(function (button) {


        button.addEventListener("click", function () {


            // Hapus active dari semua tombol
            categoryButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });


            // Tambahkan active ke tombol yang diklik
            this.classList.add("active");


            // Jalankan filter
            applyFoodFilter();


        });


    });




    // ==========================================
    // 3. FILTER BERDASARKAN HARGA
    // ==========================================


    if (priceFilter) {


        priceFilter.addEventListener("change", function () {
            applyFoodFilter();
        });


    }




    // ==========================================
    // 4. FILTER BERDASARKAN FASILITAS
    // ==========================================


    facilityCheckboxes.forEach(function (checkbox) {


        checkbox.addEventListener("change", function () {
            applyFoodFilter();
        });


    });




    // ==========================================
    // 5. URUTKAN / SORTING
    // ==========================================


    if (sortSelect) {


        sortSelect.addEventListener("change", function () {
            applyFoodFilter();
        });


    }




    // ==========================================
    // 6. FUNGSI UTAMA FILTER
    // ==========================================


    function applyFoodFilter() {


        // --------------------------------------
        // A. Ambil kategori yang sedang aktif
        // --------------------------------------


        const activeCategory = document.querySelector(
            "#foodCategoryPills .pill-btn.active"
        );


        const selectedCategory = activeCategory
            ? activeCategory.getAttribute("data-category")
            : "all";




        // --------------------------------------
        // B. Ambil harga yang dipilih
        // --------------------------------------


        const selectedPrice = priceFilter
            ? priceFilter.value
            : "all";




        // --------------------------------------
        // C. Ambil fasilitas yang dicentang
        // --------------------------------------


        const selectedFacilities = Array.from(
            facilityCheckboxes
        )
        .filter(function (checkbox) {
            return checkbox.checked;
        })
        .map(function (checkbox) {
            return checkbox.value;
        });




        // --------------------------------------
        // D. Ambil pilihan sorting
        // --------------------------------------


        const selectedSort = sortSelect
            ? sortSelect.value
            : "rekomendasi";




        // --------------------------------------
        // E. Ubah NodeList menjadi Array
        // --------------------------------------


        const foodCardsArray = Array.from(foodCards);




        // --------------------------------------
        // F. Periksa setiap card
        // --------------------------------------


        foodCardsArray.forEach(function (card) {


            // Ambil kategori card
            const cardCategory =
                card.getAttribute("data-category") || "";




            // Ambil harga card
            const cardPrice =
                parseInt(
                    card.getAttribute("data-price") || "0"
                );




            // Ambil fasilitas card
            const cardFacilities =
                (card.getAttribute("data-facilities") || "")
                .split(" ")
                .filter(Boolean);




            // ==================================
            // CEK KATEGORI
            // ==================================


            const categoryMatch =
                selectedCategory === "all" ||
                cardCategory === selectedCategory;




            // ==================================
            // CEK HARGA
            // ==================================


            let priceMatch = true;


            if (selectedPrice !== "all") {


                const [minPrice, maxPrice] =
                    selectedPrice.split("-").map(Number);


                priceMatch =
                    cardPrice >= minPrice &&
                    cardPrice <= maxPrice;


            }




            // ==================================
            // CEK FASILITAS
            // ==================================


            const facilityMatch =
                selectedFacilities.every(function (facility) {


                    return cardFacilities.includes(facility);


                });




            // ==================================
            // HASIL AKHIR FILTER
            // ==================================


            if (
                categoryMatch &&
                priceMatch &&
                facilityMatch
            ) {


                // Tampilkan card
                card.style.display = "";


            } else {


                // Sembunyikan card
                card.style.display = "none";


            }


        });




        // ==========================================
        // 7. SORTING BERDASARKAN HARGA
        // ==========================================


        if (selectedSort === "terendah") {


            foodCardsArray.sort(function (a, b) {


                const priceA =
                    parseInt(
                        a.getAttribute("data-price") || "0"
                    );


                const priceB =
                    parseInt(
                        b.getAttribute("data-price") || "0"
                    );


                return priceA - priceB;


            });


        }




        else if (selectedSort === "tertinggi") {


            foodCardsArray.sort(function (a, b) {


                const priceA =
                    parseInt(
                        a.getAttribute("data-price") || "0"
                    );


                const priceB =
                    parseInt(
                        b.getAttribute("data-price") || "0"
                    );


                return priceB - priceA;


            });


        }




        // ==========================================
        // 8. KEMBALIKAN CARD KE URUTAN BARU
        // ==========================================


        const foodContainer =
            document.getElementById("foodCardsContainer");


        if (foodContainer) {


            foodCardsArray.forEach(function (card) {


                foodContainer.appendChild(card);


            });


        }


    }




    // ==========================================
    // 9. JALANKAN FILTER SAAT HALAMAN DIBUKA
    // ==========================================


    applyFoodFilter();


});


// Event Listener untuk Tombol Pill Transportasi (Sewa Mobil / Sewa Motor)
document.querySelectorAll("#transportCategoryPills .pill-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
        // 1. Ubah status class active pada tombol
        document.querySelectorAll("#transportCategoryPills .pill-btn").forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        // 2. OTOMATIS RESET DROPDOWN KAPASITAS KE "Semua Kapasitas"
        const capacitySelect = document.getElementById("filterCapacity");
        if (capacitySelect) {
            capacitySelect.value = "all";
        }

        // 3. Jalankan ulang fungsi filter
        applyTransportFilter();
    });
});

