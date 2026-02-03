const BASE_URL = 'http://127.0.0.1:8000';

const enrollList = document.getElementById('enrollList');
const navbarTitle = document.getElementById('navbarTitle');
const logoutBtn = document.getElementById('logoutBtn');

function getUserRole() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload)).role;
}

function handleMenuPermissions() {
  const role = getUserRole();
  const menuCourses = document.getElementById('menuCourses');
  const menuEnroll = document.getElementById('menuEnroll');
  const menuSchedule = document.getElementById('menuSchedule');
  const menuProfessors = document.getElementById('menuProfessors');
  const menuStudents = document.getElementById('menuStudents');
  const menuSettings = document.getElementById('menuSettings');
  const menuProfCourses = document.getElementById('menuProfCourses');

  // Hide all menus first
  if (menuCourses) menuCourses.style.display = 'none';
  if (menuEnroll) menuEnroll.style.display = 'none';
  if (menuSchedule) menuSchedule.style.display = 'none';
  if (menuProfessors) menuProfessors.style.display = 'none';
  if (menuStudents) menuStudents.style.display = 'none';
  if (menuSettings) menuSettings.style.display = 'none';
  if (menuProfCourses) menuProfCourses.style.display = 'none';

  // Show only appropriate menus
  if (role === 'Student') {
    if (menuCourses) menuCourses.style.display = 'block';
    if (menuEnroll) menuEnroll.style.display = 'block';
    if (menuSchedule) menuSchedule.style.display = 'block';
    if (menuSettings) menuSettings.style.display = 'block';
  } else if (role === 'Professor') {
    if (menuCourses) menuCourses.style.display = 'block';
    if (menuSettings) menuSettings.style.display = 'block';
    if (menuProfCourses) menuProfCourses.style.display = 'block';
  } else if (role === 'Admin') {
    if (menuCourses) menuCourses.style.display = 'block';
    if (menuProfessors) menuProfessors.style.display = 'block';
    if (menuStudents) menuStudents.style.display = 'block';
    if (menuSettings) menuSettings.style.display = 'block';
  }
}

function showToast(msg, type='info'){
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(()=> toast.style.display = 'none', 3000);
}

async function fetchOfferings() {
  try {
    const resp = await fetch(BASE_URL + '/course-offerings/for-current-term', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    });
    if (!resp.ok) {
      if (resp.status === 401) {
        alert('لطفاً ابتدا وارد شوید');
        window.location.href = '/login';
      }
      console.warn('failed to fetch offerings');
      return [];
    }
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderOfferings(list) {
  enrollList.innerHTML = '';
  if (!list.length) {
    enrollList.innerHTML = '<div class="empty-state"><p>هیچ گروهی برای ترم جاری وجود ندارد.</p></div>';
    return;
  }

  list.forEach(off => {
    const card = document.createElement('div');
    card.className = 'enroll-card';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const course = window.coursesMap ? window.coursesMap[off.course_id] : null;
    meta.innerHTML = `
      <div>
        <div class="course-name">${off.course_name || (course ? course.name : 'نامشخص')}</div>
        <div class="course-code">${course ? course.course_code : ''}</div>
      </div>
      <div>
        <div>گروه: ${off.group_number}</div>
        <div>ظرفیت: ${off.capacity || 'نامشخص'}</div>
      </div>
      <div>
        <div>استاد: ${off.professor_name || 'نامشخص'}</div>
      </div>
    `;

    const actions = document.createElement('div');
    const enrollBtn = document.createElement('button');
    enrollBtn.className = 'btn primary';
    enrollBtn.innerText = 'ثبت';
    enrollBtn.onclick = () => enroll(off.id, enrollBtn);

    actions.appendChild(enrollBtn);

    card.appendChild(meta);
    card.appendChild(actions);
    enrollList.appendChild(card);
  });
}

async function enroll(offeringId, btn) {
  if (!confirm('آیا مایل به ثبت این درس هستید؟')) return;
  btn.disabled = true;
  try {
    const resp = await fetch(BASE_URL + '/enrollments?offering_id=' + offeringId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    });
    if (!resp.ok) {
      const txt = await resp.text();
      showToast('خطا در ثبت: ' + txt, 'error');
      btn.disabled = false;
      return;
    }
    showToast('ثبت با موفقیت انجام شد', 'success');
    // Optionally refresh list or update UI
    const list = await fetchOfferings();
    renderOfferings(list);
  } catch (err) {
    console.error(err);
    showToast('خطا در ارتباط با سرور', 'error');
    btn.disabled = false;
  }
}

if (logoutBtn) logoutBtn.addEventListener('click', ()=> window.location.href = '/login');

document.addEventListener('DOMContentLoaded', async ()=>{
  if (getUserRole() === 'Admin') navbarTitle.innerText = 'سلام ادمین';
  else if (getUserRole() === 'Professor') navbarTitle.innerText = 'سلام استاد';
  else if (getUserRole() === 'Student') navbarTitle.innerText = 'سلام دانشجو عزیز';

  handleMenuPermissions();

  // Fetch courses for mapping codes
  let coursesMap = null;
  try {
    const resp = await fetch(BASE_URL + '/courses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    });
    if (resp.ok) {
      const courses = await resp.json();
      coursesMap = {};
      courses.forEach(c => coursesMap[c.id] = c);
    }
  } catch (err) {
    console.error('خطا در دریافت دروس:', err);
  }

  window.coursesMap = coursesMap; // expose to render function
  const list = await fetchOfferings();
  renderOfferings(list);
});
