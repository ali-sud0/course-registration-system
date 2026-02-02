// Students Management
const BASE_URL = 'http://127.0.0.1:8000';
const TOKEN_KEY = 'accessToken';

// Get auth headers
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem(TOKEN_KEY) || '')
    };
}

// Fetch all students
async function fetchStudents() {
    try {
        const response = await fetch(`${BASE_URL}/me/students`, {
            headers: authHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch students: ${response.status}`);
        }
        
        const students = await response.json();
        renderStudents(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        showError('خطا در بارگذاری دانشجویان');
    }
}

// Render students table
function renderStudents(students) {
    const tbody = document.getElementById('studentsContainer');
    const emptyState = document.getElementById('emptyStateStudents');
    
    if (!tbody) {
        console.error('studentsContainer element not found');
        return;
    }
    
    if (students.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        tbody.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'table-body';
        const status = student.is_suspended ? 'تعلیق شده' : 'فعال';
        row.innerHTML = `
            <td>${student.first_name} ${student.last_name}</td>
            <td>${student.user_number}</td>
            <td>${student.phone_number}</td>
            <td>
                <button class="more-actions" onclick="deleteStudent('${student.id}')" title="حذف">
                    <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="2" cy="2" r="2" fill="#6B7280" />
                        <circle cx="8" cy="2" r="2" fill="#6B7280" />
                        <circle cx="14" cy="2" r="2" fill="#6B7280" />
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete student
async function deleteStudent(studentId) {
    if (!confirm('آیا مطمئن هستید می‌خواهید این دانشجو را حذف کنید؟')) {
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/me/students/${studentId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete student: ${response.status}`);
        }
        
        showSuccess('دانشجو با موفقیت حذف شد');
        fetchStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showError('خطا در حذف دانشجو');
    }
}

// Show error message
function showError(message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastDesc = document.getElementById('toastDesc');
    
    if (toast && toastTitle && toastDesc) {
        toast.style.backgroundColor = '#EF4444';
        toastTitle.innerText = 'خطا';
        toastDesc.innerText = message;
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// Show success message
function showSuccess(message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastDesc = document.getElementById('toastDesc');
    
    if (toast && toastTitle && toastDesc) {
        toast.style.backgroundColor = '#10B981';
        toastTitle.innerText = 'موفق';
        toastDesc.innerText = message;
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
});

// Load students on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
});
