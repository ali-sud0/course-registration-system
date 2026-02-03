const BASE_URL = 'http://127.0.0.1:8000';

// DOM refs
const offeringsContainer = document.getElementById('offeringsContainer');
const emptyStateOffering = document.getElementById('emptyStateOffering');
const openAddOfferingModalBtn = document.getElementById('openAddOfferingModal');

// offering modal
const addOfferingModal = document.getElementById('addOfferingModal');
const addOfferingForm = document.getElementById('addOfferingForm');
const oCourse = document.getElementById('o-course');
const oProfessor = document.getElementById('o-professor');
const oSemester = document.getElementById('o-semester');
const oSlots = document.getElementById('o-slots');
const oCapacity = document.getElementById('o-capacity');
const oClassroom = document.getElementById('o-classroom');
const oExamDate = document.getElementById('o-exam-date');
const closeOfferingModal = document.getElementById('closeOfferingModal');
const cancelOfferingModal = document.getElementById('cancelOfferingModal');

const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');

let offerings = [];
let courses = [];
let professors = [];
let semesters = [];
let scheduleSlots = [];

function showToast(status, title, desc) {
  if (!toast) return;
  toast.style.backgroundColor = status === 'success' ? '#10B981' : '#EF4444';
  toastTitle.innerText = title;
  toastDesc.innerText = desc;
  toast.style.display = 'flex';
  setTimeout(() => (toast.style.display = 'none'), 3000);
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + (localStorage.getItem('accessToken') || ''),
  };
}

function showError(msg) {
  const banner = document.getElementById('errorBanner');
  const text = document.getElementById('errorText');
  if (banner && text) {
    text.textContent = msg;
    banner.style.display = 'block';
  }
}

function hideError() {
  const banner = document.getElementById('errorBanner');
  if (banner) banner.style.display = 'none';
}

async function fetchOfferings() {
  try {
    console.debug('admin-offerings: fetching offerings...');
    const token = localStorage.getItem('accessToken');
    console.debug('admin-offerings: token present?', !!token);
    if (!token) {
      showError('توکن وارد نشده است. لطفا وارد شوید.');
      return;
    }
    const resp = await fetch(BASE_URL + '/course-offerings/', { headers: authHeaders() });
    console.debug('admin-offerings: response status', resp.status);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => resp.statusText);
      console.error('admin-offerings: fetch failed', resp.status, errText);
      showError('بارگذاری ناموفق بود: ' + resp.status);
      return;
    }
    offerings = await resp.json();
    console.debug('admin-offerings: received', offerings.length, 'offerings');
    hideError();
    renderOfferings();
  } catch (e) {
    console.error('admin-offerings: fetchOfferings error', e);
    showError('خطا در برقراری ارتباط: ' + e.message);
  }
}

async function fetchCourses() {
  try {
    const resp = await fetch(BASE_URL + '/courses/', { headers: authHeaders() });
    if (!resp.ok) throw new Error('Failed to fetch courses');
    courses = await resp.json();
    populateCourseSelect();
  } catch (e) {
    console.error('fetchCourses error:', e);
  }
}

async function fetchProfessors() {
  try {
    const resp = await fetch(BASE_URL + '/me/professors/', { headers: authHeaders() });
    if (!resp.ok) throw new Error('Failed to fetch professors');
    professors = await resp.json();
    populateProfessorSelect();
  } catch (e) {
    console.error('fetchProfessors error:', e);
  }
}

async function fetchSemesters() {
  try {
    const resp = await fetch(BASE_URL + '/semesters/', { headers: authHeaders() });
    if (!resp.ok) throw new Error('Failed to fetch semesters');
    semesters = await resp.json();
    populateSemesterSelect();
  } catch (e) {
    console.error('fetchSemesters error:', e);
  }
}

async function fetchScheduleSlots() {
  try {
    const resp = await fetch(BASE_URL + '/schedule-slots/', { headers: authHeaders() });
    if (!resp.ok) throw new Error('Failed to fetch schedule slots');
    scheduleSlots = await resp.json();
    populateSlotsSelect();
  } catch (e) {
    console.error('fetchScheduleSlots error:', e);
  }
}

function populateCourseSelect() {
  oCourse.innerHTML = '<option value="">یک درس را انتخاب کنید</option>';
  courses.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name + ' (' + c.course_code + ')';
    oCourse.appendChild(opt);
  });
}

function populateProfessorSelect() {
  oProfessor.innerHTML = '<option value="">یک استاد را انتخاب کنید</option>';
  professors.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.first_name + ' ' + p.last_name;
    oProfessor.appendChild(opt);
  });
}

function populateSemesterSelect() {
  oSemester.innerHTML = '<option value="">یک ترم را انتخاب کنید</option>';
  semesters.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    oSemester.appendChild(opt);
  });
}

function populateSlotsSelect() {
  oSlots.innerHTML = '';
  scheduleSlots.forEach(slot => {
    const opt = document.createElement('option');
    opt.value = slot.id;
    opt.textContent = slot.day + ' ' + slot.start_time + ' - ' + slot.end_time;
    oSlots.appendChild(opt);
  });
}

function renderOfferings() {
  if (!offeringsContainer) return;
  offeringsContainer.innerHTML = '';
  console.debug('admin-offerings: renderOfferings() called, offerings.length =', offerings.length);
  if (!offerings || offerings.length === 0) {
    emptyStateOffering.classList.add('show');
    return;
  }
  emptyStateOffering.classList.remove('show');

  // Build semester map for quick lookup
  const semesterMap = {};
  semesters.forEach(s => { semesterMap[s.id] = s.name; });

  offerings.forEach(o => {
    // Get semester name; fallback to '-' if not found
    const semesterName = semesterMap[o.semester_id] || o.semester_name || '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.course_name}</td>
      <td>${o.professor_name}</td>
      <td>${semesterName}</td>
      <td>${o.group_number}</td>
      <td>${o.capacity}</td>
      <td>${o.classroom}</td>
      <td>${o.exam_date || '-'}</td>
      <td><button class="btn-delete-offering" data-id="${o.id}">حذف</button></td>
    `;
    offeringsContainer.appendChild(tr);
  });
}

async function createOffering(payload) {
  try {
    const resp = await fetch(BASE_URL + '/course-offerings/', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: 'خطای نامعلوم' }));
      throw new Error(err.detail || 'خطا در ایجاد گروه درسی');
    }
    const created = await resp.json();
    offerings.push(created);
    renderOfferings();
    showToast('success', 'موفق', 'گروه درسی افزوده شد');
  } catch (e) {
    console.error('createOffering error:', e);
    showToast('failed', 'خطا', e.message || 'خطا در افزودن گروه درسی');
  }
}

async function deleteOffering(id) {
  if (!confirm('آیا از حذف این گروه درسی مطمئن هستید؟')) return;
  try {
    const resp = await fetch(BASE_URL + '/course-offerings/' + id, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!resp.ok) {
      showToast('failed', 'خطا', 'حذف انجام نشد');
      return;
    }
    offerings = offerings.filter(o => o.id !== id);
    renderOfferings();
    showToast('success', 'موفق', 'گروه درسی حذف شد');
  } catch (e) {
    console.error('deleteOffering error:', e);
    showToast('failed', 'خطا', 'خطا در حذف');
  }
}

function openOfferingModal() {
  if (addOfferingModal) addOfferingModal.style.display = 'block';
}

function closeOfferingModalDialog() {
  if (addOfferingModal) addOfferingModal.style.display = 'none';
  oCourse.value = '';
  oProfessor.value = '';
  oSemester.value = '';
  oSlots.value = '';
  oCapacity.value = '';
  oClassroom.value = '';
  oExamDate.value = '';
}

// Event listeners
if (openAddOfferingModalBtn) openAddOfferingModalBtn.addEventListener('click', openOfferingModal);
if (closeOfferingModal) closeOfferingModal.addEventListener('click', closeOfferingModalDialog);
if (cancelOfferingModal) cancelOfferingModal.addEventListener('click', closeOfferingModalDialog);

addOfferingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get selected slot IDs
  const selectedSlots = Array.from(oSlots.selectedOptions).map(opt => opt.value);
  
  // Validate slot count: 1-2 slots required
  if (selectedSlots.length === 0) {
    showToast('failed', 'خطا', 'حداقل یک زمان‌بندی را انتخاب کنید');
    return;
  }
  
  if (selectedSlots.length > 2) {
    showToast('failed', 'خطا', 'حداکثر دو زمان‌بندی را انتخاب کنید');
    return;
  }

  const payload = {
    course_id: oCourse.value,
    professor_id: oProfessor.value,
    semester_id: oSemester.value,
    slot_ids: selectedSlots,
    capacity: Number(oCapacity.value),
    classroom: oClassroom.value,
    exam_date: oExamDate.value,
  };

  try {
    await createOffering(payload);
    closeOfferingModalDialog();
  } catch (e) {
    console.error('Form submission error:', e);
  }
});

// Delete button handler
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete-offering')) {
    const id = e.target.getAttribute('data-id');
    deleteOffering(id);
  }
});

// Init
(async function init() {
  try {
    await Promise.all([
      fetchOfferings(),
      fetchCourses(),
      fetchProfessors(),
      fetchSemesters(),
      fetchScheduleSlots(),
    ]);
  } catch (e) {
    console.error('admin-offerings: init error', e);
    showToast('failed', 'خطا', 'خطا در بارگذاری صفحه');
  }
})();

// logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('accessToken'); window.location.href='/login'; });
