const BASE_URL = 'http://127.0.0.1:8000';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  };
}

function getTokenPayload() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])); } catch(e){return null}
}

function ensureProfessor() {
  const p = getTokenPayload();
  if (!p) { window.location.href = '/login'; return false; }
  if (p.role !== 'Professor') {
    document.getElementById('professorAlert')?.remove();
    alert('این بخش فقط برای اساتید است');
    return false;
  }
  return true;
}

async function fetchProfessorOfferings() {
  try {
    const resp = await fetch(`${BASE_URL}/course-offerings/for-professor`, { headers: authHeaders() });
    if (resp.status === 401) { window.location.href = '/login'; return []; }
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) { console.error(e); return []; }
}

async function fetchCoursesMap() {
  try {
    const resp = await fetch(`${BASE_URL}/courses`, { headers: authHeaders() });
    if (!resp.ok) return {};
    const all = await resp.json();
    const map = {};
    all.forEach(c => map[c.id] = c);
    return map;
  } catch (e) { console.error(e); return {}; }
}

async function fetchOfferingStudents(offeringId) {
  try {
    const resp = await fetch(`${BASE_URL}/course-offerings/${offeringId}/students`, { headers: authHeaders() });
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) { console.error(e); return []; }
}

async function removeEnrollment(enrollmentId) {
  try {
    const resp = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/by-professor`, { method: 'DELETE', headers: authHeaders() });
    return resp.ok;
  } catch (e) { console.error(e); return false; }
}

function showToast(msg, err=false){
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerText = msg; t.style.backgroundColor = err ? '#ef4444' : '#10B981'; t.style.display='block';
  setTimeout(()=> t.style.display='none', 3000);
}

function buildRow(offering, course){
  const tr = document.createElement('tr');
  tr.className = 'table-body';
  tr.innerHTML = `
    <td>${course?.name || 'نامشخص'}</td>
    <td>${course?.course_code || ''}</td>
    <td>${course?.units || 0}</td>
    <td>${offering.group_number}</td>
    <td>${offering.capacity || '—'}</td>
    <td>${offering.classroom || '—'}</td>
    <td><button class="btn primary" data-offering="${offering.id}">جزئیات</button></td>
  `;
  return tr;
}

async function openStudentsModal(offeringId, courseName){
  const modal = document.getElementById('studentsModal');
  const title = document.getElementById('studentsModalTitle');
  const list = document.getElementById('studentsModalList');
  const emptyState = document.getElementById('emptyStateStudents');
  title.innerText = `دانشجویان — ${courseName}`;
  modal.style.display = 'flex';
  list.innerHTML = '';
  emptyState.style.display = 'none';

  const students = await fetchOfferingStudents(offeringId);
  
  if (!students || students.length === 0) { 
    emptyState.style.display = 'block'; 
    return; 
  }

  students.forEach((enr, idx) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #e5e7eb';
    
    // Handle different response structures: enr could have student obj or student fields
    let studentName = 'نام نامشخص';
    let studentNumber = '—';
    if (enr.student) {
      studentName = `${enr.student.first_name || ''} ${enr.student.last_name || ''}`.trim();
      studentNumber = enr.student.user_number || '—';
    }
    
    tr.innerHTML = `
      <td style="padding: 12px; text-align: right; color: #111827; font-size: 14px;">${studentName}</td>
      <td style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-family: monospace;">${studentNumber}</td>
      <td style="padding: 12px; text-align: center;"><button class="btn primary" style="padding: 6px 14px; font-size: 12px;">حذف</button></td>
    `;
    
    const btn = tr.querySelector('button');
    btn.onclick = async () => {
      if (!confirm('آیا از حذف این دانشجو مطمئن هستید؟')) return;
      const ok = await removeEnrollment(enr.id);
      if (ok) { showToast('دانشجو حذف شد'); openStudentsModal(offeringId, courseName); }
      else showToast('حذف انجام نشد', true);
    };
    
    list.appendChild(tr);
  });
}

document.getElementById('closeStudentsModal').addEventListener('click', () => {
  document.getElementById('studentsModal').style.display='none';
});

async function renderDashboard(){
  if (!ensureProfessor()) return;
  const offerings = await fetchProfessorOfferings();
  const coursesMap = await fetchCoursesMap();
  const container = document.getElementById('coursesContainer');
  container.innerHTML = '';
  if (!offerings || offerings.length===0) { document.getElementById('emptyStateCourse').style.display='flex'; return; }
  document.getElementById('emptyStateCourse').style.display='none';
  offerings.forEach(off => {
    const course = coursesMap[off.course_id];
    const row = buildRow(off, course);
    const btn = row.querySelector('button[data-offering]');
    btn.addEventListener('click', () => openStudentsModal(off.id, course?.name || 'درس'));
    container.appendChild(row);
  });
}

function ensureProfessor(){
  const p = getTokenPayload();
  if (!p) { window.location.href='/login'; return false; }
  if (p.role!=='Professor') { alert('این صفحه مخصوص اساتید است'); return false; }
  return true;
}

function getTokenPayload(){
  const t = localStorage.getItem('accessToken'); if (!t) return null; try { return JSON.parse(atob(t.split('.')[1])); } catch(e){return null}
}

document.addEventListener('DOMContentLoaded', () => {
  if (!ensureProfessor()) return;
  renderDashboard();
  const logoutBtn = document.getElementById('logoutBtn'); if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('accessToken'); window.location.href='/login'; });
});
