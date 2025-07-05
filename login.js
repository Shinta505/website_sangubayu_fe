// LOGIN SCRIPT
document.addEventListener('DOMContentLoaded', function () {
    // --- Initialize Lucide Icons ---
    lucide.createIcons();

    // --- DOM Element References ---
    const loginForm = document.getElementById('loginForm');
    const formContainer = document.getElementById('formContainer');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    // --- Backend API Endpoint ---
    const API_ENDPOINT = 'https://website-sangubayu-be.vercel.app/api/login';

    // --- Password Visibility Toggle ---
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
        lucide.createIcons();
    });

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
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const enteredUsername = usernameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        // Reset state
        messageBox.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.textContent = 'MEMPROSES...';

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: enteredUsername,
                    password: enteredPassword,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                // --- SUCCESS ---
                showMessage('success', 'Login berhasil! Mengalihkan...');
                localStorage.setItem('authToken', result.token); // Simpan token jika ada

                setTimeout(() => {
                    // Ganti dengan halaman dashboard admin Anda
                    window.location.href = 'html/struktur-organisasi.html';
                    console.log('Redirecting to admin dashboard.');
                    loginForm.reset();
                    messageBox.classList.add('hidden');
                }, 2000);

            } else {
                // --- FAILURE ---
                throw new Error(result.message || 'Username atau password salah.');
            }

        } catch (error) {
            showMessage('error', error.message);
            formContainer.classList.add('animate-shake');
            setTimeout(() => {
                formContainer.classList.remove('animate-shake');
            }, 500);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'MASUK';
        }
    });

    // --- Shake Animation (No changes needed here) ---
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