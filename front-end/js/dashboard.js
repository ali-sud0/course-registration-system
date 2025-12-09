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

// toast
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');

// empty state
const emptyStateCourse = document.getElementById('emptyStateCourse');

const canShowRemoveAlert = true;

const BASE_URL = 'https://your-server.com/api'; // آدرس سرور واقعی

// ---------- توابع ---------- //

// رندر لیست دروس


function renderCourses(list = courses) {
  coursesContainer.innerHTML = ''
  list.forEach((c, idx) => {
    const row = document.createElement('tr');
    row.className = 'table-body';
    row.innerHTML = `
                <td>${c.name}</td>
                <td>${c.code}</td>
                <td>${c.group}</td>
                <td>${c.capacity}</td>
                <td>${c.teacher}</td>
                <td>${c.time}</td>
                <td>${c.exam}</td>
                <td>
                  <div class="more-actions">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8 8.66675C8.36819 8.66675 8.66667 8.36827 8.66667 8.00008C8.66667 7.63189 8.36819 7.33341 8 7.33341C7.63181 7.33341 7.33334 7.63189 7.33334 8.00008C7.33334 8.36827 7.63181 8.66675 8 8.66675Z"
                        stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path
                        d="M8 4.00008C8.36819 4.00008 8.66667 3.7016 8.66667 3.33341C8.66667 2.96522 8.36819 2.66675 8 2.66675C7.63181 2.66675 7.33334 2.96522 7.33334 3.33341C7.33334 3.7016 7.63181 4.00008 8 4.00008Z"
                        stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path
                        d="M8 13.3334C8.36819 13.3334 8.66667 13.0349 8.66667 12.6667C8.66667 12.2986 8.36819 12.0001 8 12.0001C7.63181 12.0001 7.33334 12.2986 7.33334 12.6667C7.33334 13.0349 7.63181 13.3334 8 13.3334Z"
                        stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                  </div>
                </td>
              `;
    coursesContainer.appendChild(row);


      // more options
    document.querySelectorAll('.more-actions').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();

      showBox(e,list,idx);
      
    });
  });

  // بستن وقتی بیرون کلیک شد
  document.addEventListener('click', () => {
    document.querySelectorAll('.course-menu-wrapper').forEach(box => box.style.display = 'none');
  });


  });

  emptyStateCourse.style.display = list.length === 0 ? 'flex' : 'none';
}

function showBox(e,list, idx){
  const box = document.getElementById("courseOptions");
      box.style.setProperty("--x", e.clientX + "px");
      box.style.setProperty("--y", e.clientY + "px");
      box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';
      
      const courseDelete = document.getElementById("courseDelete");
      const courseEdit = document.getElementById("courseEdit");

      courseDelete.addEventListener('click', () =>{
        removeCourse(list[idx]);
      });
      
      courseEdit.addEventListener('click', () =>{
        openEdit(idx);
      });
}

// حذف درس
function removeCourse(index) {
  
  if (!confirm('آیا از حذف این درس مطمئن هستید؟') || !canShowRemoveAlert) return;
  courses.splice(index, 1);
  localStorage.setItem('courses_data', JSON.stringify(courses));
  renderCourses();

  setTimeout(() => {
    canShowRemoveAlert = true;
  }, 1000);

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

    showToast('success', "موفق", 'درس با موفقیت اضافه شد');
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

function showToast(status, title, desc) {
  if (status === 'success') {
    toast.style.backgroundColor = '#10B981';
  } else if (status === 'failed') {
    toast.style.backgroundColor = '#EF4444';
  } else {
    toast.style.backgroundColor = '#F59E0B';
  }

  toastTitle.innerHTML = title;
  toastDesc.innerHTML = desc;

  toast.style.display = 'flex';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);

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
