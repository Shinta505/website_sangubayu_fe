document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    // --- API Endpoints ---
    const API_STRUKTUR = 'https://website-sangubayu-be.vercel.app/api/struktur-organisasi';
    const API_UMKM = 'https://website-sangubayu-be.vercel.app/api/umkm';
    const API_PRODUK = 'https://website-sangubayu-be.vercel.app/api/produk';

    // --- Elemen Umum ---
    const mainContent = document.getElementById('main-content');
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const modalDialog = document.getElementById('modalDialog');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

    // --- Elemen Tab ---
    const tabStruktur = document.getElementById('tab-struktur');
    const tabUmkm = document.getElementById('tab-umkm');
    const contentStruktur = document.getElementById('content-struktur');
    const contentUmkm = document.getElementById('content-umkm');
    const strukturListContainer = document.getElementById('struktur-list');
    const umkmListContainer = document.getElementById('umkm-list');

    // --- Elemen Modal Hapus ---
    const deleteModal = document.getElementById('deleteModal');
    const deleteModalDialog = document.getElementById('deleteModalDialog');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const deleteMessage = document.getElementById('deleteMessage');

    // --- Elemen Modal Detail UMKM ---
    const umkmDetailModal = document.getElementById('umkmDetailModal');
    const umkmModalDialog = document.getElementById('umkmModalDialog');
    const closeUmkmModalBtn = document.getElementById('closeUmkmModalBtn');
    const detailNamaUmkm = document.getElementById('detailNamaUmkm');
    const umkmDetailContent = document.getElementById('umkmDetailContent');

    let itemToDelete = { type: null, id: null };
    // Variabel untuk menyimpan ID UMKM yang sedang dibuka di modal
    let currentOpenUmkmId = null;


    // --- Fungsi Sidebar & Logout (Tidak ada perubahan) ---
    const toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    };
    const showLogoutModal = () => {
        logoutModal.classList.remove('hidden');
        setTimeout(() => modalDialog.classList.remove('scale-95', 'opacity-0'), 10);
    };
    const hideLogoutModal = () => {
        modalDialog.classList.add('scale-95', 'opacity-0');
        setTimeout(() => logoutModal.classList.add('hidden'), 300);
    };

    if (burgerBtn) burgerBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLogoutModal();
    });
    if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../index.html';
    });
    if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', hideLogoutModal);


    // --- Fungsi Modal Hapus ---
    const showDeleteModal = (type, id, name) => {
        itemToDelete = { type, id };
        deleteMessage.textContent = `Apakah Anda yakin ingin menghapus ${name}?`;
        deleteModal.classList.remove('hidden');
        setTimeout(() => deleteModalDialog.classList.remove('scale-95', 'opacity-0'), 10);
    };

    const hideDeleteModal = () => {
        deleteModalDialog.classList.add('scale-95', 'opacity-0');
        setTimeout(() => deleteModal.classList.add('hidden'), 300);
    };

    cancelDeleteBtn.addEventListener('click', hideDeleteModal);

    // --- MODIFIKASI: Menambahkan logika hapus untuk 'produk' ---
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!itemToDelete.type || !itemToDelete.id) return;

        const { type, id } = itemToDelete;
        let url = '';
        if (type === 'struktur') url = `${API_STRUKTUR}/${id}`;
        if (type === 'umkm') url = `${API_UMKM}/${id}`;
        if (type === 'produk') url = `${API_PRODUK}/${id}`; // URL untuk hapus produk

        try {
            const response = await fetch(url, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Gagal menghapus data.');
            }

            hideDeleteModal();

            // Muat ulang data yang sesuai
            if (type === 'struktur') {
                await loadStrukturOrganisasi();
            } else if (type === 'umkm') {
                await loadUmkm();
            } else if (type === 'produk') {
                // Muat ulang detail UMKM yang sedang terbuka untuk refresh daftar produknya
                if (currentOpenUmkmId) {
                    await loadUmkmDetail(currentOpenUmkmId);
                }
            }

        } catch (error) {
            alert(error.message);
            hideDeleteModal();
        }
    });

    // --- Fungsi Modal Detail UMKM ---
    const showUmkmDetailModal = () => {
        umkmDetailModal.classList.remove('hidden');
        setTimeout(() => umkmModalDialog.classList.remove('scale-95', 'opacity-0'), 10);
    };
    const hideUmkmDetailModal = () => {
        umkmModalDialog.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            umkmDetailModal.classList.add('hidden');
            currentOpenUmkmId = null; // Reset ID UMKM saat modal ditutup
        }, 300);
    };

    closeUmkmModalBtn.addEventListener('click', hideUmkmDetailModal);


    // --- Fungsi Navigasi Tab (Tidak ada perubahan) ---
    function switchTab(target) {
        if (target === 'struktur') {
            contentStruktur.classList.remove('hidden');
            contentUmkm.classList.add('hidden');
            tabStruktur.classList.add('active-tab');
            tabUmkm.classList.remove('active-tab');
        } else {
            contentStruktur.classList.add('hidden');
            contentUmkm.classList.remove('hidden');
            tabStruktur.classList.remove('active-tab');
            tabUmkm.classList.add('active-tab');
        }
    }

    tabStruktur.addEventListener('click', () => switchTab('struktur'));
    tabUmkm.addEventListener('click', () => switchTab('umkm'));

    // --- Fungsi untuk memuat dan menampilkan data ---

    function createPlaceholder(container) {
        container.innerHTML = Array(3).fill('').map(() => `
            <div class="glass-effect p-5 rounded-xl animate-pulse">
                <div class="h-8 bg-gray-500/30 rounded w-3/4 mb-4"></div>
                <div class="h-6 bg-gray-500/30 rounded w-1/2 mb-6"></div>
                <div class="flex justify-end space-x-2">
                    <div class="h-10 w-20 bg-gray-500/30 rounded-lg"></div>
                    <div class="h-10 w-20 bg-gray-500/30 rounded-lg"></div>
                </div>
            </div>
        `).join('');
    }


    async function loadStrukturOrganisasi() {
        createPlaceholder(strukturListContainer);
        try {
            const response = await fetch(API_STRUKTUR);
            if (!response.ok) throw new Error('Gagal memuat data struktur organisasi.');
            const data = await response.json();

            strukturListContainer.innerHTML = '';

            if (data.length === 0) {
                strukturListContainer.innerHTML = `<p class="text-center col-span-full">Belum ada data struktur organisasi.</p>`;
                return;
            }

            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'glass-effect p-5 rounded-xl flex flex-col justify-between';
                card.innerHTML = `
                    <div>
                        <img src="${item.foto_pejabat || 'https://via.placeholder.com/150'}" alt="Foto ${item.nama_pejabat}" class="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-white/20 object-cover">
                        <h3 class="text-xl font-bold text-center">${item.nama_pejabat}</h3>
                        <p class="text-emerald-300 text-center text-sm mb-4">${item.nama_jabatan}</p>
                    </div>
                    <div class="flex justify-center gap-3 mt-4">
                        <a href="update-struktur-organisasi.html?id=${item.id_struktur}" class="edit-btn bg-yellow-500/80 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex-grow text-center">Edit</a>
                        <button class="delete-btn bg-rose-500/80 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex-grow" data-id="${item.id_struktur}" data-name="${item.nama_pejabat}">Hapus</button>
                    </div>
                `;
                strukturListContainer.appendChild(card);
            });

            strukturListContainer.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const name = e.currentTarget.dataset.name;
                    showDeleteModal('struktur', id, name);
                });
            });

        } catch (error) {
            strukturListContainer.innerHTML = `<p class="text-center col-span-full text-rose-400">${error.message}</p>`;
        }
    }


    async function loadUmkm() {
        createPlaceholder(umkmListContainer);
        try {
            const response = await fetch(API_UMKM);
            if (!response.ok) throw new Error('Gagal memuat data UMKM.');
            const data = await response.json();

            umkmListContainer.innerHTML = '';

            if (data.length === 0) {
                umkmListContainer.innerHTML = `<p class="text-center col-span-full">Belum ada data UMKM.</p>`;
                return;
            }

            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'glass-effect p-5 rounded-xl flex flex-col';
                card.innerHTML = `
                    <div class="flex-grow">
                        <h3 class="text-xl font-bold">${item.nama_umkm}</h3>
                        <p class="text-emerald-300 text-sm mb-3">Pemilik: ${item.pemilik_umkm}</p>
                        <p class="text-gray-300 text-xs line-clamp-3">${item.deskripsi_umkm || 'Tidak ada deskripsi.'}</p>
                    </div>
                    <div class="flex justify-end gap-3 mt-4">
                        <button class="detail-btn bg-sky-500/80 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200" data-id="${item.id_umkm}">Detail</button>
                        <a href="update-umkm.html?id=${item.id_umkm}" class="edit-btn bg-yellow-500/80 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">Edit</a>
                        <button class="delete-btn bg-rose-500/80 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200" data-id="${item.id_umkm}" data-name="${item.nama_umkm}">Hapus</button>
                    </div>
                `;
                umkmListContainer.appendChild(card);
            });

            umkmListContainer.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const name = e.currentTarget.dataset.name;
                    showDeleteModal('umkm', id, name);
                });
            });
            umkmListContainer.querySelectorAll('.detail-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    loadUmkmDetail(id);
                });
            });

        } catch (error) {
            umkmListContainer.innerHTML = `<p class="text-center col-span-full text-rose-400">${error.message}</p>`;
        }
    }

    // --- MODIFIKASI: Menambahkan tombol hapus di kartu produk ---
    async function loadUmkmDetail(id) {
        currentOpenUmkmId = id; // Simpan ID UMKM yang sedang dibuka
        detailNamaUmkm.textContent = 'Memuat...';
        umkmDetailContent.innerHTML = '<div class="h-40 bg-gray-500/30 rounded-lg animate-pulse"></div>';
        showUmkmDetailModal();

        try {
            const umkmResponse = await fetch(`${API_UMKM}/${id}`);
            if (!umkmResponse.ok) throw new Error('Gagal memuat detail UMKM.');
            const umkm = await umkmResponse.json();

            const produkResponse = await fetch(API_PRODUK);
            if (!produkResponse.ok) throw new Error('Gagal memuat data produk.');
            const allProduk = await produkResponse.json();
            const produkTerkait = allProduk.filter(p => p.id_umkm === umkm.id_umkm);

            detailNamaUmkm.textContent = umkm.nama_umkm;

            let produkHtml = '<h4 class="text-lg font-semibold mt-6 mb-3 text-emerald-300">Daftar Produk</h4>';
            if (produkTerkait.length > 0) {
                produkHtml += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">';
                produkTerkait.forEach(p => {
                    produkHtml += `
                        <div class="bg-black/20 p-4 rounded-lg flex flex-col">
                            <img src="${p.gambar_produk || 'https://via.placeholder.com/150'}" alt="${p.nama_produk}" class="w-full h-32 object-cover rounded-md mb-3">
                            <div class="flex-grow">
                                <h5 class="font-bold">${p.nama_produk}</h5>
                                <p class="text-sm text-gray-300 mb-2">${p.deskripsi_produk}</p>
                            </div>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-emerald-400 font-semibold">Rp ${new Intl.NumberFormat('id-ID').format(p.harga_produk)}</span>
                                <span class="text-xs bg-gray-500/50 px-2 py-1 rounded-full">Stok: ${p.stok_produk}</span>
                            </div>
                            <div class="flex justify-end gap-2 mt-4">
                                <a href="kelola-produk-umkm.html?id=${p.id_produk}" class="edit-produk-btn text-xs bg-yellow-500/80 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-lg transition duration-200">Edit</a>
                                <button class="delete-produk-btn text-xs bg-rose-500/80 hover:bg-rose-600 text-white font-semibold py-2 px-3 rounded-lg transition duration-200" data-id="${p.id_produk}" data-name="${p.nama_produk}">Hapus</button>
                            </div>
                        </div>
                    `;
                });
                produkHtml += '</div>';
            } else {
                produkHtml += '<p class="text-center text-gray-400 py-4">Belum ada produk untuk UMKM ini.</p>';
            }

            umkmDetailContent.innerHTML = `
                <p><strong>Pemilik:</strong> ${umkm.pemilik_umkm}</p>
                <p><strong>Kontak:</strong> ${umkm.kontak_umkm || '-'}</p>
                <p><strong>Alamat:</strong> ${umkm.alamat_umkm || '-'}</p>
                <p class="mt-2 text-gray-300">${umkm.deskripsi_umkm}</p>
                ${produkHtml}
            `;
            lucide.createIcons();

            // --- MODIFIKASI: Menambahkan event listener ke tombol hapus produk ---
            umkmDetailContent.querySelectorAll('.delete-produk-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.currentTarget.dataset.id;
                    const productName = e.currentTarget.dataset.name;
                    showDeleteModal('produk', productId, productName);
                });
            });


        } catch (error) {
            umkmDetailContent.innerHTML = `<p class="text-center text-rose-400">${error.message}</p>`;
        }

    }


    // --- Inisialisasi Halaman (Tidak ada perubahan) ---
    async function initializePage() {
        await loadStrukturOrganisasi();
        await loadUmkm();
        const message = localStorage.getItem('actionMessage');
        if (message) {
            alert(message);
            localStorage.removeItem('actionMessage');
        }
    }

    initializePage();

    // --- Style Tambahan untuk Tab Aktif ---
    const style = document.createElement('style');
    style.innerHTML = `
        .tab-button {
            position: relative;
            color: #d1d5db; /* gray-400 */
            border-bottom: 2px solid transparent;
            transition: all 0.3s ease;
        }
        .tab-button:hover {
            color: #ffffff;
        }
        .tab-button.active-tab {
            color: #34d399; /* emerald-400 */
            font-weight: 600;
            border-bottom-color: #34d399;
        }
    `;
    document.head.appendChild(style);
});