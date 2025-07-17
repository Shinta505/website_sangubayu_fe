document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    const burgerBtn = document.getElementById('burgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const modalDialog = document.getElementById('modalDialog');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

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

    const galleryForm = document.getElementById('galleryForm');
    if (!galleryForm) {
        console.error("Form with ID 'galleryForm' not found.");
        return;
    }
    const formContainer = document.getElementById('formContainer');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const submitButton = galleryForm.querySelector('button[type="submit"]');

    const namaGambarInput = document.getElementById('nama_gambar');
    const deskripsiGambarInput = document.getElementById('deskripsi_gambar');
    const urlGambarInput = document.getElementById('url_gambar');

    const API_ENDPOINT = 'https://website-sangubayu-be.vercel.app/api/gallery';

    function showMessage(type, message) {
        messageBox.classList.remove('hidden', 'bg-red-500/80', 'bg-green-500/80', 'text-white');

        if (type === 'success') {
            messageBox.classList.add('bg-green-500/80', 'text-white');
        } else if (type === 'error') {
            messageBox.classList.add('bg-red-500/80', 'text-white');
        }

        messageText.textContent = message;
    }

    galleryForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!namaGambarInput.value.trim() || !urlGambarInput.files[0]) {
            showMessage('error', 'Nama Gambar and File Gambar wajib diisi.');
            return;
        }

        messageBox.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.textContent = 'MENYIMPAN...';

        const formData = new FormData();
        formData.append('nama_gambar', namaGambarInput.value.trim());
        formData.append('deskripsi_gambar', deskripsiGambarInput.value.trim());
        formData.append('url_gambar', urlGambarInput.files[0]);


        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            if (response.status >= 500) {
                throw new Error('Terjadi masalah pada server. Silakan coba lagi nanti.');
            }

            const result = await response.json();

            if (response.ok) {
                showMessage('success', 'Gambar berhasil disimpan!');

                setTimeout(() => {
                    galleryForm.reset();
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
            submitButton.textContent = 'SIMPAN GAMBAR';
        }
    });

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