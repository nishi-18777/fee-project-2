let container = document.getElementById('container');

window.toggle = () => {
	if (!container) container = document.getElementById('container');
	if (!container) return;
	container.classList.toggle('sign-in');
	container.classList.toggle('sign-up');
	window.scrollTo({ top: 0, behavior: 'smooth' });
};

setTimeout(() => {
	if (!container) container = document.getElementById('container');
	if (!container) return;
	const params = new URLSearchParams(window.location.search);
	if (params.get('action') === 'signup') {
		container.classList.remove('sign-in');
		container.classList.add('sign-up');
	} else {
		container.classList.remove('sign-up');
		container.classList.add('sign-in');
	}
}, 150);

// Authentication Client Logic
document.addEventListener('DOMContentLoaded', () => {
	const signupBtn = document.getElementById('signup-btn');
	const signinBtn = document.getElementById('signin-btn');

	// =========================
	// SIGN UP
	// =========================
	if (signupBtn) {
		signupBtn.addEventListener('click', async (e) => {
			e.preventDefault();

			const username = document.getElementById('signup-username').value.trim();
			const email = document.getElementById('signup-email').value.trim();
			const password = document.getElementById('signup-password').value;
			const confirmPassword = document.getElementById('signup-confirm-password').value;
			const errorDiv = document.getElementById('signup-error');

			errorDiv.textContent = '';

			if (!username || !email || !password || !confirmPassword) {
				errorDiv.textContent = 'All fields are required.';
				return;
			}

			if (password !== confirmPassword) {
				errorDiv.textContent = 'Passwords do not match.';
				return;
			}

			try {
				const response = await fetch('/api/auth/signup', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						username,
						email,
						password
					})
				});

				const data = await response.json();

				if (data.success) {
					localStorage.setItem(
						'currentUser',
						JSON.stringify({
							username: data.user.username,
							email: data.user.email
						})
					);

					window.location.href = '/page2.html';
				} else {
					errorDiv.textContent =
						data.message || 'Registration failed.';
				}

			} catch (err) {
				console.error('Signup error:', err);
				errorDiv.textContent =
					'Unable to connect to the server. Please try again.';
			}
		});
	}

	// =========================
	// SIGN IN
	// =========================
	if (signinBtn) {
		signinBtn.addEventListener('click', async (e) => {
			e.preventDefault();

			const username = document
				.getElementById('signin-username')
				.value
				.trim();

			const password =
				document.getElementById('signin-password').value;

			const errorDiv =
				document.getElementById('signin-error');

			errorDiv.textContent = '';

			if (!username || !password) {
				errorDiv.textContent = 'All fields are required.';
				return;
			}

			try {
				const response = await fetch('/api/auth/login', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						username,
						password
					})
				});

				const data = await response.json();

				if (data.success) {
					localStorage.setItem(
						'currentUser',
						JSON.stringify({
							username: data.user.username,
							email: data.user.email
						})
					);

					window.location.href = '/page2.html';
				} else {
					errorDiv.textContent =
						data.message || 'Invalid username or password.';
				}

			} catch (err) {
				console.error('Signin error:', err);
				errorDiv.textContent =
					'Unable to connect to the server. Please try again.';
			}
		});
	}

	// =========================
	// GUEST / DEMO LOGIN
	// =========================
	const handleGuestLogin = async (e) => {
		if (e) e.preventDefault();
		try {
			const res = await fetch('/api/auth/guest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await res.json();
			if (data.success) {
				localStorage.setItem(
					'currentUser',
					JSON.stringify({
						username: data.user.username || 'Guest User',
						email: data.user.email || 'guest@resumespark.com'
					})
				);
				window.location.href = '/page2.html';
				return;
			}
		} catch (err) {
			console.error('Guest login network issue, using offline guest session:', err);
		}

		// Fallback if network or serverless route has any issue
		localStorage.setItem(
			'currentUser',
			JSON.stringify({
				username: 'Guest User',
				email: 'guest@resumespark.com'
			})
		);
		window.location.href = '/page2.html';
	};

	const signinGuestBtn = document.getElementById('signin-guest-btn');
	if (signinGuestBtn) {
		signinGuestBtn.addEventListener('click', handleGuestLogin);
	}

	const signupGuestBtn = document.getElementById('signup-guest-btn');
	if (signupGuestBtn) {
		signupGuestBtn.addEventListener('click', handleGuestLogin);
	}

	// ========================================
	// GOOGLE SIGN-IN INTEGRATION
	// ========================================
	async function initGoogleSignIn() {
		try {
			// Fetch Client ID dynamically from backend
			const response = await fetch('/api/auth/google/client-id');
			const data = await response.json();
			const clientId = data.clientId;

			if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
				console.warn('[Google Auth] Google Client ID is not configured in your server .env file.');
				return;
			}

			// Initialize Google Identity Services
			google.accounts.id.initialize({
				client_id: clientId,
				callback: handleGoogleCredentialResponse
			});

			// Render standard Google Sign-In buttons
			const loginContainer = document.getElementById('google-signin-btn-login');
			if (loginContainer) {
				google.accounts.id.renderButton(loginContainer, {
					theme: 'outline',
					size: 'large',
					width: '280'
				});
			}

			const signupContainer = document.getElementById('google-signin-btn-signup');
			if (signupContainer) {
				google.accounts.id.renderButton(signupContainer, {
					theme: 'outline',
					size: 'large',
					width: '280'
				});
			}

		} catch (err) {
			console.error('Failed to initialize Google Sign-in:', err);
		}
	}

	async function handleGoogleCredentialResponse(response) {
		const token = response.credential;
		const loginError = document.getElementById('signin-error');
		const signupError = document.getElementById('signup-error');

		if (loginError) loginError.textContent = '';
		if (signupError) signupError.textContent = '';

		try {
			const res = await fetch('/api/auth/google', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token })
			});

			const data = await res.json();

			if (data.success) {
				localStorage.setItem(
					'currentUser',
					JSON.stringify({
						username: data.user.username,
						email: data.user.email
					})
				);
				window.location.href = '/page2.html';
			} else {
				const errMsg = data.message || 'Google Authentication failed.';
				if (loginError) loginError.textContent = errMsg;
				if (signupError) signupError.textContent = errMsg;
			}
		} catch (err) {
			console.error('Google sign-in error:', err);
			const networkErr = 'Unable to connect to Google authentication service.';
			if (loginError) loginError.textContent = networkErr;
			if (signupError) signupError.textContent = networkErr;
		}
	}

	// Safely start initializing GIS client
	if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
		initGoogleSignIn();
	} else {
		let checkCount = 0;
		const checkInterval = setInterval(() => {
			checkCount++;
			if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
				clearInterval(checkInterval);
				initGoogleSignIn();
			} else if (checkCount > 10) {
				clearInterval(checkInterval);
				console.warn('Google Identity Services SDK script was not loaded.');
			}
		}, 300);
	}
});

