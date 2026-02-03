// Lightweight sidebar role guard
function getUserRole() {
	const token = localStorage.getItem('accessToken');
	if (!token) return null;
	try {
		const payload = token.split('.')[1];
		return JSON.parse(atob(payload)).role;
	} catch (e) {
		return null;
	}
}

function replacePageWithNamespace(ns) {
	// If current path uses /page/, redirect to role namespace
	if (location.pathname.startsWith('/page/')) {
		const newPath = location.pathname.replace('/page/', `/${ns}/`);
		location.replace(newPath + location.search);
		return true;
	}
	return false;
}

function rewritePageLinksToNamespace(ns) {
	document.querySelectorAll('a[href^="/page/"]').forEach(a => {
		try {
			const href = a.getAttribute('href');
			a.setAttribute('href', href.replace('/page/', `/${ns}/`));
		} catch (e) {}
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const role = getUserRole();
	if (!role) return;

	const normalized = role.toString().toLowerCase();
	if (normalized === 'admin') {
		// Redirect legacy /page/* admin users to /admin/* equivalents
		if (replacePageWithNamespace('admin')) return;
		// Rewrite any links remaining on the page to point to /admin/*
		rewritePageLinksToNamespace('admin');

		// Enforce admin-only navigation: if user is on a non-admin page, send to admin home
		const allowedPrefixes = ['/admin', '/static', '/auth', '/login', '/'];
		if (!allowedPrefixes.some(p => location.pathname.startsWith(p))) {
			location.replace('/admin/courses');
			return;
		}
	} else if (normalized === 'professor') {
		if (replacePageWithNamespace('professors')) return;
		rewritePageLinksToNamespace('professors');
	} else if (normalized === 'student') {
		if (replacePageWithNamespace('students')) return;
		rewritePageLinksToNamespace('students');

		// Ensure students don't land on admin pages
		if (location.pathname.startsWith('/admin')) {
			location.replace('/students/courses');
			return;
		}
	}
});

