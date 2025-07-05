// KELOLA UMKM SCRIPT
document.addEventListener('DOMContentLoaded', function () {
    // --- Initialize Lucide Icons ---
    lucide.createIcons();

    // --- Common Elements (Sidebar, Modal, etc.) ---
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const modalDialog = document.getElementById('modalDialog');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

    // --- Sidebar and Modal Functions (No changes needed) ---
    const toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    };

    const showLogoutModal = () => {
        logoutModal.classList.remove('hidden');
        setTimeout(() => {
            modalDialog.classList.remove('scale-95', 'opacity-0');
        }, 10);
    };

    const hideLogoutModal = () => {
        modalDialog.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            logoutModal.classList.add('hidden');
        }, 300);
    };

    if (burgerBtn && sidebar && overlay) {
        burgerBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!sidebar.classList.contains('-translate-x-full')) {
                toggleSidebar();
            }
            showLogoutModal();
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah berhasil logout.');
            window.location.href = '../index.html';
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', hideLogoutModal);
    }

    // --- UMKM Form Specific Elements ---
    const umkmForm = document.getElementById('umkmForm');
    if (!umkmForm) {
        console.error("Form with ID 'umkmForm' not found.");
        return;
    }
    const formContainer = document.getElementById('formContainer');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const submitButton = umkmForm.querySelector('button[type="submit"]');

    // Input fields
    const namaUmkmInput = document.getElementById('nama_umkm');
    const pemilikUmkmInput = document.getElementById('pemilik_umkm');
    const deskripsiUmkmInput = document.getElementById('deskripsi_umkm');
    const alamatUmkmInput = document.getElementById('alamat_umkm');
    const kontakUmkmInput = document.getElementById('kontak_umkm');
    const petaUmkmInput = document.getElementById('peta_umkm');

    // --- Backend API Endpoint ---
    const API_ENDPOINT = 'https://website-sangubayu-be.vercel.app/api/umkm';

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
    umkmForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // === PERUBAHAN DI SINI: VALIDASI INPUT ===
        
        // 1. Validasi field wajib
        if (!namaUmkmInput.value.trim() || !pemilikUmkmInput.value.trim()) {
            showMessage('error', 'Nama UMKM dan Nama Pemilik wajib diisi.');
            return;
        }

        // 2. Validasi nomor kontak jika diisi
        const kontakValue = kontakUmkmInput.value.trim();
        if (kontakValue) { // Hanya validasi jika field tidak kosong
            // Cek apakah hanya berisi angka
            if (!/^\d+$/.test(kontakValue)) {
                showMessage('error', 'Nomor kontak hanya boleh berisi angka.');
                return;
            }
            // Cek apakah diawali dengan '62'
            if (!kontakValue.startsWith('62')) {
                showMessage('error', 'Nomor kontak harus diawali dengan kode negara 62.');
                return;
            }
            // Cek panjang nomor (misal: antara 11 hingga 15 digit termasuk '62')
            if (kontakValue.length < 11 || kontakValue.length > 15) {
                 showMessage('error', 'Panjang nomor kontak tidak valid. Harus antara 11-15 digit.');
                return;
            }
        }
        // === AKHIR DARI PERUBAHAN VALIDASI ===

        messageBox.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.textContent = 'MENYIMPAN...';

        // Collect form data
        const umkmData = {
            nama_umkm: namaUmkmInput.value.trim(),
            pemilik_umkm: pemilikUmkmInput.value.trim(),
            deskripsi_umkm: deskripsiUmkmInput.value.trim(),
            alamat_umkm: alamatUmkmInput.value.trim(),
            kontak_umkm: kontakValue, // gunakan nilai yang sudah di-trim
            peta_umkm: petaUmkmInput.value.trim()
        };

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(umkmData),
            });

            if (response.status >= 500) { // Catches 500 and other server errors
                throw new Error('Terjadi masalah pada server. Silakan coba lagi nanti.');
            }

            const result = await response.json();

            if (response.ok) {
                showMessage('success', 'Data UMKM berhasil disimpan!');

                setTimeout(() => {
                    umkmForm.reset();
                    messageBox.classList.add('hidden');
                }, 2500);

            } else {
                throw new Error(result.msg || 'Gagal menyimpan data. Periksa kembali input Anda.');
            }

        } catch (error) {
            showMessage('error', error.message);
            formContainer.classList.add('animate-shake');
            setTimeout(() => {
                formContainer.classList.remove('animate-shake');
            }, 500);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'SIMPAN DATA UMKM';
        }
    });

    // --- Shake Animation (No changes needed) ---
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