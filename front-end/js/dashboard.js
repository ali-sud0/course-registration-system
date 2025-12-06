// js/dashboard.js - مدیریت لیست دروس در داشبورد

// نمونه داده اولیه (شبیه عکس) - می‌توانی این را تغییر دهی یا از API بارگذاری کنی
let courses = [ // آرایه‌ی دروس نمونه
  { name: 'آنالیز ۱', code: 'MAT101', teacher: 'دکتر حسینی', group: 'A', capacity: 30, time: 'یکشنبه ۸-۱۰', exam: '1404/12/01 - 09:00' },
  { name: 'برنامه‌سازی پیشرفته', code: 'CS202', teacher: 'مهندس ادیب‌فر', group: 'B', capacity: 40, time: 'دوشنبه ۱۰-۱۲', exam: '1404/12/05 - 14:00' }
];

// گرفتن ارجاعات به DOM
const coursesContainer = document.getElementById('coursesContainer'); // ظرف نمایش ردیف‌ها
const logoutBtn = document.getElementById('logoutBtn'); // دکمه خروج
const btnFilter = document.getElementById('btnFilter'); // دکمه فیلتر
const filterName = document.getElementById('filterName'); // فیلتر نام
const filterCode = document.getElementById('filterCode'); // فیلتر کد

// تابع رندر لیست دروس
function renderCourses(list = courses) { // لیست پیش‌فرض آرایه courses
  // پاک کردن محتوا
  coursesContainer.innerHTML = ''; // حذف محتوای قبلی
  // برای هر درس یک ردیف بساز و اضافه کن
  list.forEach((c, idx) => { // پیمایش آرایه
    // ساخت عنصر ردیف
    const row = document.createElement('div'); // ایجاد div
    row.className = 'course-row'; // کلاس برای استایل
    // داخل ردیف محتوا را قرار می‌دهیم (شبکه‌ای مطابق CSS)
    row.innerHTML = `
      <div>${c.name}</div>
      <div>${c.code}</div>
      <div>${c.teacher}</div>
      <div>${c.group}</div>
      <div>${c.capacity}</div>
      <div>${c.time}</div>
      <div>${c.exam}</div>
      <div class="course-actions">
        <button class="small-btn edit-btn" onclick="openEdit(${idx})">ویرایش</button>
        <button class="small-btn remove-btn" onclick="removeCourse(${idx})">حذف</button>
      </div>
    `; // پایان innerHTML
    // افزودن ردیف به کانتینر
    coursesContainer.appendChild(row); // اضافه کردن به DOM
  }); // پایان forEach
} // پایان تابع renderCourses

// تابع حذف درس بر اساس ایندکس
function removeCourse(index) {
  // تایید حذف از کاربر
  const ok = confirm('آیا از حذف این درس مطمئن هستید؟'); // سوال تاییدی
  if (!ok) return; // اگر کاربر انصراف داد، خروج
  courses.splice(index, 1); // حذف از آرایه
  renderCourses(); // رندر مجدد لیست
}

// تابع باز کردن فرم ویرایش (پاپ‌آپ ساده با prompt برای نمونه)
function openEdit(index) {
  // گرفتن درس مورد نظر
  const course = courses[index]; // درس از آرایه
  // گرفتن مقادیر جدید توسط prompt (برای نمونه سریع)
  const newName = prompt('نام درس را ویرایش کنید:', course.name); // ویرایش نام
  if (newName === null) return; // اگر کاربر لغو کرد
  const newCode = prompt('کد درس را ویرایش کنید:', course.code); // ویرایش کد
  if (newCode === null) return; // لغو
  // اعمال تغییرات ساده
  course.name = newName.trim() || course.name; // به‌روزرسانی نام
  course.code = newCode.trim() || course.code; // به‌روزرسانی کد
  // رندر مجدد لیست
  renderCourses(); // نمایش تغییرات
}

// تابع فیلتر کردن لیست بر اساس فیلدها
function applyFilter() {
  // خواندن مقادیر فیلتر
  const nameQ = filterName.value.trim().toLowerCase(); // کوئری نام
  const codeQ = filterCode.value.trim().toLowerCase(); // کوئری کد
  // فیلتر آرایه
  const filtered = courses.filter(c => {
    // بررسی نام و کد (اگر فیلتر خالی باشد نادیده گرفته می‌شود)
    const matchName = nameQ ? c.name.toLowerCase().includes(nameQ) : true; // شرط نام
    const matchCode = codeQ ? c.code.toLowerCase().includes(codeQ) : true; // شرط کد
    return matchName && matchCode; // هر دو شرط برقرار باشد
  });
  // رندر لیست فیلتر شده
  renderCourses(filtered); // نمایش نتایج
}

// تابع logout ساده (هدایت به index)
if (logoutBtn) { // اگر دکمه خروج وجود داشت
  logoutBtn.addEventListener('click', function () { // رویداد کلیک
    // در اینجا می‌توان session را پاک کرد، فعلاً هدایت
    window.location.href = 'index.html'; // بازگشت به صفحه اول
  });
}

// وصل کردن رویداد جستجو
if (btnFilter) {
  btnFilter.addEventListener('click', applyFilter); // کلیک جستجو
}

// بارگذاری اولیه: رندر دروس نمونه
document.addEventListener('DOMContentLoaded', function () { // وقتی صفحه کامل بارگذاری شد
  renderCourses(); // رندر اولیه
});
