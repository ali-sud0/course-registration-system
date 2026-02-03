
const navbarTitle = document.getElementById('navbarTitle');

// ارجاع به عناصر DOM
const logoutBtn = document.getElementById('logoutBtn');


const btnSave = document.getElementById('btnSave');
const maxUnits = document.getElementById('maxUnits');
const minUnits = document.getElementById('minUnits');

// toast
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');


const BASE_URL = 'http://127.0.0.1:8000'; // آدرس سرور واقعی

// ---------- توابع ---------- //

if (getUserRole() === "Admin") {
  navbarTitle.innerText = "سلام ادمین";
} else if (getUserRole() === "Professor") {
  navbarTitle.innerText = "سلام استاد";
} else if (getUserRole() === "Student") {
  navbarTitle.innerText = "سلام دانشجو عزیز";
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

async function getMinMaxUnits(id){
  try {
    const response = await fetch(BASE_URL + "/semesters/" + id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    });
    if (response.ok) {
      const data = await response.json();
      minUnits.value = data.min_units || '';
      maxUnits.value = data.max_units || '';
    } else {
      console.warn('ارسال به سرور موفق نبود');
    }
    handleJwtExpire(response);
  } catch (err) {
    console.error('خطای شبکه:', err);
  }
}


// Get active semester ID
let activeSemesterId = null;

async function fetchActiveSemester() {
  try {
    const response = await fetch(BASE_URL + "/semesters/active/current", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    });
    if (response.ok) {
      const data = await response.json();
      activeSemesterId = data.id;
      await getMinMaxUnits(data.id);
    } else {
      console.warn('Failed to fetch active semester');
    }
  } catch (err) {
    console.error('خطای شبکه:', err);
  }
}

async function sendUnitsLimitsWithActiveSemester() {
  if (!activeSemesterId) {
    alert('نتوانست ترم فعال را یافت کند. لطفا صفحه را دوباره بارگذاری کنید');
    return;
  }
  
  const min = minUnits.value.trim();
  const max = maxUnits.value.trim();

  if (!min || !max) {
    alert('حداقل و حداکثر واحد را وارد کنید');
    return;
  }

  try {
    const response = await fetch(BASE_URL + "/semesters/" + activeSemesterId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      },
      body: JSON.stringify({
        min_units: parseInt(min),
        max_units: parseInt(max)
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      showToast('failed', "خطا", errorData.detail || 'خطا در ویرایش حداقل و حداکثر واحد');
    } else {
      showToast('success', "موفق", 'اطلاعات با موفقیت ذخیره شد');
    }
    handleJwtExpire(response);
  } catch (err) {
    console.error('خطای شبکه:', err);
    showToast('failed', "خطا", 'خطای شبکه');
  }
}

// Override button handler to use active semester
btnSave.removeEventListener('click', () => sendUnitsLimits());
btnSave.addEventListener('click', async e => {
  e.preventDefault();
  await sendUnitsLimitsWithActiveSemester();
});

// ---------- خروج ---------- //
if (logoutBtn) logoutBtn.addEventListener('click', () => window.location.href = '/login');


// ---------- بارگذاری اولیه ---------- //
document.addEventListener('DOMContentLoaded', async () => {
  await fetchActiveSemester();
});

