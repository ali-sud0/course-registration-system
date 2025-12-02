// js/add-course.js - مدیریت فرم افزودن درس

// گرفتن ارجاعات به فیلدها
const addCourseForm = document.getElementById('addCourseForm'); // فرم
const cName = document.getElementById('c-name'); // نام درس
const cCode = document.getElementById('c-code'); // کد درس
const cTeacher = document.getElementById('c-teacher'); // استاد
const cGroup = document.getElementById('c-group'); // گروه
const cCap = document.getElementById('c-cap'); // ظرفیت
const cTime = document.getElementById('c-time'); // زمان کلاس
const cExam = document.getElementById('c-exam'); // تاریخ امتحان

// هنگام submit فرم
if (addCourseForm) { // اگر فرم وجود داشت
  addCourseForm.addEventListener('submit', function (e) { // شنونده submit
    e.preventDefault(); // جلوگیری از رفتار پیش‌فرض ارسال فرم

    // خواندن و trim کردن مقادیر
    const newCourse = {
      name: cName.value.trim(), // نام درس
      code: cCode.value.trim(), // کد درس
      teacher: cTeacher.value, // استاد
      group: cGroup.value.trim(), // گروه
      capacity: parseInt(cCap.value, 10) || 0, // ظرفیت به عدد
      time: cTime.value.trim(), // زمان کلاس
      exam: cExam.value.trim() // تاریخ امتحان
    };

    // اعتبارسنجی ساده: نام و کد ضروری هستند
    if (!newCourse.name || !newCourse.code) { // اگر نام یا کد خالی بود
      alert('لطفاً نام درس و کد درس را وارد نمایید.'); // نمایش پیام
      return; // خروج
    }

    // ذخیره در localStorage به عنوان شبیه‌سازی سرور
    // ابتدا درخت courses فعلی را از localStorage می‌خوانیم (اگر وجود داشته باشد)
    const saved = localStorage.getItem('courses_data'); // گرفتن داده‌ها
    let list = saved ? JSON.parse(saved) : []; // اگر بود پارس کن، وگرنه آرایه خالی
    // اضافه کردن درس جدید به لیست
    list.push(newCourse); // افزودن
    // ذخیره مجدد در localStorage
    localStorage.setItem('courses_data', JSON.stringify(list)); // ذخیره سازی

    // اطلاع به کاربر و بازگشت به داشبورد
    alert('درس با موفقیت اضافه شد.'); // پیام موفقیت
    window.location.href = 'dashboard.html'; // هدایت به داشبورد
  });
}
