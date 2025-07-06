document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    // --- Elemen Umum (Sidebar, Modal, dll.) ---
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logoutBtn');
    // ... (sisa logika sidebar dan modal sama seperti sebelumnya) ...
    const mainContent = document.getElementById('main-content');
    const toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
        if (!sidebar.classList.contains('-translate-x-full')) {
            mainContent.classList.add('lg:pl-72');
        } else {
            mainContent.classList.remove('lg:pl-72');
        }
    };
    if (burgerBtn) burgerBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);
    // ... (sisa event listener modal) ...


    // --- Elemen Spesifik Halaman Form ---
    const produkForm = document.getElementById('produkForm');
    const formContainer = document.getElementById('formContainer');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const submitButton = document.getElementById('submitButton');
    const umkmSelect = document.getElementById('id_umkm');
    const gambarPreview = document.getElementById('gambar-preview');
    const formSubtitle = document.getElementById('form-subtitle');

    const API_PRODUK = 'https://website-sangubayu-be.vercel.app/api/produk';
    const API_UMKM = 'https://website-sangubayu-be.vercel.app/api/umkm';

    // --- Fungsi Bantuan ---
    const showMessage = (type, message) => {
        messageBox.className = 'p-3 my-4 text-sm rounded-lg text-center text-white';
        messageBox.classList.add(type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80');
        messageText.textContent = message;
    };

    // --- Logika Utama ---

    async function loadUmkm() {
        try {
            const response = await fetch(API_UMKM);
            if (!response.ok) throw new Error('Gagal memuat data UMKM.');
            const umkmList = await response.json();
            umkmSelect.innerHTML = '<option value="">Pilih UMKM...</option>';
            umkmList.forEach(umkm => {
                const option = document.createElement('option');
                option.value = umkm.id_umkm;
                option.textContent = umkm.nama_umkm;
                umkmSelect.appendChild(option);
            });
        } catch (error) {
            showMessage('error', error.message);
        }
    }

    async function populateFormForEdit(id) {
        try {
            const response = await fetch(`${API_PRODUK}/${id}`);
            if (!response.ok) {
                window.location.href = 'daftar-produk.html';
                return;
            };
            const produk = await response.json();

            document.getElementById('id_produk').value = produk.id_produk;
            document.getElementById('nama_produk').value = produk.nama_produk;
            document.getElementById('deskripsi_produk').value = produk.deskripsi_produk;
            document.getElementById('harga_produk').value = produk.harga_produk;
            document.getElementById('stok_produk').value = produk.stok_produk;
            document.getElementById('id_umkm').value = produk.id_umkm;

            gambarPreview.src = produk.gambar_produk || '';
            gambarPreview.classList.toggle('hidden', !produk.gambar_produk);

            formSubtitle.textContent = `Ubah Produk: ${produk.nama_produk}`;
            submitButton.textContent = 'UPDATE PRODUK';
        } catch (error) {
            showMessage('error', error.message);
        }
    }

    produkForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const id = document.getElementById('id_produk').value;
        const isUpdating = id !== '';
        const formData = new FormData(this);

        if (isUpdating && formData.get('gambar_produk').size === 0) {
            formData.delete('gambar_produk');
        }

        submitButton.disabled = true;
        submitButton.textContent = 'MENYIMPAN...';

        try {
            const response = await fetch(isUpdating ? `${API_PRODUK}/${id}` : API_PRODUK, {
                method: isUpdating ? 'PUT' : 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.msg || 'Terjadi kesalahan.');

            // Simpan pesan sukses di localStorage untuk ditampilkan setelah redirect
            localStorage.setItem('actionMessage', result.message);
            window.location.href = 'daftar-produk.html';

        } catch (error) {
            showMessage('error', error.message);
            formContainer.classList.add('animate-shake');
            setTimeout(() => formContainer.classList.remove('animate-shake'), 500);
            submitButton.disabled = false;
            submitButton.textContent = isUpdating ? 'UPDATE PRODUK' : 'SIMPAN PRODUK';
        }
    });

    // --- Initial Load ---
    async function initializePage() {
        await loadUmkm(); // Muat UMKM dulu
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId) {
            populateFormForEdit(productId);
        }
    }

    initializePage();

    // Shake Animation Style
    const style = document.createElement('style');
    style.innerHTML = `@keyframes shake {
        0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); }
    } .animate-shake { animation: shake 0.5s ease-in-out; }`;
    document.head.appendChild(style);
});