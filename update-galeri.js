document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    const galeriForm = document.getElementById('galeriForm');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const submitButton = galeriForm.querySelector('button[type="submit"]');
    const gambarPreview = document.getElementById('gambar-preview');

    const API_ENDPOINT = 'https://website-sangubayu-be.vercel.app/api/gallery';

    const showMessage = (type, message) => {
        messageBox.className = 'p-3 my-4 text-sm rounded-lg text-center text-white';
        messageBox.classList.add(type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80');
        messageText.textContent = message;
        messageBox.classList.remove('hidden');
    };

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID tidak ditemukan!');
        window.location.href = 'list-data.html';
        return;
    }

    async function populateForm() {
        try {
            const response = await fetch(`${API_ENDPOINT}/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil data.');
            const data = await response.json();

            document.getElementById('id_galeri').value = data.id_galeri;
            document.getElementById('deskripsi_gambar').value = data.deskripsi_gambar;

            if (data.url_gambar) {
                gambarPreview.src = data.url_gambar;
                gambarPreview.classList.remove('hidden');
            }

        } catch (error) {
            showMessage('error', error.message);
        }
    }

    galeriForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(this);

        if (formData.get('url_gambar').size === 0) {
            formData.delete('url_gambar');
        }

        submitButton.disabled = true;
        submitButton.textContent = 'MEMPERBARUI...';

        try {
            const response = await fetch(`${API_ENDPOINT}/${id}`, {
                method: 'PUT',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.msg || 'Terjadi kesalahan.');

            showMessage('success', 'Data berhasil diperbarui!');
            setTimeout(() => {
                window.location.href = 'list-data.html';
            }, 2000);

        } catch (error) {
            showMessage('error', error.message);
            submitButton.disabled = false;
            submitButton.textContent = 'UPDATE GAMBAR';
        }
    });

    populateForm();
});