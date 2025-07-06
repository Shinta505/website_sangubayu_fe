document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    const umkmForm = document.getElementById('umkmForm');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const submitButton = umkmForm.querySelector('button[type="submit"]');

    const API_ENDPOINT = 'https://website-sangubayu-be.vercel.app/api/umkm';

    const showMessage = (type, message) => {
        messageBox.className = 'p-3 my-4 text-sm rounded-lg text-center text-white';
        messageBox.classList.add(type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80');
        messageText.textContent = message;
        messageBox.classList.remove('hidden');
    };

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID UMKM tidak ditemukan!');
        window.location.href = 'list-data.html';
        return;
    }

    async function populateForm() {
        try {
            const response = await fetch(`${API_ENDPOINT}/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil data UMKM.');
            const data = await response.json();

            document.getElementById('id_umkm').value = data.id_umkm;
            document.getElementById('nama_umkm').value = data.nama_umkm;
            document.getElementById('pemilik_umkm').value = data.pemilik_umkm;
            document.getElementById('deskripsi_umkm').value = data.deskripsi_umkm;
            document.getElementById('alamat_umkm').value = data.alamat_umkm;
            document.getElementById('kontak_umkm').value = data.kontak_umkm;
            document.getElementById('peta_umkm').value = data.peta_umkm;

        } catch (error) {
            showMessage('error', error.message);
        }
    }

    umkmForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'MEMPERBARUI...';

        const umkmData = {
            nama_umkm: document.getElementById('nama_umkm').value,
            pemilik_umkm: document.getElementById('pemilik_umkm').value,
            deskripsi_umkm: document.getElementById('deskripsi_umkm').value,
            alamat_umkm: document.getElementById('alamat_umkm').value,
            kontak_umkm: document.getElementById('kontak_umkm').value,
            peta_umkm: document.getElementById('peta_umkm').value,
        };

        try {
            const response = await fetch(`${API_ENDPOINT}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(umkmData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.msg || 'Terjadi kesalahan.');

            showMessage('success', 'Data UMKM berhasil diperbarui!');
            setTimeout(() => {
                window.location.href = 'list-data.html';
            }, 2000);

        } catch (error) {
            showMessage('error', error.message);
            submitButton.disabled = false;
            submitButton.textContent = 'UPDATE DATA UMKM';
        }
    });

    populateForm();
});