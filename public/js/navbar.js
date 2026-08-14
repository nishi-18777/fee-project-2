// Dynamic Navbar Injection and Authentication handling
(function() {
    // 1. Check if FontAwesome is present; if not, inject it
    if (!document.querySelector('link[href*="font-awesome"]') && !document.querySelector('link[href*="all.min.css"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fa);
    }

    // 2. Fetch login state
    let currentUser = null;
    try {
        const localData = localStorage.getItem('currentUser');
        if (localData) {
            currentUser = JSON.parse(localData);
        }
    } catch (e) {
        console.error('Error parsing local user:', e);
    }

    // 3. Setup function to render navbar
    function renderNavbar() {
        // Remove existing navbar if any
        const existingNav = document.querySelector('.spark-navbar');
        if (existingNav) existingNav.remove();

        const navbar = document.createElement('nav');
        navbar.className = 'spark-navbar';

        const currentPage = window.location.pathname.split('/').pop() || 'login page.html';
        const isProfileActive = currentPage === 'profile.html' ? 'active' : '';
        const isTemplatesActive = currentPage === 'templates.html' ? 'active' : '';
        const isHomeActive = currentPage === 'page2.html' ? 'active' : '';

        // Left Logo Section
        const logoLink = currentUser ? 'page2.html' : 'login page.html';
        let leftLogo = `<a href="${logoLink}" class="nav-logo">ResumeSpark<span class="sparkle">✨</span></a>`;

        // Middle Nav Links (Only if logged in)
        let middleLinks = '';
        if (currentUser) {
            middleLinks = `
                <ul class="nav-links">
                    <li><a href="page2.html" class="${isHomeActive}">Home</a></li>
                    <li><a href="templates.html" class="${isTemplatesActive}">Templates</a></li>
                    <li><a href="profile.html" class="${isProfileActive}">My Profile</a></li>
                    <li><a href="profile.html#saved-resumes" class="${currentPage === 'profile.html' && window.location.hash === '#saved-resumes' ? 'active' : ''}">Saved Resumes</a></li>
                </ul>
            `;
        }

        // Right side - Profile Dropdown or Auth Buttons
        let rightSide = '';
        if (currentUser) {
            const firstLetter = currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U';
            rightSide = `
                <div class="nav-profile-container" id="navProfileContainer">
                    <div class="nav-avatar" id="navAvatar">${firstLetter}</div>
                    <div class="profile-dropdown" id="profileDropdown">
                        <div class="dropdown-header">
                            <span class="user-name">${currentUser.username}</span>
                            <span class="user-email">${currentUser.email}</span>
                        </div>
                        <a href="profile.html" class="dropdown-item">
                            <i class="fas fa-user-circle"></i> My Profile
                        </a>
                        <a href="profile.html#saved-resumes" class="dropdown-item">
                            <i class="fas fa-file-alt"></i> Saved Resumes
                        </a>
                        <a href="templates.html" class="dropdown-item">
                            <i class="fas fa-layer-group"></i> Templates
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item logout" id="navLogoutBtn">
                            <i class="fas fa-sign-out-alt"></i> Log Out
                        </a>
                    </div>
                </div>
            `;
        } else {
            // Guest Buttons
            rightSide = `
                <div class="nav-auth-buttons">
                    <a href="#" class="btn-nav-signin" id="navSignInLink">Sign In</a>
                    <a href="#" class="btn-nav-signup" id="navSignUpLink">Sign Up</a>
                </div>
            `;
        }

        navbar.innerHTML = leftLogo + middleLinks + rightSide;
        document.body.prepend(navbar);

        // Bind events
        if (currentUser) {
            const profileContainer = document.getElementById('navProfileContainer');
            const logoutBtn = document.getElementById('navLogoutBtn');

            // Dropdown Toggle
            profileContainer.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function() {
                profileContainer.classList.remove('active');
            });

            // Logout execution
            logoutBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (err) {
                    console.warn('Logout API failed:', err);
                }
                localStorage.removeItem('currentUser');
                window.location.href = 'login page.html';
            });
        } else {
            // Guest Links Click logic
            const signInLink = document.getElementById('navSignInLink');
            const signUpLink = document.getElementById('navSignUpLink');

            const handleAuthRedirect = (actionType) => {
                const isOnLoginPage = currentPage.toLowerCase().includes('login page.html');
                if (isOnLoginPage) {
                    // Call page-specific toggle if it's there
                    const container = document.getElementById('container');
                    if (container) {
                        if (actionType === 'signup') {
                            container.classList.remove('sign-in');
                            container.classList.add('sign-up');
                        } else {
                            container.classList.remove('sign-up');
                            container.classList.add('sign-in');
                        }
                    }
                } else {
                    window.location.href = `login page.html?action=${actionType}`;
                }
            };

            signInLink.addEventListener('click', (e) => {
                e.preventDefault();
                handleAuthRedirect('signin');
            });

            signUpLink.addEventListener('click', (e) => {
                e.preventDefault();
                handleAuthRedirect('signup');
            });
        }
    }

    // 4. Background Sync check for User authentication
    async function syncAuth() {
        if (!currentUser) return; // If already a guest, let them be
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            if (data.success && data.user) {
                // Keep local storage in sync
                const syncedUser = { username: data.user.username, email: data.user.email };
                localStorage.setItem('currentUser', JSON.stringify(syncedUser));
                // If username or email changed, re-render navbar
                if (currentUser.username !== syncedUser.username || currentUser.email !== syncedUser.email) {
                    currentUser = syncedUser;
                    renderNavbar();
                }
            } else {
                // If API says not logged in, clear local details and redirect if we are on protected page
                localStorage.removeItem('currentUser');
                const currentPage = window.location.pathname.split('/').pop() || 'login page.html';
                const isLoginPage = currentPage.toLowerCase().includes('login page.html');
                if (!isLoginPage) {
                    window.location.href = 'login page.html';
                }
            }
        } catch (err) {
            console.warn('Authentication sync check failed:', err);
        }
    }

    // Run Render on DOMContentLoaded or immediately if body is ready
    if (document.body) {
        renderNavbar();
    } else {
        document.addEventListener('DOMContentLoaded', renderNavbar);
    }

    // Run Background Sync
    syncAuth();
})();
