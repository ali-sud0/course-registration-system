// Professors Page Script

const navbarTitle = document.getElementById('navbarTitle');
const logoutBtn = document.getElementById('logoutBtn');
const professorList = document.getElementById('professorList');
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');

const BASE_URL = 'http://127.0.0.1:8000';

// ---------- Utility Functions ---------- //

function getUserRole() {
  const token = localStorage.getItem("accessToken");
  if (token !== null) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)).role;
  }
}

function getUserId() {
  const token = localStorage.getItem("accessToken");
  if (token !== null) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)).sub;
  }
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
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

function showToast(title, desc) {
  toastTitle.textContent = title;
  toastDesc.textContent = desc;
  toast.style.display = "flex";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// ---------- Fetch Professors ---------- //

async function fetchProfessors() {
  try {
    const response = await fetch(`${BASE_URL}/me/professors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json'
      }
    });

    handleJwtExpire(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const professors = await response.json();
    renderProfessors(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    showToast('خطا', 'خطا در بارگذاری اساتید');
  }
}

// ---------- Render Professors ---------- //

function renderProfessors(professors) {
  if (professors.length === 0) {
    professorList.innerHTML = `
      <div class="empty-state">
        <p>هیچ استادی موجود نیست</p>
      </div>
    `;
    return;
  }

  professorList.innerHTML = professors.map(prof => `
    <div class="professor-card">
      <div class="professor-info">
        <div class="professor-name">${prof.first_name} ${prof.last_name}</div>
        <div class="professor-details">
          <div class="detail-item">
            <span class="detail-label">شماره کاربری</span>
            <span class="detail-value">${prof.user_number}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">شماره ملی</span>
            <span class="detail-value">${prof.national_number}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">تلفن</span>
            <span class="detail-value">${prof.phone_number}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ---------- Event Listeners ---------- //

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  });
}

// ---------- Set Navbar Title ---------- //

if (getUserRole() === "Admin") {
  navbarTitle.innerText = "سلام ادمین";
} else if (getUserRole() === "Professor") {
  navbarTitle.innerText = "سلام استاد";
} else if (getUserRole() === "Student") {
  navbarTitle.innerText = "سلام دانشجو عزیز";
}

// ---------- Page Initialization ---------- //

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is Admin
  if (getUserRole() !== "Admin") {
    showToast('خطا', 'فقط ادمین می‌تواند اساتید را ببیند');
    setTimeout(() => {
      window.location.href = '/page/courses';
    }, 2000);
    return;
  }

  // Fetch professors
  await fetchProfessors();
});
