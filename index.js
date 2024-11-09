'use strict';
const API_URL = 'http://localhost:5000/api';

// Login form handler
document.getElementById('btnLogin').addEventListener('click', async (event) => {
	let userName = document.forms.login.userName.value;
	let password = document.forms.login.password.value;
	let type = document.forms.login.loginRadioOptions.value;

	if (!document.forms.login.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		document.forms.login.classList.add('was-validated');
		return;
	}

	try {
		const response = await fetch(`${API_URL}/users/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ userName, password, type })
		});

		const data = await response.json();

		if (response.ok) {
			sessionStorage.setItem('loginUser', JSON.stringify(data.user));
			location.href = type == 0 ? './admin/index.html' : './student/index.html';
		} else {
			document.getElementById('loginAlert').classList.remove('d-none');
		}
	} catch (error) {
		console.error('Error:', error);
		alert('Login failed. Please try again.');
	}
});

// Register form handler
document.getElementById('btnRegister').addEventListener('click', async (event) => {
	let userName = document.forms.register.userName.value;
	let password = document.forms.register.password.value;
	let confirmPassword = document.forms.register.confirmPassword.value;
	let type = parseInt(document.forms.register.registerRadioOptions.value);

	if (password !== confirmPassword) {
		document.getElementById('passwordMatchAlert').classList.remove('d-none');
		return;
	}

	if (!document.forms.register.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		document.forms.register.classList.add('was-validated');
		return;
	}

	try {
		const userData = {
			userName,
			password,
			type
		};

		// Only include idNumber if registering as student
		if (type === 1) {
			userData.idNumber = document.forms.register.idNumber.value;
		}

		const response = await fetch(`${API_URL}/users/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(userData)
		});

		const data = await response.json();

		if (response.ok) {
			document.getElementById('registerAlert').classList.remove('d-none');
			document.forms.register.reset();
			setTimeout(() => {
				document.getElementById('registerAlert').classList.add('d-none');
			}, 2000);
		} else {
			document.getElementById('userExistAlert').classList.remove('d-none');
		}

		setTimeout(() => {
			document.getElementById('registerAlert').classList.add('d-none');
			document.getElementById('userExistAlert').classList.add('d-none');
			document.getElementById('passwordMatchAlert').classList.add('d-none');
		}, 2000);
	} catch (error) {
		console.error('Error:', error);
		alert('Registration failed. Please try again.');
	}
});

// Add event listeners for radio buttons
document.querySelectorAll('input[name="registerRadioOptions"]').forEach(radio => {
	radio.addEventListener('change', (e) => {
		const idNumberField = document.getElementById('idNumberField');
		const idNumberInput = idNumberField.querySelector('input');
		
		if (parseInt(e.target.value) === 1) { // Convert to integer for comparison
			idNumberField.classList.remove('d-none');
			idNumberInput.required = true;
		} else {
			idNumberField.classList.add('d-none');
			idNumberInput.required = false;
			idNumberInput.value = ''; // Clear the input
		}
	});
});