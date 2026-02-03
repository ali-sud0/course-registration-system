const BASE_URL = 'http://127.0.0.1:8000';

const navbarTitle = document.getElementById('navbarTitle');
const logoutBtn = document.getElementById('logoutBtn');
const coursesList = document.getElementById('coursesList');

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.style.backgroundColor = type === 'error' ? '#EF4444' : '#10B981';
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 3000);
}

function handleMenuPermissions() {
  const role = localStorage.getItem('accessToken') ? 
    JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).role : null;
  
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

async function fetchProfessorOfferings() {
  try {
    const resp = await fetch(BASE_URL + '/course-offerings/for-professor', {
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
      return [];
    }
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchOfferingStudents(offeringId) {
  try {
    const BASE_URL = 'http://127.0.0.1:8000';

    const logoutBtn = document.getElementById('logoutBtn');
    const coursesList = document.getElementById('coursesList');
    const alertBox = document.getElementById('professorAlert');
    const studentsModal = document.getElementById('studentsModal');
    const studentsModalTitle = document.getElementById('studentsModalTitle');
    const studentsModalList = document.getElementById('studentsModalList');

    function authHeaders() {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      };
    }

    function showAlert(msg) {
      if (!alertBox) return;
      alertBox.innerText = msg;
      alertBox.style.display = msg ? 'block' : 'none';
    }

    function showToast(msg, color = '#10B981') {
      const t = document.getElementById('toast');
      if (!t) return;
      t.innerText = msg;
      t.style.backgroundColor = color;
      t.style.display = 'block';
      setTimeout(() => t.style.display = 'none', 3000);
    }

    function getTokenPayload() {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    }

    function ensureProfessorOrRedirect() {
      const payload = getTokenPayload();
      if (!payload) {
        window.location.href = '/login';
        return false;
      }
      if (payload.role !== 'Professor') {
        showAlert('این صفحه مخصوص اساتید است. لطفاً با حساب استاد وارد شوید.');
        return false;
      }
      return true;
    }

    async function fetchProfessorOfferings() {
      try {
        const resp = await fetch(BASE_URL + '/course-offerings/for-professor', { headers: authHeaders() });
        if (resp.status === 401) {
          window.location.href = '/login';
          return [];
        }
        if (!resp.ok) {
          console.warn('fetchProfessorOfferings:', resp.status);
          showAlert('خطا در دریافت دروس - دسترسی رد شد');
          return [];
        }
        return await resp.json();
      } catch (err) {
        console.error(err);
        showAlert('خطای شبکه هنگام دریافت دروس');
        return [];
      }
    }

    async function fetchOfferingStudents(offeringId) {
      try {
        const resp = await fetch(`${BASE_URL}/course-offerings/${offeringId}/students`, { headers: authHeaders() });
        if (!resp.ok) return [];
        return await resp.json();
      } catch (err) {
        console.error(err);
        return [];
      }
    }

    async function removeStudent(enrollmentId) {
      if (!confirm('آیا از حذف این دانشجو مطمئن هستید؟')) return false;
      try {
        const resp = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/by-professor`, { method: 'DELETE', headers: authHeaders() });
        if (!resp.ok) {
          showToast('حذف انجام نشد', '#EF4444');
          return false;
        }
        showToast('دانشجو حذف شد');
        return true;
      } catch (err) {
        console.error(err);
        showToast('خطای شبکه', '#EF4444');
        return false;
      }
    }

    function buildCourseCard(offering, course) {
      const card = document.createElement('div');
      card.className = 'course-card';

      const header = document.createElement('div');
      header.className = 'course-header';

      const nameWrap = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'course-name';
      name.innerText = course?.name || 'نامشخص';
      const code = document.createElement('div');
      code.className = 'course-code';
      code.innerText = course?.course_code || '';
      nameWrap.appendChild(name);
      nameWrap.appendChild(code);

      const btns = document.createElement('div');
      const detailsBtn = document.createElement('button');
      detailsBtn.className = 'btn primary';
      detailsBtn.innerText = 'جزئیات';
      detailsBtn.onclick = () => openStudentsModal(offering.id, course?.name || 'درس');
      btns.appendChild(detailsBtn);

      header.appendChild(nameWrap);
      header.appendChild(btns);

      const info = document.createElement('div');
      info.className = 'course-info';
      info.innerHTML = `
        <div class="info-item"><span class="info-label">گروه</span><span class="info-value">${offering.group_number}</span></div>
        <div class="info-item"><span class="info-label">ظرفیت</span><span class="info-value">${offering.capacity}</span></div>
        <div class="info-item"><span class="info-label">کلاس</span><span class="info-value">${offering.classroom || 'نامشخص'}</span></div>
      `;

      card.appendChild(header);
      card.appendChild(info);
      return card;
    }

    async function openStudentsModal(offeringId, courseName) {
      studentsModalTitle.innerText = `دانشجویان — ${courseName}`;
      studentsModal.style.display = 'flex';
      studentsModalList.innerHTML = '<div style="text-align:center;padding:12px;color:#6b7280;">در حال بارگذاری...</div>';

      const students = await fetchOfferingStudents(offeringId);
      studentsModalList.innerHTML = '';
      if (!students || students.length === 0) {
        studentsModalList.innerHTML = '<div style="text-align:center;color:#6b7280;padding:12px;">هیچ دانشجویی ثبت‌نشده است</div>';
        return;
      }

      for (const enr of students) {
        const div = document.createElement('div');
        div.className = 'student-item';
        const name = document.createElement('div');
        name.className = 'student-name';
        name.innerText = `${enr.student.first_name} ${enr.student.last_name}`;
        const remove = document.createElement('button');
        remove.className = 'remove-btn';
        remove.innerText = 'حذف';
        remove.onclick = async () => {
          const ok = await removeStudent(enr.id);
          if (ok) {
            // refresh list
            openStudentsModal(offeringId, courseName);
          }
        };
        div.appendChild(name);
        div.appendChild(remove);
        studentsModalList.appendChild(div);
      }
    }

    document.getElementById('closeStudentsModal').addEventListener('click', () => {
      studentsModal.style.display = 'none';
    });

    async function renderProfessorCourses() {
      if (!ensureProfessorOrRedirect()) return;
      showAlert('');
      coursesList.innerHTML = '<div style="text-align:center;padding:12px;color:#6b7280;">در حال بارگذاری...</div>';

      const offerings = await fetchProfessorOfferings();
      // fetch course details for each offering
      const courseIds = [...new Set(offerings.map(o => o.course_id))];
      const coursesMap = {};
      if (courseIds.length) {
        try {
          const resp = await fetch(`${BASE_URL}/courses`, { headers: authHeaders() });
          if (resp.ok) {
            const all = await resp.json();
            all.forEach(c => { if (courseIds.includes(c.id)) coursesMap[c.id] = c; });
          }
        } catch (e) { console.error(e); }
      }

      coursesList.innerHTML = '';
      if (!offerings || offerings.length === 0) {
        coursesList.innerHTML = '<div class="empty-state"><p>هیچ درسی ارائه نشده است</p></div>';
        return;
      }

      offerings.forEach(off => {
        const card = buildCourseCard(off, coursesMap[off.course_id]);
        coursesList.appendChild(card);
      });
    }

    if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('accessToken'); window.location.href = '/login'; });

    document.addEventListener('DOMContentLoaded', async () => {
      // initialize only for professors
      if (!ensureProfessorOrRedirect()) return;
      await renderProfessorCourses();
    });

    window.removeStudent = removeStudent;
