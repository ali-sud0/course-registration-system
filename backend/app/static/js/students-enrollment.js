const BASE_URL = 'http://127.0.0.1:8000';

const enrollmentsContainer = document.getElementById('enrollmentsContainer');
const emptyStateEnrollment = document.getElementById('emptyStateEnrollment');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorBanner = document.getElementById('errorBanner');
const errorText = document.getElementById('errorText');
const prerequisitesAlert = document.getElementById('prerequisitesAlert');
const prerequisitesText = document.getElementById('prerequisitesText');

const confirmationModal = document.getElementById('confirmationModal');
const confirmationText = document.getElementById('confirmationText');
const confirmEnroll = document.getElementById('confirmEnroll');
const cancelConfirm = document.getElementById('cancelConfirm');

// Modal detail elements
const modalCourseName = document.getElementById('modalCourseName');
const modalProfessor = document.getElementById('modalProfessor');
const modalGroup = document.getElementById('modalGroup');
const modalCapacity = document.getElementById('modalCapacity');
const modalSchedule = document.getElementById('modalSchedule');
const modalNotes = document.getElementById('modalNotes');

const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');

let offerings = [];
let enrollments = [];
let prerequisites = [];
let courseMap = {};
let selectedOfferingId = null;
let scheduleSlotMap = {};

function authHeaders(){
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + (localStorage.getItem('accessToken') || ''),
  };
}

function showError(msg){ if (errorBanner && errorText){ errorText.textContent = msg; errorBanner.style.display='block'; } }
function hideError(){ if (errorBanner) errorBanner.style.display='none'; }

function showToast(type, title, desc){
  if (!toast) return;
  toast.style.backgroundColor = type === 'success' ? '#10B981' : '#EF4444';
  toastTitle.innerText = title;
  toastDesc.innerText = desc;
  toast.style.display = 'flex';
  setTimeout(() => (toast.style.display = 'none'), 3000);
}

async function fetchOfferings(){
  try{
    if (loadingIndicator) loadingIndicator.style.display='block';
    const token = localStorage.getItem('accessToken');
    if (!token){ showError('توکن وارد نشده است. لطفا وارد شوید.'); return; }
    const resp = await fetch(BASE_URL + '/course-offerings/', { headers: authHeaders() });
    if (!resp.ok){ showError('بارگذاری دروس ناموفق'); return; }
    offerings = await resp.json();
    hideError();
  }catch(e){ showError('خطا: '+e.message); }
  finally{ if (loadingIndicator) loadingIndicator.style.display='none'; }
}

async function fetchEnrollments(){
  try{
    const resp = await fetch(BASE_URL + '/enrollments/me', { headers: authHeaders() });
    if (!resp.ok) return;
    enrollments = await resp.json();
  }catch(e){ console.error('enrollment fetch error', e); }
}

async function fetchCourses(){
  try{
    const resp = await fetch(BASE_URL + '/courses/', { headers: authHeaders() });
    if (!resp.ok) return;
    const courses = await resp.json();
    courses.forEach(c => { courseMap[c.id] = c.name; });
  }catch(e){ console.error('course fetch error', e); }
}

async function fetchPrerequisites(){
  try{
    const resp = await fetch(BASE_URL + '/prerequisites/', { headers: authHeaders() });
    if (!resp.ok) return;
    prerequisites = await resp.json();
  }catch(e){ console.error('prereq fetch error', e); }
}

async function fetchScheduleSlots(){
  try{
    const resp = await fetch(BASE_URL + '/schedule-slots', { headers: authHeaders() });
    if (!resp.ok) return;
    const slots = await resp.json();
    // build id -> human-readable mapping
    slots.forEach(s => {
      scheduleSlotMap[s.id] = `${s.day_of_week} ${s.start_time}-${s.end_time}`;
    });
  }catch(e){ console.error('schedule slots fetch error', e); }
}

function calculateRemainingCapacity(offeringId){
  const enrolledCount = enrollments.filter(e => e.course_offering_id === offeringId).length;
  const offering = offerings.find(o => o.id === offeringId);
  return offering ? (offering.capacity || 0) - enrolledCount : 0;
}

function getPrerequisitesForCourse(courseId){
  return prerequisites.filter(p => p.course_id === courseId);
}

function renderOfferings(){
  if (!enrollmentsContainer) return;
  enrollmentsContainer.innerHTML = '';
  if (!offerings || offerings.length===0){ 
    if (emptyStateEnrollment) emptyStateEnrollment.style.display='block'; 
    return; 
  }
  if (emptyStateEnrollment) emptyStateEnrollment.style.display='none';

  offerings.forEach(o=>{
    const remaining = calculateRemainingCapacity(o.id);
    const isAlreadyEnrolled = enrollments.some(e => e.course_offering_id === o.id);
    const tr = document.createElement('tr');
    tr.className = 'table-body';
    tr.innerHTML = `
      <td>${escapeHtml(o.course_name || '-')}</td>
      <td>${escapeHtml(o.professor_name || '-')}</td>
      <td>${o.group_number || '-'}</td>
      <td>${remaining}</td>
      <td>
        <button class="btn primary take-btn" data-id="${o.id}" ${isAlreadyEnrolled ? 'disabled' : ''}>
          ${isAlreadyEnrolled ? 'ثبت‌شده' : 'اخذ'}
        </button>
      </td>
    `;
    enrollmentsContainer.appendChild(tr);
  });

  document.querySelectorAll('.take-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!e.target.disabled) {
        handleTakeClick(e.target.getAttribute('data-id'));
      }
    });
  });
}

function handleTakeClick(offeringId){
  selectedOfferingId = offeringId;
  const offering = offerings.find(o => o.id === offeringId);
  if (!offering) return;
  
  const remaining = calculateRemainingCapacity(offeringId);
  if (remaining <= 0){
    showToast('error', 'خطا', 'ظرفیت این درس تمام شده است');
    return;
  }

  // Populate modal fields with offering metadata
  if (modalCourseName) modalCourseName.innerText = offering.course_name || '-';
  if (modalProfessor) modalProfessor.innerText = offering.professor_name || '-';
  if (modalGroup) modalGroup.innerText = offering.group_number ?? '-';
  if (modalCapacity) modalCapacity.innerText = offering.capacity ?? '-';
  // show human-readable schedule summary (map slot ids to day/time)
  if (modalSchedule) {
    if (offering.slot_ids && offering.slot_ids.length>0){
      const parts = offering.slot_ids.map(id => scheduleSlotMap[id] || id);
      modalSchedule.innerText = parts.join('، ');
    } else {
      modalSchedule.innerText = '-';
    }
  }
  if (modalNotes) modalNotes.innerText = offering.classroom ? `کلاس: ${offering.classroom}` : '-';

  confirmationText.innerText = `آیا مطمئن هستید که می‌خواهید "${escapeHtml(offering.course_name)}" را انتخاب کنید؟`;
  confirmationModal.style.display = 'flex';
}

async function enrollCourse(){
  if (!selectedOfferingId) return;
  try{
    // The backend expects `offering_id` as a query parameter named `offering_id`.
    const url = BASE_URL + '/enrollments/?offering_id=' + encodeURIComponent(selectedOfferingId);
    const resp = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!resp.ok){ 
      const err = await resp.json().catch(()=>({detail:'خطا'}));
      const rawDetail = err && err.detail ? err.detail : (err || 'خطا');
      const friendly = translateErrorDetail(rawDetail);
      showToast('error', 'خطا', friendly);
      return; 
    }
    showToast('success', 'موفق', 'درس با موفقیت انتخاب شد');
    confirmationModal.style.display = 'none';
    await fetchEnrollments();
    renderOfferings();
    showPrerequisiteAlert(selectedOfferingId);
  }catch(e){ showToast('error', 'خطا', 'خطا در برقراری ارتباط: ' + (e && e.message ? e.message : '')); }
}

function translateErrorDetail(detail){
  // detail may be a string or an array/object from backend
  const toStr = (d)=> typeof d === 'string' ? d : (Array.isArray(d) ? d.map(x=> x.msg || JSON.stringify(x)).join('، ') : JSON.stringify(d));
  const s = toStr(detail);
  if (!s) return 'ثبت‌نام ناموفق';

  if (s.includes('Course offering not found')) return 'گروه درسی یافت نشد';
  if (s.includes('Semester not found')) return 'ترم یافت نشد';
  if (s.includes('Course capacity is full')) return 'ظرفیت این درس پر شده است';
  if (s.includes('Already enrolled in this course')) return 'شما قبلاً این درس را اخذ کرده‌اید';
  if (s.includes('Prerequisite course not passed')) return 'پیش‌نیاز این درس گذرانده نشده است';
  if (s.includes('Schedule time conflict detected')) return 'تداخل زمانی با سایر دروس وجود دارد';
  if (s.includes('Maximum unit limit exceeded')){
    // extract numbers if present
    const m = s.match(/max:\s*(\d+)[^\d]*(\d+)/);
    return 'حداکثر واحد مجاز رعایت نشده';
  }
  if (s.includes('Cannot drop') || s.includes('Can only drop') || s.includes('Can only remove')) return 'عملیات مجاز نیست برای ترم جاری';
  if (s.includes('Enrollment not found')) return 'ثبت‌نام یافت نشد';
  if (s.includes('Course not found')) return 'درس یافت نشد';
  if (s.includes('Professor not found')) return 'استاد یافت نشد';

  // fallback: if backend returns an English sentence, show a generic Persian message
  if (/[A-Za-z]/.test(s)) return 'خطا: ' + s;
  return s;
}

function showPrerequisiteAlert(offeringId){
  const offering = offerings.find(o => o.id === offeringId);
  if (!offering) return;
  const prereqs = getPrerequisitesForCourse(offering.course_id);
  if (prereqs.length > 0){
    const prereqNames = prereqs.map(p => courseMap[p.prerequisite_course_id] || p.prerequisite_course_id).join('، ');
    prerequisitesText.innerText = `این درس پیش‌نیازهایی دارد: ${prereqNames}`;
    prerequisitesAlert.style.display = 'block';
  } else {
    prerequisitesAlert.style.display = 'none';
  }
}

function escapeHtml(s){ if (s==null) return ''; return String(s).replace(/[&<>"]+/g, function(ch){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[ch]; }); }

confirmEnroll.addEventListener('click', enrollCourse);
cancelConfirm.addEventListener('click', () => { confirmationModal.style.display = 'none'; selectedOfferingId = null; });

// logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('accessToken'); window.location.href='/login'; });

(async function init(){
  await fetchCourses();
  await fetchPrerequisites();
  await fetchScheduleSlots();
  await fetchOfferings();
  await fetchEnrollments();
  renderOfferings();
})();
