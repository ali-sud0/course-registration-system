// js/login.js - منطق صفحه لاگین

// گرفتن ارجاعات به عناصر صفحه
const loginBtn = document.getElementById('loginBtn'); // دکمه ورود
const usernameInput = document.getElementById('username'); // فیلد نام کاربری
const passwordInput = document.getElementById('password'); // فیلد رمز
const errorText = document.getElementById('errorText'); // پاراگراف پیام خطا
const togglePassword = document.getElementById('togglePassword'); // دکمه چشم

// اطلاعات ورود تستی (هاردکد) - می‌تونی تغییرش بدی
const ADMIN_USER = 'admin'; // نام کاربری تستی
const ADMIN_PASS = '1234'; // رمز عبور تستی

// تابع نمایش/مخفی‌سازی رمز
if (togglePassword) { // اگر عنصر چشم وجود داشت
  togglePassword.addEventListener('click', function () { // افزودن رویداد کلیک
    if (passwordInput.type === 'password') { // اگر الان پنهان است
      passwordInput.type = 'text'; // نمایش رمز
    } else { // در غیر اینصورت
      passwordInput.type = 'password'; // مخفی کردن رمز
    }
  });
}

// تابع اعتبارسنجی و ورود
if (loginBtn) { // اگر دکمه ورود وجود داشت
  loginBtn.addEventListener('click', function () { // رویداد کلیک
    // برداشتن حالت خطا از فیلدها
    usernameInput.classList.remove('error'); // حذف کلاس خطا از نام کاربری
    passwordInput.classList.remove('error'); // حذف کلاس خطا از رمز
    errorText.style.display = 'none'; // مخفی کردن پیام خطا

    // خواندن مقادیر ورودی و trim کردن
    const username = usernameInput.value.trim(); // مقدار نام کاربری
    const password = passwordInput.value.trim(); // مقدار رمز

    let hasError = false; // فلگ خطا

    // اگر نام کاربری خالی بود
    if (!username) {
      usernameInput.classList.add('error'); // اضافه کردن کلاس خطا
      hasError = true; // نشان دادن وجود خطا
    }

    // اگر رمز خالی بود
    if (!password) {
      passwordInput.classList.add('error'); // اضافه کردن کلاس خطا
      hasError = true; // علامت خطا
    }

    // اگر خطا وجود داشت، پیغام خطا را نشان بده و برگرد
    if (hasError) {
      errorText.textContent = 'نام کاربری یا رمز عبور اشتباه است'; // متن خطا
      errorText.style.display = 'block'; // نمایش پیام
      return; // خروج از تابع
    }

    // بررسی اعتبار با مقادیر هاردکد شده
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // اگر درست بود به داشبورد هدایت شو
      window.location.href = 'dashboard.html'; // ریدایرکت به داشبورد
    } else {
      // اگر نادرست بود، نمایش پیام خطا و هایلایت فیلدها
      usernameInput.classList.add('error'); // اضافه کردن کلاس خطا
      passwordInput.classList.add('error'); // اضافه کردن کلاس خطا
      errorText.textContent = 'نام کاربری یا رمز اشتباه است'; // متن خطا
      errorText.style.display = 'block'; // نمایش پیام
    }
  });
}
