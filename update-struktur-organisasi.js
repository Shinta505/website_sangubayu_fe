document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    const strukturForm = document.getElementById('strukturForm');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const submitButton = strukturForm.querySelector('button[type="submit"]');
    const fotoPreview = document.getElementById('foto-preview');

    const API_ENDPOINT = 'https://website-sangubayu-be.vercel.app/api/struktur-organisasi';

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

            document.getElementById('id_struktur').value = data.id_struktur;
            document.getElementById('nama_jabatan').value = data.nama_jabatan;
            document.getElementById('nama_pejabat').value = data.nama_pejabat;

            if (data.foto_pejabat) {
                fotoPreview.src = data.foto_pejabat;
                fotoPreview.classList.remove('hidden');
            }

        } catch (error) {
            showMessage('error', error.message);
        }
    }

    strukturForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(this);

        // Jika tidak ada file baru yang dipilih, hapus field dari FormData
        if (formData.get('foto_pejabat').size === 0) {
            formData.delete('foto_pejabat');
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
            submitButton.textContent = 'UPDATE DATA';
        }
    });

    populateForm();
});