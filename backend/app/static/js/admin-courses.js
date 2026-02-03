const BASE_URL = 'http://127.0.0.1:8000';

// DOM refs
const coursesContainer = document.getElementById('coursesContainer');
const emptyStateCourse = document.getElementById('emptyStateCourse');
const openAddCourseModalBtn = document.getElementById('openAddCourseModal');

// course modal
const addCourseModal = document.getElementById('addCourseModal');
const addCourseForm = document.getElementById('addCourseForm');
const modalTitle = document.getElementById('modalTitle');
const cName = document.getElementById('c-name');
const cCode = document.getElementById('c-code');
const cUnits = document.getElementById('c-units');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');

// prereq modal
const addPrerequireModal = document.getElementById('addPrerequireModal');
const addPrerequireForm = document.getElementById('addPrerequireForm');
const pCourseOne = document.getElementById('p-course-one');
const pCourseTwo = document.getElementById('p-course-two');
const addPrerequireBtn = document.getElementById('addPrerequire');
const cancelModalPrerequire = document.getElementById('cancelModalPrerequire');

const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');

// course menu elements
const courseOptions = document.getElementById('courseOptions');
const courseEditMenu = document.getElementById('courseEditBtn');
const courseDeleteMenu = document.getElementById('courseDeleteBtn');

// prereq menu elements
const prerequireOptions = document.getElementById('prerequireOptions');
const prereqDeleteMenu = document.getElementById('prerequireDeleteBtn');

let courses = [];
let prereqs = [];
let editingCourseId = null;
let selectedCourseForMenu = null;
let selectedPrereqForMenu = null;

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

async function fetchCourses() {
  try {
    console.debug('admin-courses: fetching courses...');
    const token = localStorage.getItem('accessToken');
    console.debug('admin-courses: token present?', !!token);
    if (!token) {
      showError('توکن وارد نشده است. لطفا وارد شوید.');
      return;
    }
    const resp = await fetch(BASE_URL + '/courses/', { headers: authHeaders() });
    console.debug('admin-courses: /courses response status', resp.status);
    if (!resp.ok) {
      const errText = await resp.text().catch(()=>resp.statusText);
      console.error('admin-courses: fetch courses failed', resp.status, errText);
      showError('بارگذاری دروس ناموفق بود: ' + resp.status + ' ' + errText);
      showToast('failed','خطا','بارگذاری دروس انجام نشد');
      return;
    }
    courses = await resp.json();
    console.debug('admin-courses: received', courses.length, 'courses');
    hideError();
    renderCourses();
    populatePrereqSelects();
  } catch (e) {
    console.error('admin-courses: fetchCourses error', e);
    showError('خطا در برقراری ارتباط: ' + e.message);
    showToast('failed','خطا','خطا در برقراری ارتباط با سرور');
  }
}

function renderCourses() {
  if (!coursesContainer) return;
  coursesContainer.innerHTML = '';
  console.debug('admin-courses: renderCourses() called, courses.length =', courses.length);
  if (!courses || courses.length === 0) {
    emptyStateCourse.style.display = 'block';
    return;
  }
  emptyStateCourse.style.display = 'none';

    courses.forEach(c => {
      const tr = document.createElement('tr');
      tr.className = 'table-body';
      tr.innerHTML = `
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.course_code)}</td>
        <td>${c.units}</td>
        <td>
          <div class="more-actions" data-id="${c.id}" title="عملیات">
            <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2" cy="2" r="2" fill="#6B7280" />
              <circle cx="8" cy="2" r="2" fill="#6B7280" />
              <circle cx="14" cy="2" r="2" fill="#6B7280" />
            </svg>
          </div>
        </td>
      `;
    coursesContainer.appendChild(tr);
  });
}

function escapeHtml(s){ if (s==null) return ''; return String(s).replace(/[&<>"']/g, function(ch){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[ch]; }); }

async function createCourse(payload) {
  const resp = await fetch(BASE_URL + '/courses/', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw resp;
  const created = await resp.json();
  courses.push(created);
  renderCourses();
  populatePrereqSelects();
  showToast('success','موفق','درس افزوده شد');
}

async function updateCourse(id, payload) {
  const resp = await fetch(BASE_URL + '/courses/' + id, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw resp;
  const updated = await resp.json();
  const idx = courses.findIndex(x=>x.id===id);
  if (idx>-1) courses[idx]=updated;
  renderCourses();
  populatePrereqSelects();
  showToast('success','موفق','ویرایش انجام شد');
}

async function deleteCourse(id) {
  if (!confirm('آیا از حذف این درس مطمئن هستید؟')) return;
  const resp = await fetch(BASE_URL + '/courses/' + id, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!resp.ok) {
    showToast('failed','خطا','حذف انجام نشد');
    return;
  }
  courses = courses.filter(c=>c.id!==id);
  renderCourses();
  populatePrereqSelects();
  showToast('success','موفق','درس حذف شد');
}

// prerequisites
async function fetchPrereqs() {
  try {
    console.debug('admin-courses: fetching prerequisites...');
    const resp = await fetch(BASE_URL + '/prerequisites/', { headers: authHeaders() });
    if (!resp.ok) {
      const errText = await resp.text().catch(()=>resp.statusText);
      console.error('admin-courses: fetch prereqs failed', resp.status, errText);
      showToast('failed','خطا','بارگذاری پیش‌نیازها انجام نشد');
      return;
    }
    prereqs = await resp.json();
    renderPrereqs();
  } catch (e) { console.error(e); }
}

function renderPrereqs(){
  const container = document.getElementById('prerequiresContainer');
  const empty = document.getElementById('emptyStatePrerequire');
  if (!container) return;
  container.innerHTML='';
  if (!prereqs || prereqs.length===0){ 
    empty.classList.add('show'); 
    return; 
  }
  empty.classList.remove('show');

  prereqs.forEach(p=>{
    const main = courses.find(c=>c.id===p.course_id)?.name || p.course_id;
    const pre = courses.find(c=>c.id===p.prerequisite_course_id)?.name || p.prerequisite_course_id;
    const tr = document.createElement('tr');
    tr.className = 'table-body';
    tr.innerHTML = `
      <td>${escapeHtml(main)}</td>
      <td>${escapeHtml(pre)}</td>
      <td>
        <button class="more-actions-prerequires" data-id="${p.id}" style="position: relative;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="2" r="1.5" fill="#6B7280"/>
            <circle cx="8" cy="8" r="1.5" fill="#6B7280"/>
            <circle cx="8" cy="14" r="1.5" fill="#6B7280"/>
          </svg>
        </button>
      </td>
    `;
    container.appendChild(tr);
  });
}


async function createPrereq(payload){
  const resp = await fetch(BASE_URL + '/prerequisites/', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(()=>({detail:'خطا'}));
    throw err;
  }
  const created = await resp.json();
  prereqs.push(created);
  renderPrereqs();
  showToast('success','موفق','پیش نیاز افزوده شد');
}

async function deletePrereq(id){
  if (!confirm('آیا این پیش‌نیاز حذف شود؟')) return;
  const resp = await fetch(BASE_URL + '/prerequisites/' + id, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!resp.ok) { showToast('failed','خطا','حذف انجام نشد'); return; }
  prereqs = prereqs.filter(p=>p.id!==id);
  renderPrereqs();
  showToast('success','موفق','حذف شد');
}

function populatePrereqSelects(){
  if (!pCourseOne || !pCourseTwo) return;
  [pCourseOne,pCourseTwo].forEach(sel=>{
    sel.innerHTML = '<option value="">یک مورد را انتخاب کنید</option>';
    courses.forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.text = `${c.name} (${c.course_code})`;
      sel.appendChild(opt);
    });
  });
}

// modal helpers
function openCourseModal(edit=false, course=null){
  addCourseModal.style.display='flex';
  if (edit && course){
    modalTitle.innerText='ویرایش درس';
    cName.value = course.name;
    cCode.value = course.course_code;
    cUnits.value = course.units;
    editingCourseId = course.id;
  } else {
    modalTitle.innerText='افزودن درس جدید';
    cName.value=''; cCode.value=''; cUnits.value='';
    editingCourseId = null;
  }
}

function closeCourseModal(){ addCourseModal.style.display='none'; editingCourseId = null; }

function openPrereqModal(){ addPrerequireModal.style.display='flex'; }
function closePrereqModal(){ addPrerequireModal.style.display='none'; }

// event listeners
if (openAddCourseModalBtn) openAddCourseModalBtn.addEventListener('click', ()=> openCourseModal(false));
if (closeModal) closeModal.addEventListener('click', closeCourseModal);
if (cancelModal) cancelModal.addEventListener('click', closeCourseModal);

addCourseForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = { name: cName.value.trim(), course_code: cCode.value.trim(), units: Number(cUnits.value) };
  try{
    if (editingCourseId){ await updateCourse(editingCourseId, payload); }
    else { await createCourse(payload); }
    closeCourseModal();
  }catch(err){
    console.error(err);
    showToast('failed','خطا','عملیات موفق نبود');
  }
});

// delegate edit/delete buttons
// show three-dot menu for courses
coursesContainer.addEventListener('click', (e)=>{
  const more = e.target.closest('.more-actions');
  if (more){
    const id = more.getAttribute('data-id');
    selectedCourseForMenu = id;
    const rect = more.getBoundingClientRect();
    document.documentElement.style.setProperty('--x', rect.left + 'px');
    document.documentElement.style.setProperty('--y', (rect.bottom + 8) + 'px');
    if (courseOptions) courseOptions.style.display = 'flex';
    return;
  }
});

if (courseEditMenu) courseEditMenu.addEventListener('click', ()=>{
  if (!selectedCourseForMenu) return;
  const course = courses.find(c=>c.id===selectedCourseForMenu);
  if (course) openCourseModal(true, course);
  if (courseOptions) courseOptions.style.display='none';
});

if (courseDeleteMenu) courseDeleteMenu.addEventListener('click', ()=>{
  if (!selectedCourseForMenu) return;
  deleteCourse(selectedCourseForMenu);
  if (courseOptions) courseOptions.style.display='none';
});

// courses: hide menu when clicking outside
document.addEventListener('click', (e)=>{
  if (!e.target.closest('.course-menu-wrapper') && !e.target.closest('.more-actions')){
    if (courseOptions) courseOptions.style.display='none';
  }
});

// prereq events
if (addPrerequireBtn) addPrerequireBtn.addEventListener('click', ()=> openPrereqModal());
if (cancelModalPrerequire) cancelModalPrerequire.addEventListener('click', ()=> closePrereqModal());

addPrerequireForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = { course_id: pCourseOne.value, prerequisite_course_id: pCourseTwo.value };
  if (!payload.course_id || !payload.prerequisite_course_id){ showToast('failed','خطا','هر دو درس را انتخاب کنید'); return; }
  try{ await createPrereq(payload); closePrereqModal(); }catch(err){ console.error(err); showToast('failed','خطا', err.detail || 'خطا در افزودن'); }
});

// prereq delete button handler
document.addEventListener('click', (e)=>{
  if (e.target.classList.contains('more-actions-prerequires') || e.target.closest('.more-actions-prerequires')){
    const btn = e.target.closest('.more-actions-prerequires');
    const id = btn.getAttribute('data-id');
    deletePrereq(id);
  }
});
// logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('accessToken'); window.location.href='/login'; });
// init
(async function init(){
  try {
    await fetchCourses();
    await fetchPrereqs();
  } catch (e) {
    console.error('admin-courses: init error', e);
    showToast('failed','خطا','خطا در بارگذاری صفحه');
  }
})();
