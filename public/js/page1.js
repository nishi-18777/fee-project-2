javascript
let container = document.getElementById('container');

toggle = () => {
	container.classList.toggle('sign-in');
	container.classList.toggle('sign-up');
};

setTimeout(() => {
	container.classList.add('sign-in');
}, 200);

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
});

