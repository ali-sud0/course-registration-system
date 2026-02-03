// Professors Management
const API_BASE = 'http://127.0.0.1:8000/me';
const TOKEN_KEY = 'accessToken';

// Get auth headers
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem(TOKEN_KEY) || '')
    };
}

// Fetch all professors
async function fetchProfessors() {
    try {
        const response = await fetch(`${API_BASE}/professors`, {
            headers: authHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch professors: ${response.status}`);
        }
        
        const professors = await response.json();
        renderProfessors(professors);
    } catch (error) {
        console.error('Error fetching professors:', error);
        showError('خطا در بارگذاری اساتید');
    }
}

// Render professors table
function renderProfessors(professors) {
    const tbody = document.getElementById('professorsContainer');
    const emptyState = document.getElementById('emptyStateProfessors');
    
    if (professors.length === 0) {
        emptyState.style.display = 'block';
        tbody.innerHTML = '';
        return;
    }
    
    emptyState.style.display = 'none';
    tbody.innerHTML = '';
    
    professors.forEach(prof => {
        const row = document.createElement('tr');
        row.className = 'table-body';
        const status = prof.is_suspended ? 'تعلیق شده' : 'فعال';
        row.innerHTML = `
            <td>${prof.user_number}</td>
            <td>${prof.first_name}</td>
            <td>${prof.last_name}</td>
            <td>${prof.national_number}</td>
            <td>${prof.phone_number}</td>
            <td>${status}</td>
            <td>
                <button class="more-actions" onclick="deleteProfessor('${prof.id}')" title="حذف">
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

// Open add professor modal
function openAddProfessorModal() {
    document.getElementById('modalAddProfessor').style.display = 'block';
    document.getElementById('formAddProfessor').reset();
    document.getElementById('errorMessage').style.display = 'none';
}

// Close add professor modal
function closeAddProfessorModal() {
    document.getElementById('modalAddProfessor').style.display = 'none';
    document.getElementById('formAddProfessor').reset();
    document.getElementById('errorMessage').style.display = 'none';
}

// Handle add professor form submission
async function handleAddProfessor(event) {
    event.preventDefault();
    
    const form = document.getElementById('formAddProfessor');
    const formData = new FormData(form);
    
    const professorData = {
        user_number: formData.get('user_number'),
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        national_number: formData.get('national_number'),
        phone_number: formData.get('phone_number'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE}/professors/`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(professorData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'خطا در ایجاد استاد');
        }
        
        closeAddProfessorModal();
        showSuccess('استاد با موفقیت اضافه شد');
        fetchProfessors();
    } catch (error) {
        console.error('Error creating professor:', error);
        document.getElementById('errorMessage').textContent = error.message;
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// Delete professor
async function deleteProfessor(professorId) {
    if (!confirm('آیا مطمئن هستید می‌خواهید این استاد را حذف کنید؟')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/professors/${professorId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete professor: ${response.status}`);
        }
        
        showSuccess('استاد با موفقیت حذف شد');
        fetchProfessors();
    } catch (error) {
        console.error('Error deleting professor:', error);
        showError('خطا در حذف استاد');
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

// Modal event listeners
document.getElementById('openAddProfessorModal')?.addEventListener('click', openAddProfessorModal);
document.getElementById('closeModalAddProfessor')?.addEventListener('click', closeAddProfessorModal);
document.getElementById('cancelAddProfessor')?.addEventListener('click', closeAddProfessorModal);
document.getElementById('formAddProfessor')?.addEventListener('submit', handleAddProfessor);

// Close modal when clicking outside
document.getElementById('modalAddProfessor')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalAddProfessor')) {
        closeAddProfessorModal();
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
});

// Load professors on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchProfessors();
});
