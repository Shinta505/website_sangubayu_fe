document.addEventListener('DOMContentLoaded', function () {
    // Periksa apakah token autentikasi ada di localStorage
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Jika tidak ada token, alihkan pengguna ke halaman login
        alert('Anda harus login terlebih dahulu untuk mengakses halaman ini.');
        // Sesuaikan path ke index.html jika struktur folder Anda berbeda
        window.location.href = '/index.html';
    }
});