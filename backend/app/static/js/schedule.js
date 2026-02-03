const BASE_URL = 'http://127.0.0.1:8000';

const navbarTitle = document.getElementById('navbarTitle');
const logoutBtn = document.getElementById('logoutBtn');
const scheduleBody = document.getElementById('scheduleBody');
const enrolledList = document.getElementById('enrolledList');

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

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.style.backgroundColor = type === 'error' ? '#EF4444' : '#10B981';
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 3000);
}

async function fetchMySchedule() {
  try {
    const resp = await fetch(BASE_URL + '/enrollments/me/schedule', {
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
    const data = await resp.json();
    console.log('Schedule data:', data);
    return data;
  } catch (err) {
    console.error('Error fetching schedule:', err);
    return [];
  }
}

async function fetchMyEnrollments() {
  try {
    const resp = await fetch(BASE_URL + '/enrollments/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    });
    if (!resp.ok) return [];
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderScheduleTable(scheduleItems) {
  if (!scheduleItems || scheduleItems.length === 0) {
    scheduleBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#6b7280;">برنامه‌ای موجود نیست</td></tr>';
    return;
  }

  // Define time slots (in 24-hour format)
  const timeSlots = [
    { start: '08:00:00', label: '۸-۱۰' },
    { start: '10:00:00', label: '۱۰-۱۲' },
    { start: '14:00:00', label: '۱۴-۱۶' },
    { start: '16:00:00', label: '۱۶-۱۸' }
  ];

  // Map day strings to indices: sat=0, sun=1, mon=2, tue=3, wed=4
  const dayMap = { 'sat': 0, 'sun': 1, 'mon': 2, 'tue': 3, 'wed': 4 };
  const daysLabel = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];

  // Build a 2D map: schedule[timeLabel][dayIndex] = scheduleItem
  const schedule = {};
  scheduleItems.forEach(item => {
    // Normalize start_time format to "HH:MM:SS"
    let startTimeStr = item.start_time;
    if (typeof startTimeStr === 'string') {
      // Ensure format is "HH:MM:SS"
      if (startTimeStr.length === 5) {
        startTimeStr += ':00'; // "08:00" -> "08:00:00"
      }
    }
    
    // Convert day_of_week string to index
    const dayIndex = dayMap[item.day_of_week] !== undefined ? dayMap[item.day_of_week] : -1;
    
    if (dayIndex >= 0) {
      const key = `${startTimeStr}_${dayIndex}`;
      schedule[key] = item;
      console.log(`Mapped course: ${item.course_name} (day=${item.day_of_week}/${dayIndex}, time=${startTimeStr})`);
    } else {
      console.warn(`Unknown day_of_week: ${item.day_of_week}`);
    }
  });

  // Render table rows
  timeSlots.forEach((slot, idx) => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #e5e7eb';

    // Time label cell
    const timeCell = document.createElement('td');
    timeCell.style.cssText = 'padding: 12px; text-align: right; font-weight: 600; color: #374151; background: #f9fafb; border-right: 2px solid #e5e7eb; width: 80px;';
    timeCell.innerText = slot.label;
    row.appendChild(timeCell);

    // Day cells (only 5 weekdays: Saturday to Wednesday)
    for (let day = 0; day < 5; day++) {
      const cell = document.createElement('td');
      cell.style.cssText = 'padding: 8px; text-align: center; min-height: 80px; vertical-align: middle; border-right: 1px solid #e5e7eb;';
      
      const key = `${slot.start}_${day}`;
      const item = schedule[key];
      
      if (item) {
        const courseBlock = document.createElement('div');
        courseBlock.style.cssText = 'background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; line-height: 1.4; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);';
        courseBlock.innerHTML = `<div>${item.course_name}</div><div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">${item.classroom || 'کلاس نامشخص'}</div>`;
        cell.appendChild(courseBlock);
      }
      
      row.appendChild(cell);
    }
    
    scheduleBody.appendChild(row);
  });
}


function renderEnrolledList(enrollments, courseMap = {}) {
  if (!enrollments || enrollments.length === 0) {
    enrolledList.innerHTML = '<div class="empty-enrolled-state"><h3>هیچ دروسی ثبت نشده است</h3><p>برای ثبت درس به بخش انتخاب واحد بروید</p></div>';
    return;
  }

  enrolledList.innerHTML = '';
  enrollments.forEach(enr => {
    const offering = courseMap[enr.offering_id] || {};
    const item = document.createElement('div');
    item.className = 'enrolled-item';
    
    // Format time if available
    const timeDisplay = offering.start_time && offering.end_time 
      ? `${offering.start_time} - ${offering.end_time}` 
      : 'زمان نامشخص';
    
    // Format day of week
    const dayMap = { 'sat': 'شنبه', 'sun': 'یکشنبه', 'mon': 'دوشنبه', 'tue': 'سه‌شنبه', 'wed': 'چهارشنبه' };
    const dayDisplay = dayMap[offering.day_of_week] || 'روز نامشخص';
    
    item.innerHTML = `
      <div class="info">
        <div class="name">${offering.course_name || 'درس نامشخص'}</div>
        <div class="course-meta">
          <div class="meta-item">
            <span class="meta-label">کد درس:</span>
            <span class="meta-value">${offering.course_code || '-'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">گروه:</span>
            <span class="meta-value">${offering.group_number || '-'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">استاد:</span>
            <span class="meta-value">${offering.professor_name || 'نامشخص'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">زمان:</span>
            <span class="meta-value">${dayDisplay} - ${timeDisplay}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">کلاس:</span>
            <span class="meta-value">${offering.classroom || 'کلاس نامشخص'}</span>
          </div>
        </div>
      </div>
      <div class="enrolled-actions">
        <button class="drop-btn" onclick="dropCourse('${enr.id}')">حذف درس</button>
      </div>
    `;
    enrolledList.appendChild(item);
  });
}

function translateErrorDetail(detail){
  const s = typeof detail === 'string' ? detail : JSON.stringify(detail);
  if (!s) return 'خطا در حذف درس';
  
  // Check for minimum units drop errors first (more specific)
  if (s.includes('would fall below minimum units') || s.includes('fall below minimum')) {
    return 'نمی‌توانید این درس را حذف کنید زیرا حداقل واحدهای الزامی را نقض خواهد کرد';
  }
  
  // Then check other drop errors
  if (s.includes('Can only drop') || s.includes('Can only remove')) {
    return 'فقط می‌توانید درس‌های ترم جاری را حذف کنید';
  }
  
  if (s.includes('Enrollment not found')) return 'ثبت‌نام یافت نشد';
  if (s.includes('Course offering not found')) return 'گروه درسی یافت نشد';
  if (s.includes('Cannot') || s.includes('not allowed')) return 'عملیات مجاز نیست';
  
  // fallback: if contains English letters, prepend a Persian label
  if (/[A-Za-z]/.test(s)) return 'خطا: ' + s;
  return s;
}

async function dropCourse(enrollmentId) {
  if (!confirm('آیا از حذف این درس مطمئن هستید؟')) return;

  try {
    const resp = await fetch(BASE_URL + '/enrollments/' + enrollmentId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    });
    if (!resp.ok) {
      // Try to show server-provided error details
      let detail = 'خطا در حذف درس';
      try{
        const body = await resp.json();
        detail = body.detail || body.message || JSON.stringify(body);
      }catch(e){
        detail = `خطا (${resp.status})`;
      }
      console.error('Drop failed', resp.status, detail);
      // translate common backend English messages to Persian
      const friendly = translateErrorDetail(detail);
      showToast(friendly, 'error');
      return;
    }
    showToast('درس با موفقیت حذف شد', 'success');
    // Refresh the page
    location.reload();
  } catch (err) {
    console.error(err);
    showToast('خطا در ارتباط با سرور', 'error');
  }
}

if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('accessToken'); window.location.href='/login'; });

document.addEventListener('DOMContentLoaded', async () => {
  if (getUserRole() === 'Admin') navbarTitle.innerText = 'سلام ادمین';
  else if (getUserRole() === 'Professor') navbarTitle.innerText = 'سلام استاد';
  else if (getUserRole() === 'Student') navbarTitle.innerText = 'سلام دانشجو عزیز';

  handleMenuPermissions();

  // Fetch schedule
  const scheduleItems = await fetchMySchedule();
  renderScheduleTable(scheduleItems);

  // Fetch enrollments and offerings
  const enrollments = await fetchMyEnrollments();
  
  // Build a map from offering_id to offering details
  // First populate from schedule items (which have time data)
  const offeringMap = {};
  if (scheduleItems && scheduleItems.length > 0) {
    scheduleItems.forEach(item => {
      if (!offeringMap[item.offering_id]) {
        offeringMap[item.offering_id] = {
          course_name: item.course_name,
          course_code: item.course_code,
          group_number: item.group_number,
          professor_name: item.professor_name,
          classroom: item.classroom,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time
        };
      }
    });
  }

  // Fetch current semester offerings to get additional details
  try {
    const resp = await fetch(BASE_URL + '/course-offerings/for-current-term', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    });
    if (resp.ok) {
      const offerings = await resp.json();
      offerings.forEach(off => {
        // Merge offering data with schedule data
        if (offeringMap[off.id]) {
          offeringMap[off.id] = { ...offeringMap[off.id], ...off };
        } else {
          offeringMap[off.id] = off;
        }
      });
    }
  } catch (err) {
    console.error('Error fetching offerings:', err);
  }

  renderEnrolledList(enrollments, offeringMap);
});

window.dropCourse = dropCourse;
