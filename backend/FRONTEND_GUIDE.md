# Frontend Guide

This backend serves a frontend application with HTML templates, CSS styles, and JavaScript logic. This guide explains how the frontend is structured and how to access and develop it.

## Frontend Architecture

The frontend is served as **static assets** by the FastAPI backend. This means:

- **No separate frontend server needed** - Frontend is integrated into the backend
- **HTML Templates** are rendered from `app/templates/`
- **Static assets** (CSS, JS, images, fonts) are served from `app/static/`
- **API communication** uses JavaScript to call FastAPI endpoints
- **Authentication** is handled via JWT tokens stored in browser localStorage

## Directory Structure

```
backend/app/
├── templates/
│   ├── index.html          # Landing/home page
│   ├── login.html          # User login page
│   ├── courses.html        # Course registration page
│   ├── settings.html       # User settings page
│   └── settings/           # Settings page assets
│
└── static/
    ├── css/
    │   ├── base.css        # Base styles and layout
    │   ├── components.css  # Reusable component styles
    │   ├── courses.css     # Courses page specific styles
    │   ├── login.css       # Login page specific styles
    │   └── settings.css    # Settings page specific styles
    │
    ├── js/
    │   ├── login.js        # Login page logic
    │   ├── courses.js      # Courses page logic
    │   └── settings.js     # Settings page logic
    │
    ├── font/               # Custom fonts
    │
    └── images/             # Images and icons
```

## Running the Frontend

### Step 1: Install Backend Dependencies

```bash
cd backend
pip3 install -r requirements.txt --break-system-packages
```

### Step 2: Start the Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

The `--reload` flag enables auto-reload when files change (useful for development).

### Step 3: Access the Frontend

Open your web browser and navigate to:

```
http://localhost:8000
```

This serves the frontend homepage from `app/templates/index.html`.

## Frontend Pages

### 1. **Home Page** (`/` or `index.html`)
- Entry point to the application
- Navigation to login and other pages
- User information display (if logged in)

**Access**: `http://localhost:8000/`

### 2. **Login Page** (`/login` or `login.html`)
- User authentication form
- Accepts username/email and password
- Stores JWT tokens in localStorage upon successful login
- Redirects to courses page after login

**Access**: `http://localhost:8000/login`

**Login Process:**
1. User enters credentials
2. JavaScript sends POST request to `/auth/login`
3. Backend returns JWT access token
4. Token stored in browser localStorage
5. User redirected to courses page

### 3. **Courses Page** (`/page/courses` or `courses.html`)
- Display available courses
- Course enrollment/drop functionality
- Filter by semester or professor
- View course details (capacity, schedule, etc.)
- Protected route - requires JWT token

**Access**: `http://localhost:8000/page/courses`

**Features:**
- Displays courses for active semesters
- Shows enrollment status per course
- "Enroll" button for available courses
- "Drop" button for enrolled courses
- Prerequisite validation

### 4. **Settings Page** (`/page/settings` or `settings.html`)
- User profile management
- Password change
- Contact information updates
- Account preferences
- Protected route - requires JWT token

**Access**: `http://localhost:8000/page/settings`

## Frontend-Backend Communication

### API Endpoints Used

The frontend communicates with these backend endpoints:

#### Authentication
```
POST /auth/login                    # User login
POST /auth/register                 # User registration (if available)
POST /auth/logout                   # User logout
```

#### Courses
```
GET  /api/courses                   # List all courses
GET  /api/courses/{course_id}       # Get course details
POST /api/courses                   # Create course (Admin only)
```

#### Enrollments
```
GET  /api/enrollments               # List user's enrollments
POST /api/enrollments               # Enroll in a course
DELETE /api/enrollments/{enrollment_id}  # Drop a course
```

#### Users
```
GET  /api/users/me                  # Get current user info
PUT  /api/users/me                  # Update user info
GET  /api/users/{user_id}           # Get user details
```

#### Semesters
```
GET  /api/semesters                 # List all semesters
GET  /api/semesters/{semester_id}   # Get semester details
```

### Authentication Flow

1. **Login Request**
   ```javascript
   POST /auth/login
   { "user_number": "STU001", "password": "password" }
   ```

2. **Response**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "bearer"
   }
   ```

3. **Store Token**
   ```javascript
   localStorage.setItem("access_token", token);
   ```

4. **Use Token in Requests**
   ```javascript
   headers: {
     "Authorization": "Bearer " + token
   }
   ```

## Development Workflow

### Making Frontend Changes

1. **Edit Template/CSS/JS**
   ```bash
   # Edit files in app/templates/ or app/static/
   vim app/templates/courses.html
   vim app/static/css/courses.css
   vim app/static/js/courses.js
   ```

2. **Refresh Browser**
   - Backend has `--reload` enabled, so changes are instantly available
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to clear cache

3. **Check Browser Console**
   - Open DevTools (F12)
   - View Console for JavaScript errors
   - View Network tab to see API calls

### Debugging

**Browser DevTools**
- Press `F12` to open Developer Tools
- **Console tab**: See JavaScript errors and logs
- **Network tab**: View API requests/responses
- **Storage tab**: Check localStorage for JWT tokens

**Check Backend Logs**
- Terminal shows incoming requests and errors
- Look for 400/401/403/500 error messages

**Common Issues:**

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token expired or not in localStorage. Log in again. |
| CORS errors | Backend CORS settings may need adjustment |
| 404 Not Found | Endpoint doesn't exist or wrong URL |
| Page doesn't load | Check browser console for JavaScript errors |
| Styles don't apply | Clear browser cache (Ctrl+Shift+Delete) |

## JavaScript Files Explanation

### `app/static/js/login.js`
- Handles login form submission
- Sends credentials to `/auth/login`
- Stores JWT token in localStorage
- Redirects to courses page on success
- Shows error messages on failure

### `app/static/js/courses.js`
- Fetches course list from `/api/courses`
- Handles enrollment button clicks
- Sends enrollment requests to `/api/enrollments`
- Updates course UI based on enrollment status
- Filters/sorts courses
- Shows loading spinners while fetching data

### `app/static/js/settings.js`
- Fetches user info from `/api/users/me`
- Handles form submission for profile updates
- Sends PUT request to `/api/users/me`
- Handles password change requests
- Shows success/error notifications

## CSS Files Explanation

### `app/static/css/base.css`
- Global styles (colors, fonts, typography)
- Layout and spacing
- Navigation bar styling
- Responsive breakpoints
- Dark mode support (if implemented)

### `app/static/css/components.css`
- Reusable button styles
- Form component styling
- Card/container styles
- Modal/dialog styling
- Loading spinners and animations

### `app/static/css/login.css`
- Login form specific styles
- Centered layout
- Input field styling
- Submit button styling
- Error message display

### `app/static/css/courses.css`
- Course card styling
- Course list layout (grid/flex)
- Filter controls
- Enrollment button states
- Schedule display

### `app/static/css/settings.css`
- Settings form layout
- Tab/section navigation
- Form input styling
- Save button styling

## Testing the Frontend

### Test Login
1. Go to `http://localhost:8000/login`
2. Enter test credentials:
   - **User Number**: `STU001` (or create a test user)
   - **Password**: `password123`
3. Click login - should see courses page

### Test Course Enrollment
1. Login successfully
2. Go to `http://localhost:8000/page/courses`
3. Click "Enroll" on a course
4. Verify enrollment status updates

### Test Settings
1. Login successfully
2. Go to `http://localhost:8000/page/settings`
3. Update user information
4. Verify changes are saved

## Production Deployment

### For Production:

1. **Remove `--reload` flag**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

2. **Use Gunicorn with multiple workers**
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
   ```

3. **Enable HTTPS**
   - Use nginx as reverse proxy
   - Configure SSL/TLS certificates

4. **Minify Assets** (optional)
   - Minify CSS files
   - Minify JavaScript files
   - Compress images

5. **Set Environment Variables**
   ```bash
   export DATABASE_URL="postgresql://user:pass@host/db"
   export JWT_SECRET="your-secret-key"
   export ENVIRONMENT="production"
   ```

## Environment Variables

Frontend-related environment variables:

```bash
API_BASE_URL=http://localhost:8000        # Backend API URL
ENVIRONMENT=development                    # development or production
DEBUG=true                                 # Enable debug logging
```

These can be set in a `.env` file or passed as environment variables.

## Frontend Features

### Current Implementation
✅ User authentication (login)  
✅ Course listing and filtering  
✅ Course enrollment/drop  
✅ User settings/profile  
✅ Responsive design  
✅ JWT token management  

### Potential Enhancements
- 🔄 Real-time notifications
- 📊 Student/professor dashboard
- 📅 Calendar view for schedules
- 🔔 Email notifications
- 📱 Mobile app version
- 🌙 Dark mode theme

## Troubleshooting

### Frontend Won't Load
```bash
# Restart backend server
# Make sure you're on http://localhost:8000 (not 127.0.0.1)
# Check browser console (F12) for errors
```

### API Calls Failing
```bash
# Check backend is running
curl http://localhost:8000/api/courses

# Check token is in localStorage
# Open DevTools → Storage → localStorage → Check "access_token"

# Check backend logs for errors
```

### CORS Issues
```bash
# If frontend can't call backend endpoints:
# This usually means CORS is not configured properly
# Contact backend developer
```

### Styling Issues
```bash
# Clear browser cache: Ctrl+Shift+Delete
# Rebuild CSS if using preprocessor
# Check CSS file paths in HTML
```

## Support

For frontend issues or questions:
1. Check browser console for errors (F12)
2. Check backend logs for API errors
3. Verify JWT token exists in localStorage
4. Ensure backend is running on port 8000
5. Review API response codes (4xx = client error, 5xx = server error)

## Status: ✅ Frontend Now Working!

After the fix, the frontend pages are now correctly served:
- ✅ Home page loads at `http://localhost:8000`
- ✅ Login page loads at `http://localhost:8000/login`
- ✅ Courses page loads at `http://localhost:8000/page/courses`
- ✅ Settings page loads at `http://localhost:8000/page/settings`
- ✅ Static assets (CSS, JS) load from `http://localhost:8000/static/`
- ✅ All 33 unit tests pass

---

**Frontend Running**: `http://localhost:8000`  
**Backend API**: `http://localhost:8000/api/*`  
**Docs**: `http://localhost:8000/docs`  
**Database**: PostgreSQL (configured in `.env`)
