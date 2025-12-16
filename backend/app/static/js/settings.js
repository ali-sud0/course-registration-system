
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


const BASE_URL = 'http://127.0.0.1:8023'; // آدرس سرور واقعی

// ---------- توابع ---------- //

btnSave.addEventListener('click', async e => {
    e.preventDefault();

    sendUnitsLimits();
});

if (getUserRole() === "Admin") {
  navbarTitle.innerText = "سلام ادمین";
} else if (getUserRole() === "Professor") {
  navbarTitle.innerText = "سلام استاد";
} else if (getUserRole() === "Student") {
  navbarTitle.innerText = "سلام دانشجو عزیز";
}



async function sendUnitsLimits() {
  const min = minUnits.value.trim();
  const max = maxUnits.value.trim();

    const semester = {
      id: "0c77581b-4e92-4be6-9dd9-0c1c64cf1669",
      name: "1401-1",
      start_date: "2025-12-16",
      end_date: "2026-12-16",
      min_units: min,
      max_units: max
    };

    if (!semester.min_units || !semester.max_units) {
      alert('حداقل و حداکثر واحد را وارد کنید');
      return;
    }

    try {
      const response = await fetch(BASE_URL + "/semesters/" + semester.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        },
        body: JSON.stringify(semester)
      });
      if (!response.ok) {
        showToast('failed', "خطا", 'خطا در ویرایش حداقل و حداکثر واحد');
      } else {
        showToast('success', "موفق", 'اطلاعات با موفقیت ذخیره شد');
      }
      handleJwtExpire(response);

    } catch (err) {
      console.error('خطای شبکه:', err);
    }


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

    window.location.href = "./login.html";
    return;
  }
}

async function getMinMaxUnits(id){
  let newList = [];
  try {
      const response = await fetch(BASE_URL + "/semesters/" + id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        }
      });
      if (!response.ok) {
        console.warn('ارسال به سرور موفق نبود');
      } else {
        list = await response.json();
        newList = list;

        minUnits.value = newList.min_units;
        maxUnits.value = newList.max_units;
      }
      handleJwtExpire(response);


    } catch (err) {
      console.error('خطای شبکه:', err);
    }
}


// ---------- خروج ---------- //
if (logoutBtn) logoutBtn.addEventListener('click', () => window.location.href = 'login.html');


// ---------- بارگذاری اولیه ---------- //
document.addEventListener('DOMContentLoaded', async () => {
  //await renderPrerequires();  // بعد prerequires
  getMinMaxUnits("0c77581b-4e92-4be6-9dd9-0c1c64cf1669");
});

