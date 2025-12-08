// بارگذاری اولیه دروس از localStorage
let courses = JSON.parse(localStorage.getItem('courses_data')) || [];

// ارجاع به عناصر DOM
const coursesContainer = document.getElementById('coursesContainer');
const logoutBtn = document.getElementById('logoutBtn');
const btnFilter = document.getElementById('btnFilter');
const filterName = document.getElementById('filterName');
const filterCode = document.getElementById('filterCode');

// مودال و فرم افزودن درس
const addCourseBtn = document.getElementById('openAddCourseModal');
const addCourseModal = document.getElementById('addCourseModal');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const addCourseForm = document.getElementById('addCourseForm');
const cName = document.getElementById('c-name');
const cCode = document.getElementById('c-code');
const cTeacher = document.getElementById('c-teacher');
const cGroup = document.getElementById('c-group');
const cCap = document.getElementById('c-cap');
const cTime = document.getElementById('c-time');
const cExam = document.getElementById('c-exam');

const BASE_URL = 'https://your-server.com/api'; // آدرس سرور واقعی

// ---------- توابع ---------- //

// رندر لیست دروس
function renderCourses(list = courses) {
  coursesContainer.innerHTML = '';
  list.forEach((c, idx) => {
    const row = document.createElement('div');
    row.className = 'course-row';
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
    `;
    coursesContainer.appendChild(row);
  });
}

// حذف درس
function removeCourse(index) {
  if (!confirm('آیا از حذف این درس مطمئن هستید؟')) return;
  courses.splice(index, 1);
  localStorage.setItem('courses_data', JSON.stringify(courses));
  renderCourses();
}

// ویرایش درس (تمام فیلدها)
function openEdit(index) {
  const course = courses[index];
  const newName = prompt('نام درس:', course.name);
  if (newName === null) return;
  const newCode = prompt('کد درس:', course.code);
  if (newCode === null) return;
  const newTeacher = prompt('استاد:', course.teacher);
  if (newTeacher === null) return;
  const newGroup = prompt('گروه:', course.group);
  if (newGroup === null) return;
  const newCap = prompt('ظرفیت:', course.capacity);
  if (newCap === null) return;
  const newTime = prompt('زمان کلاس (تاریخ):', course.time);
  if (newTime === null) return;
  const newExam = prompt('تاریخ امتحان:', course.exam);
  if (newExam === null) return;

  course.name = newName.trim();
  course.code = newCode.trim();
  course.teacher = newTeacher.trim();
  course.group = newGroup.trim();
  course.capacity = parseInt(newCap, 10) || course.capacity;
  course.time = newTime.trim();
  course.exam = newExam.trim();

  localStorage.setItem('courses_data', JSON.stringify(courses));
  renderCourses();
}

// فیلتر لیست
function applyFilter() {
  const nameQ = filterName.value.trim().toLowerCase();
  const codeQ = filterCode.value.trim().toLowerCase();
  const filtered = courses.filter(c => {
    const matchName = nameQ ? c.name.toLowerCase().includes(nameQ) : true;
    const matchCode = codeQ ? c.code.toLowerCase().includes(codeQ) : true;
    return matchName && matchCode;
  });
  renderCourses(filtered);
}

// ---------- مودال ---------- //
if (addCourseBtn) {
  addCourseBtn.addEventListener('click', () => addCourseModal.style.display = 'block');
}
if (closeModal) closeModal.addEventListener('click', () => addCourseModal.style.display = 'none');
if (cancelModal) cancelModal.addEventListener('click', () => addCourseModal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === addCourseModal) addCourseModal.style.display = 'none'; });

// ---------- افزودن درس ---------- //
if (addCourseForm) {
  addCourseForm.addEventListener('submit', async e => {
    e.preventDefault();

    const newCourse = {
      name: cName.value.trim(),
      code: cCode.value.trim(),
      teacher: cTeacher.value,
      group: cGroup.value.trim(),
      capacity: parseInt(cCap.value, 10) || 0,
      time: cTime.value,
      exam: cExam.value
    };

    if (!newCourse.name || !newCourse.code) {
      alert('نام درس و کد الزامی است.');
      return;
    }

    // ذخیره در localStorage
    courses.push(newCourse);
    localStorage.setItem('courses_data', JSON.stringify(courses));
    renderCourses();
    addCourseModal.style.display = 'none';
    addCourseForm.reset();

    // ارسال به سرور (اختیاری)
    try {
      const response = await fetch(`${BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
      if (!response.ok) console.warn('ارسال به سرور موفق نبود');
    } catch (err) {
      console.error('خطای شبکه:', err);
    }
  });
}

// ---------- خروج ---------- //
if (logoutBtn) logoutBtn.addEventListener('click', () => window.location.href = 'index.html');

// ---------- جستجو ---------- //
if (btnFilter) btnFilter.addEventListener('click', applyFilter);

// ---------- بارگذاری اولیه ---------- //
document.addEventListener('DOMContentLoaded', () => renderCourses());

// تابع ها باید گلوبال باشند برای onclick inline
window.openEdit = openEdit;
window.removeCourse = removeCourse;
