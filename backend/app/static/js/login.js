// گرفتن ارجاعات به عناصر صفحه
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorText = document.getElementById('errorText');
const togglePassword = document.getElementById('togglePassword');
const eyeVisible = document.getElementById('eyeVisible');
const eyeHidden = document.getElementById('eyeHidden');

const BASE_URL = 'http://127.0.0.1:8023'; // آدرس سرور واقعی

// نمایش/مخفی کردن رمز
if (togglePassword) {
  togglePassword.addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    eyeVisible.style.display = passwordInput.type === 'password' ? 'none' : "block";
    eyeHidden.style.display = passwordInput.type === 'password' ? 'block' : "none";
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


    // --------- ورود واقعی با API --------- //

    try {
      const response = await fetch(BASE_URL + "/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_number: document.getElementById("username").value,
          password: document.getElementById("password").value
        })
      });

      const data = await response.json();

      if (response.status === 200) {
        // ورود موفق، ذخیره JWT و هدایت
        localStorage.setItem('accessToken', data.access_token);
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
