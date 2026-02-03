// بارگذاری اولیه دروس از localStorage
let courses = JSON.parse(localStorage.getItem('courses_data')) || [];
let professors = JSON.parse(localStorage.getItem('courses_data')) || [];
let prerequires = JSON.parse(localStorage.getItem('prerequires_data')) || [];

const navbarTitle = document.getElementById('navbarTitle');

const menuCourses = document.getElementById('menuCourses');
const menuProfessors = document.getElementById('menuProfessors');
const menuStudents = document.getElementById('menuStudents');
const menuSettings = document.getElementById('menuSettings');

// ارجاع به عناصر DOM
const coursesContainer = document.getElementById('coursesContainer');
const prerequiresContainer = document.getElementById('prerequiresContainer');
const logoutBtn = document.getElementById('logoutBtn');
const btnFilter = document.getElementById('btnFilter');
const filterName = document.getElementById('filterName');
const filterProfessor = document.getElementById('filterProfessor');

// مودال و فرم افزودن درس
const modalTitle = document.getElementById('modalTitle');
const modalTitlePrerequire = document.getElementById('modalTitlePrerequire');
const addCourseBtn = document.getElementById('openAddCourseModal');
const addPrerequire = document.getElementById('addPrerequire');
const addCourseModal = document.getElementById('addCourseModal');
const addPrerequireModal = document.getElementById('addPrerequireModal');
const closeModal = document.getElementById('closeModal');
const closeModalPrerequire = document.getElementById('closeModalPrerequire');
const cancelModal = document.getElementById('cancelModal');
const cancelModalPrerequire = document.getElementById('cancelModalPrerequire');
const addCourseForm = document.getElementById('addCourseForm');
const addPrerequireForm = document.getElementById('addPrerequireForm');
const prerequireSubmit = document.getElementById('prerequireSubmit');
const cName = document.getElementById('c-name');
const cCode = document.getElementById('c-code');
const cUnits = document.getElementById('c-units');
const cProfessor = document.getElementById('c-professor');
const cGroup = document.getElementById('c-group');
const cCap = document.getElementById('c-cap');
const cTime = document.getElementById('c-time');
const cExam = document.getElementById('c-exam');

const pCourseOne = document.getElementById('p-course-one');
const pCourseTwo = document.getElementById('p-course-two');

// toast
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');

// empty state
const emptyStateCourse = document.getElementById('emptyStateCourse');
const emptyStatePrerequire = document.getElementById('emptyStatePrerequire');

let canShowRemoveAlert = true;
let editingPrerequireIndex = null;


const BASE_URL = 'http://127.0.0.1:8000'; // آدرس سرور واقعی

// ---------- توابع ---------- //


if (getUserRole() === "Admin") {
  navbarTitle.innerText = "سلام ادمین";
} else if (getUserRole() === "Professor") {
  navbarTitle.innerText = "سلام استاد";
} else if (getUserRole() === "Student") {
  navbarTitle.innerText = "سلام دانشجو عزیز";
}



async function renderPrerequires(list = prerequires, isFilter = false) {
  prerequiresContainer.innerHTML = '';

  if (!isFilter) {
    try {
      const response = await fetch(BASE_URL + "/prerequisites/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        }
      });
      if (!response.ok) {
        console.warn('ارسال به سرور موفق نبود');
      } else {
        list = await response.json();
        prerequires = list;
      }
      handleJwtExpire(response);


    } catch (err) {
      console.error('خطای شبکه:', err);
    }
  } else {

  }

  list.forEach((p, idx) => {
    const row = document.createElement('tr');
    row.className = 'table-body prerequire-table-body';
    row.innerHTML = `
                <td>${getCourseName(p.course_id)}</td>
                <td>${getCourseName(p.prerequisite_course_id)}</td>
                <td>
                  <div class="more-actions-prerequires">
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
    prerequiresContainer.appendChild(row);

  });


  // more options
  document.querySelectorAll('.more-actions-prerequires').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();

      const row = btn.closest('tr');
      const index = Array.from(prerequiresContainer.querySelectorAll('tr')).indexOf(row);
      showPrerequireBox(e, prerequires, index);

    });
  });

  // بستن وقتی بیرون کلیک شد
  document.addEventListener('click', () => {
    document.querySelectorAll('.prerequire-menu-wrapper').forEach(box => box.style.display = 'none');
  });

  emptyStatePrerequire.style.display = list.length === 0 ? 'flex' : 'none';
}





















// رندر لیست دروس

async function renderCourses(list = courses, isFilter = false) {
  coursesContainer.innerHTML = '';

  if (!isFilter) {
    try {
      const response = await fetch(BASE_URL + "/courses", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        }
      });
      if (!response.ok) {
        console.warn('ارسال به سرور موفق نبود');
      } else {
        list = await response.json();
        courses = list;
      }
      handleJwtExpire(response);


    } catch (err) {
      console.error('خطای شبکه:', err);
    }
  } else {

  }

  list.forEach((c, idx) => {
    const row = document.createElement('tr');
    row.className = 'table-body';
    row.innerHTML = `
                <td>${c.name}</td>
                <td>${c.course_code}</td>
                <td>${c.units}</td>
                <td>${c.grp}</td>
                <td>${c.capacity}</td>
                <td>${c.professor}</td>
                <td>2025-11-09  10:30</td>
                <td>2025-12-27  11:30</td>
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


  });


  // more options
  document.querySelectorAll('.more-actions').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();

      const row = btn.closest('tr');
      const index = Array.from(coursesContainer.querySelectorAll('tr')).indexOf(row);
      showBox(e, courses, index);

    });
  });

  // بستن وقتی بیرون کلیک شد
  document.addEventListener('click', () => {
    document.querySelectorAll('.course-menu-wrapper').forEach(box => box.style.display = 'none');
  });

  emptyStateCourse.style.display = list.length === 0 ? 'flex' : 'none';
}

function showBox(e, list, idx) {
  const box = document.getElementById("courseOptions");
  box.style.setProperty("--x", e.clientX + "px");
  box.style.setProperty("--y", e.clientY + "px");
  box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';

  const courseDelete = document.getElementById("courseDelete");
  const courseEdit = document.getElementById("courseEdit");

  courseDelete.addEventListener('click', function (e) {
    removeCourse(idx);
  });

  courseEdit.addEventListener('click', function (e) {
    openEdit(idx);
  });
}

function showPrerequireBox(e, list, idx) {
  const box = document.getElementById("prerequireOptions");
  box.style.setProperty("--x", e.clientX + "px");
  box.style.setProperty("--y", e.clientY + "px");
  box.style.display = (box.style.display === 'flex') ? 'none' : 'flex';

  const prerequireDelete = document.getElementById("prerequireDelete");
  const prerequireEdit = document.getElementById("prerequireEdit");

  prerequireDelete.addEventListener('click', function (e) {
    removePrerequire(idx);
  });

  prerequireEdit.addEventListener('click', function (e) {
    editingPrerequireIndex = idx;
    openEditPrerequire();
  });
}

// حذف درس
async function removeCourse(index) {
  canShowRemoveAlert = false;
  if (!confirm('آیا از حذف این درس مطمئن هستید؟') && !canShowRemoveAlert) return;
  canShowRemoveAlert = true;

  try {
    const course = courses[index];
    const response = await fetch(BASE_URL + "/courses/" + course.id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    });
    if (!response.ok) {
      showToast('failed', "خطا", 'خطا در حذف درس');
    } else {
      renderCourses();
      showToast('success', "موفق", 'درس با موفقیت حذف شد');
    }
  } catch (err) {
    console.error('خطای شبکه:', err);
  }


}


// حذف پیش نیاز
async function removePrerequire(index) {
  canShowRemoveAlert = false;
  if (!confirm('آیا از حذف این پیش نیاز مطمئن هستید؟') && !canShowRemoveAlert) return;
  canShowRemoveAlert = true;

  try {
    const prerequire = prerequires[index];
    const response = await fetch(BASE_URL + "/prerequisites/" + prerequire.id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    });
    if (!response.ok) {
      showToast('failed', "خطا", 'خطا در حذف پیش نیاز');
    } else {
      renderPrerequires();
      showToast('success', "موفق", 'پیش نیاز با موفقیت حذف شد');
    }
  } catch (err) {
    console.error('خطای شبکه:', err);
  }


}





// ویرایش درس (تمام فیلدها)
async function openEdit(index) {

  addCourseModal.style.display = 'block';
  modalTitle.innerText = "ویرایش درس";

  const course = courses[index];

  cName.value = course.name;
  cCode.value = course.course_code;
  cUnits.value = course.units;
  cProfessor.value = course.professor;
  cGroup.value = course.grp;
  cCap.value = course.capacity;
  cTime.value = course.time;
  cExam.value = course.exam;

  /*
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

  */

  addCourseForm.addEventListener('submit', async e => {
    e.preventDefault();

    const newCourse = {
      course_code: cCode.value.trim(),
      name: cName.value.trim(),
      units: cUnits.value.trim(),
      professor: cProfessor.value.trim(),
      capacity: cCap.value.trim(),
      grp: cGroup.value.trim()
      //time: cTime.value,
      //exam: cExam.value
    };

    if (!newCourse.name || !newCourse.course_code) {
      alert('نام درس و کد الزامی است.');
      return;
    }

    try {
      const response = await fetch(BASE_URL + "/courses/" + course.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        },
        body: JSON.stringify(newCourse)
      });
      if (!response.ok) {
        showToast('failed', "خطا", 'خطا در ویرایش درس');
      } else {
        renderCourses();
        showToast('success', "موفق", 'درس با موفقیت ویرایش شد');
      }
      addCourseModal.style.display = 'none';

      handleJwtExpire(response);

    } catch (err) {
      console.error('خطای شبکه:', err);
    }

    /*
    course.teacher = newTeacher.trim();
    course.group = newGroup.trim();
    course.capacity = parseInt(newCap, 10) || course.capacity;
    course.time = newTime.trim();
    course.exam = newExam.trim();
    */


  }, { once: true });
}







// ویرایش پیش نیاز 
async function openEditPrerequire() {

  if (editingPrerequireIndex === null) return;

  addPrerequireModal.style.display = 'block';
  modalTitlePrerequire.innerText = "ویرایش پیش نیاز";

  const p = prerequires[editingPrerequireIndex];
  assignCoursesList();

  addPrerequireForm.addEventListener('submit', async e => {
    e.preventDefault();

    const newPrerequire = {
      id: p.id,
      course_id: getCourseId(pCourseOne.options[pCourseOne.selectedIndex].text),
      prerequisite_course_id: getCourseId(pCourseTwo.options[pCourseTwo.selectedIndex].text)
    };

    if (!newPrerequire.course_id || !newPrerequire.prerequisite_course_id) {
      alert('انتخاب هر دو درس الزامی است');
      return;
    }

    try {
      const response = await fetch(BASE_URL + "/prerequisites/" + p.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        },
        body: JSON.stringify(newPrerequire)
      });
      if (!response.ok) {
        showToast('failed', "خطا", 'خطا در ویرایش پیش نیاز');
      } else {
        renderPrerequires();
        showToast('success', "موفق", 'پیش نیاز با موفقیت ویرایش شد');
      }
      addPrerequireModal.style.display = 'none';
      editingPrerequireIndex = null;

      handleJwtExpire(response);

    } catch (err) {
      console.error('خطای شبکه:', err);
    }

  }, { once: true });
}



// فیلتر لیست
function applyFilter() {
  const nameQ = filterName.value.trim().toLowerCase();
  const profQ = filterProfessor.value !== null ? filterProfessor.value.trim().toLowerCase() : "";
  const filtered = courses.filter(c => {
    const matchName = nameQ ? c.name.toLowerCase().includes(nameQ) : true;
    const matchTeacher = profQ ? c.professor?.toLowerCase().includes(profQ.toLowerCase()) : true;
    return matchName && matchTeacher;
  });
  renderCourses(filtered, true);
}




// ---------- مودال ---------- //
if (addCourseBtn) {
  addCourseBtn.addEventListener('click', function (e) {
    addCourseModal.style.display = 'block';
    modalTitle.innerText = "افزودن درس جدید";
  });

}
closeModal.removeEventListener('click', null);
cancelModal.removeEventListener('click', null);

if (closeModal) closeModal.addEventListener('click', () => addCourseModal.style.display = 'none');
if (cancelModal) cancelModal.addEventListener('click', () => addCourseModal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === addCourseModal) addCourseModal.style.display = 'none'; });


// ---------- مودال ---------- //
if (addPrerequire) {
  addPrerequire.addEventListener('click', function (e) {
    addPrerequireModal.style.display = 'block';
    modalTitlePrerequire.innerText = "افزودن پیش نیاز";

    assignCoursesList();
  });

}

if (closeModalPrerequire) closeModalPrerequire.addEventListener('click', () => addPrerequireModal.style.display = 'none');
if (cancelModalPrerequire) cancelModalPrerequire.addEventListener('click', () => addPrerequireModal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === addPrerequireModal) addPrerequireModal.style.display = 'none'; });

// ---------- افزودن درس ---------- //
if (addCourseForm) {
  addCourseForm.addEventListener('submit', async e => {
    e.preventDefault();

    const newCourse = {
      name: cName.value.trim(),
      course_code: cCode.value.trim(),
      units: cUnits.value.trim(),
      professor: cProfessor.value.trim(),
      capacity: cCap.value.trim(),
      grp: cGroup.value.trim()
      //time: cTime.value,
      //exam: cExam.value
    };

    if (!newCourse.name || !newCourse.course_code) {
      alert('نام درس و کد الزامی است.');
      return;
    }

    // ذخیره در localStorage
    // courses.push(newCourse);
    // localStorage.setItem('courses_data', JSON.stringify(courses));
    // addCourseModal.style.display = 'none';
    // addCourseForm.reset();


    try {
      const response = await fetch(BASE_URL + "/courses", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        },
        body: JSON.stringify(newCourse)
      });
      if (!response.ok) {
        showToast('failed', "خطا", 'خطا در افزودن درس');
      } else {
        renderCourses();
        showToast('success', "موفق", 'درس با موفقیت اضافه شد');
      }
      addCourseModal.style.display = 'none';
      handleJwtExpire(response);

    } catch (err) {
      console.error('خطای شبکه:', err);
    }
  }, { once: true });
}



// افزودن پیش نیاز
if (addPrerequireForm) {

  addPrerequireForm.addEventListener('submit', async e => {
    e.preventDefault();

    const newPrerequire = {
      course_id: getCourseId(pCourseOne.options[pCourseOne.selectedIndex].text),
      prerequisite_course_id: getCourseId(pCourseTwo.options[pCourseTwo.selectedIndex].text)
    };

    if (!newPrerequire.course_id || !newPrerequire.prerequisite_course_id) {
      alert('انتخاب هر دو درس الزامی است');
      return;
    }

    try {
      const response = await fetch(BASE_URL + "/prerequisites", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        },
        body: JSON.stringify(newPrerequire)
      });
      if (!response.ok) {
        showToast('failed', "خطا", 'خطا در افزودن پیش نیاز');
      } else {
        renderPrerequires();
        showToast('success', "موفق", 'پیش نیاز با موفقیت اضافه شد');
      }
      addPrerequireModal.style.display = 'none';
      handleJwtExpire(response);

    } catch (err) {
      console.error('خطای شبکه:', err);
    }
  }, { once: true });
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

function getUserRole() {
  const token = localStorage.getItem("accessToken");
  if (token !== null) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)).role;
  }
}

function handleJwtExpire(response) {
  if (response.status === 401) {
    alert("زمان شما منقضی شده است, لطفا مجدد لاگین کنید");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    window.location.href = "/login";
    return;
  }
}


// ---------- خروج ---------- //
if (logoutBtn) logoutBtn.addEventListener('click', () => window.location.href = '/login');

// ---------- جستجو ---------- //
if (btnFilter) btnFilter.addEventListener('click', applyFilter);

// ---------- بارگذاری اولیه ---------- //
document.addEventListener('DOMContentLoaded', async () => {
  await renderCourses();      // اول courses
  await renderPrerequires();  // بعد prerequires
  handlePermissions();
});

function getCourseId(name) {
  const course = courses.find(c => c.name === name);
  return course ? course.id : "";
}
function getCourseName(id) {
  const course = courses.find(c => c.id === id);
  return course ? course.name : "";
}

function assignCoursesList() {
  pCourseOne.innerHTML = "";
  pCourseTwo.innerHTML = "";

  const o1 = document.createElement("option");
  o1.textContent = "یک مورد را انتخاب کنید";
  pCourseOne.appendChild(o1);

  const o2 = document.createElement("option");
  o2.textContent = "یک مورد را انتخاب کنید";
  pCourseTwo.appendChild(o2);


  courses.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.name;
    pCourseOne.appendChild(option);
  });

  courses.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.name;
    pCourseTwo.appendChild(option);
  });
}


function handlePermissions() {
  if (getUserRole() === "Admin") {
    addCourseBtn.style.display = "block";
    addPrerequire.style.display = "block";
    menuCourses.style.display = "block";
    menuProfessors.style.display = "block";
    menuStudents.style.display = "block";
    menuSettings.style.display = "block";

    document.querySelectorAll('.more-actions').forEach(box => box.style.opacity = '1');
    document.querySelectorAll('.more-actions-prerequires').forEach(box => box.style.opacity = '1');


  } else if (getUserRole() === "Professor") {
    addCourseBtn.style.display = "none";
    addPrerequire.style.display = "none";
    menuCourses.style.display = "block";
    menuProfessors.style.display = "none";
    menuStudents.style.display = "none";
    menuSettings.style.display = "none";

    document.querySelectorAll('.more-actions').forEach(box => box.style.opacity = '0');
    document.querySelectorAll('.more-actions-prerequires').forEach(box => box.style.opacity = '0');
  }
  else if (getUserRole() === "Student") {
     addCourseBtn.style.display = "none";
    addPrerequire.style.display = "none";
    menuCourses.style.display = "block";
    menuProfessors.style.display = "none";
    menuStudents.style.display = "none";
    menuSettings.style.display = "none";

    document.querySelectorAll('.more-actions').forEach(box => box.style.opacity = '0');
    document.querySelectorAll('.more-actions-prerequires').forEach(box => box.style.opacity = '0');
  }
}



// تابع ها باید گلوبال باشند برای onclick inline
window.openEdit = openEdit;
window.removeCourse = removeCourse;
window.removePrerequire = removePrerequire;
window.openEditPrerequire = openEditPrerequire;

