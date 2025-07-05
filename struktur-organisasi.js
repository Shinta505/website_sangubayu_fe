// FORM STRUKTUR ORGANISASI SCRIPT
document.addEventListener('DOMContentLoaded', function () {
    // --- Initialize Lucide Icons ---
    lucide.createIcons();

    // Navigation Sidebar Logic ---
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logoutBtn');

    // Logout Modal Elements
    const logoutModal = document.getElementById('logoutModal');
    const modalDialog = document.getElementById('modalDialog');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

    // Fungsi untuk membuka/menutup sidebar
    const toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    };

    // Fungsi untuk menampilkan modal
    const showLogoutModal = () => {
        logoutModal.classList.remove('hidden');
        setTimeout(() => {
            modalDialog.classList.remove('scale-95', 'opacity-0');
        }, 10); // Delay kecil untuk memastikan transisi berjalan
    };

    // Fungsi untuk menyembunyikan modal
    const hideLogoutModal = () => {
        modalDialog.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            logoutModal.classList.add('hidden');
        }, 300); // Sesuaikan dengan durasi transisi
    };

    // Event listener untuk tombol burger dan overlay
    if (burgerBtn && sidebar && overlay) {
        burgerBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
    }

    // Event listener untuk tombol logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Tutup sidebar jika terbuka
            if (!sidebar.classList.contains('-translate-x-full')) {
                toggleSidebar();
            }
            // Tampilkan modal konfirmasi
            showLogoutModal();
        });
    }

    // Event listener untuk tombol konfirmasi (Ya)
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            // Lakukan proses logout
            window.location.href = '../index.html';
        });
    }

    // Event listener untuk tombol batal (Tidak)
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', hideLogoutModal);
    }

    // --- DOM Element References ---
    const strukturForm = document.getElementById('strukturForm');
    const formContainer = document.getElementById('formContainer');
    const namaJabatanInput = document.getElementById('nama_jabatan');
    const namaPejabatInput = document.getElementById('nama_pejabat');
    const fotoPejabatInput = document.getElementById('foto_pejabat');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');

    // FIXED: Memastikan strukturForm ada sebelum mengambil submitButton
    if (!strukturForm) {
        console.error("Form dengan ID 'strukturForm' tidak ditemukan.");
        return;
    }
    const submitButton = strukturForm.querySelector('button[type="submit"]');

    // --- Backend API Endpoint ---
    const API_ENDPOINT = 'https://website-sangubayu-be.vercel.app/api/struktur-organisasi';

    // --- Function to show messages ---
    function showMessage(type, message) {
        messageBox.classList.remove('hidden', 'bg-red-500/80', 'bg-green-500/80', 'text-white');

        if (type === 'success') {
            messageBox.classList.add('bg-green-500/80', 'text-white');
        } else if (type === 'error') {
            messageBox.classList.add('bg-red-500/80', 'text-white');
        }

        messageText.textContent = message;
    }

    // --- Form Submission Logic ---
    strukturForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!namaJabatanInput.value.trim() || !namaPejabatInput.value.trim()) {
            showMessage('error', 'Nama Jabatan dan Nama Pejabat wajib diisi.');
            return;
        }

        messageBox.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.textContent = 'MENYIMPAN...';

        const formData = new FormData();
        formData.append('nama_jabatan', namaJabatanInput.value.trim());
        formData.append('nama_pejabat', namaPejabatInput.value.trim());

        if (fotoPejabatInput.files.length > 0) {
            formData.append('foto_pejabat', fotoPejabatInput.files[0]);
        }

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            // FIXED: Menambahkan penanganan untuk error server (500) secara spesifik
            if (response.status === 500) {
                throw new Error('Error (500): Terjadi masalah pada server. Hubungi administrator.');
            }

            const result = await response.json();

            if (response.ok) {
                showMessage('success', 'Data berhasil disimpan!');

                setTimeout(() => {
                    strukturForm.reset();
                    messageBox.classList.add('hidden');
                }, 2500);

            } else {
                throw new Error(result.message || 'Gagal menyimpan data. Periksa kembali input Anda.');
            }

        } catch (error) {
            showMessage('error', error.message);
            formContainer.classList.add('animate-shake');
            setTimeout(() => {
                formContainer.classList.remove('animate-shake');
            }, 500);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'SIMPAN DATA';
        }
    });

    // --- Shake Animation (untuk feedback error) ---
    const style = document.createElement('style');
    style.innerHTML = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
                    20%, 40%, 60%, 80% { transform: translateX(8px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `;
    document.head.appendChild(style);
});