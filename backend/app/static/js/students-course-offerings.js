const BASE_URL = 'http://127.0.0.1:8000';

const offeringsContainer = document.getElementById('offeringsContainer');
const emptyStateOffering = document.getElementById('emptyStateOffering');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorBanner = document.getElementById('errorBanner');
const errorText = document.getElementById('errorText');

function authHeaders(){
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + (localStorage.getItem('accessToken') || ''),
  };
}

function showError(msg){ if (errorBanner && errorText){ errorText.textContent = msg; errorBanner.style.display='block'; } }
function hideError(){ if (errorBanner) errorBanner.style.display='none'; }

async function fetchOfferings(){
  try{
    if (loadingIndicator) loadingIndicator.style.display='block';
    const token = localStorage.getItem('accessToken');
    if (!token){ showError('توکن وارد نشده است. لطفا وارد شوید.'); return; }
    const resp = await fetch(BASE_URL + '/course-offerings/for-current-term', { headers: authHeaders() });
    if (!resp.ok){ const t = await resp.text().catch(()=>resp.statusText); showError('بارگذاری گروه‌های درسی ناموفق: '+resp.status+' '+t); return; }
    const offerings = await resp.json();
    hideError(); renderOfferings(offerings);
  }catch(e){ showError('خطا در برقراری ارتباط: '+e.message); }
  finally{ if (loadingIndicator) loadingIndicator.style.display='none'; }
}

function renderOfferings(offerings){
  if (!offeringsContainer) return;
  offeringsContainer.innerHTML = '';
  if (!offerings || offerings.length===0){ if (emptyStateOffering) emptyStateOffering.style.display='block'; return; }
  if (emptyStateOffering) emptyStateOffering.style.display='none';

  offerings.forEach(o=>{
    const tr = document.createElement('tr');
    tr.className = 'table-body';
    const examDate = o.exam_date ? new Date(o.exam_date).toLocaleDateString('fa-IR') : '-';
    tr.innerHTML = `
      <td>${escapeHtml(o.course_name || '-')}</td>
      <td>${escapeHtml(o.professor_name || '-')}</td>
      <td>${escapeHtml(o.semester_name || '-')}</td>
      <td>${o.group_number || '-'}</td>
      <td>${o.capacity || '-'}</td>
      <td>${escapeHtml(o.classroom || '-')}</td>
      <td>${examDate}</td>
    `;
    offeringsContainer.appendChild(tr);
  });
}

function escapeHtml(s){ if (s==null) return ''; return String(s).replace(/[&<>"]+/g, function(ch){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[ch]; }); }

// logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('accessToken'); window.location.href='/login'; });

(async function init(){
  await fetchOfferings();
})();
