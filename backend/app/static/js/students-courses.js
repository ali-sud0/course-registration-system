const BASE_URL = 'http://127.0.0.1:8000';

const coursesContainer = document.getElementById('coursesContainer');
const emptyStateCourse = document.getElementById('emptyStateCourse');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorBanner = document.getElementById('errorBanner');
const errorText = document.getElementById('errorText');

const prereqContainer = document.getElementById('prerequiresContainer');
const emptyStatePrerequire = document.getElementById('emptyStatePrerequire');

let courseMap = {}; // Map course IDs to names

function authHeaders(){
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + (localStorage.getItem('accessToken') || ''),
  };
}

function showError(msg){ if (errorBanner && errorText){ errorText.textContent = msg; errorBanner.style.display='block'; } }
function hideError(){ if (errorBanner) errorBanner.style.display='none'; }

async function fetchCourses(){
  try{
    if (loadingIndicator) loadingIndicator.style.display='block';
    const token = localStorage.getItem('accessToken');
    if (!token){ showError('توکن وارد نشده است. لطفا وارد شوید.'); return; }
    const resp = await fetch(BASE_URL + '/courses/', { headers: authHeaders() });
    if (!resp.ok){ const t = await resp.text().catch(()=>resp.statusText); showError('بارگذاری دروس ناموفق: '+resp.status+' '+t); return; }
    const courses = await resp.json();
    hideError(); renderCourses(courses);
  }catch(e){ showError('خطا در برقراری ارتباط: '+e.message); }
  finally{ if (loadingIndicator) loadingIndicator.style.display='none'; }
}

function renderCourses(courses){
  if (!coursesContainer) return;
  coursesContainer.innerHTML = '';
  if (!courses || courses.length===0){ if (emptyStateCourse) emptyStateCourse.style.display='block'; return; }
  if (emptyStateCourse) emptyStateCourse.style.display='none';

  // Build course ID -> name map for prereq rendering
  courses.forEach(c => {
    courseMap[c.id] = c.name;
  });

  courses.forEach(c=>{
    const tr = document.createElement('tr');
    tr.className = 'table-body';
    tr.innerHTML = `
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.course_code)}</td>
      <td>${c.units}</td>
      <td></td>
    `;
    coursesContainer.appendChild(tr);
  });
}

function escapeHtml(s){ if (s==null) return ''; return String(s).replace(/[&<>"]+/g, function(ch){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[ch]; }); }

async function fetchPrereqs(){
  try{
    const resp = await fetch(BASE_URL + '/prerequisites/', { headers: authHeaders() });
    if (!resp.ok) return; // silently ignore if not accessible
    const prereqs = await resp.json();
    renderPrereqs(prereqs);
  }catch(e){ console.error('prereq fetch error', e); }
}

function renderPrereqs(prereqs){
  if (!prereqContainer) return;
  prereqContainer.innerHTML = '';
  if (!prereqs || prereqs.length===0){ if (emptyStatePrerequire) emptyStatePrerequire.classList.add('show'); return; }
  emptyStatePrerequire.classList.remove('show');
  prereqs.forEach(p=>{
    const mainCourseName = courseMap[p.course_id] || p.course_id;
    const prereqCourseName = courseMap[p.prerequisite_course_id] || p.prerequisite_course_id;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(mainCourseName)}</td>
      <td>${escapeHtml(prereqCourseName)}</td>
      <td></td>
    `;
    prereqContainer.appendChild(tr);
  });
}

// logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('accessToken'); window.location.href='/login'; });

(async function init(){
  await fetchCourses();
  await fetchPrereqs();
})();
