// گرفتن ارجاعات به عناصر صفحه
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorText = document.getElementById('errorText');
const togglePassword = document.getElementById('togglePassword');

const USE_LOCAL = true; // اگر true باشه، ورود لوکال است؛ اگر false، ورود به سرور
const BASE_URL = 'https://your-server.com/api'; // آدرس سرور واقعی

// داده های لوکال تستی
const LOCAL_USER = { username: 'admin', password: '1234' };

// نمایش/مخفی کردن رمز
if (togglePassword) {
  togglePassword.addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  });
}

// تابع نمایش پیام خطا
function showError(msg) {
  errorText.textContent = msg;
  errorText.style.display = 'block';
  usernameInput.classList.add('error');
  passwordInput.classList.add('error');
}

// تابع ورود
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');
    errorText.style.display = 'none';

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError('نام کاربری و رمز عبور الزامی است');
      return;
    }

    // --------- ورود لوکال --------- //
    if (USE_LOCAL) {
      if (username === LOCAL_USER.username && password === LOCAL_USER.password) {
        localStorage.setItem('accessToken', 'local-token'); // توکن ساختگی لوکال
        window.location.href = 'dashboard.html';
      } else {
        showError('نام کاربری یا رمز عبور اشتباه است');
      }
      return;
    }

    // --------- ورود واقعی با API --------- //
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.status === 200) {
        // ورود موفق، ذخیره JWT و هدایت
        localStorage.setItem('accessToken', data.token);
        window.location.href = 'dashboard.html';
      } else if (response.status === 401) {
        showError(data.message || 'نام کاربری یا رمز عبور اشتباه است');
      } else {
        showError(data.message || 'مشکلی پیش آمد، دوباره تلاش کنید');
      }
    } catch (err) {
      console.error(err);
      showError('خطای شبکه، لطفاً اتصال اینترنت را بررسی کنید');
    }
  });
}
