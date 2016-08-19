document.addEventListener('DOMContentLoaded', function() {

	var loginBtn = document.getElementById('login');
	var usernameInput = document.getElementById('username');
	var passwordInput = document.getElementById('password');
	var errorMsg = document.getElementById('errorMsg');

	usernameInput.addEventListener('focus', function() {
		this.classList.remove('error');
		errorMsg.classList.remove('error');
	});
	passwordInput.addEventListener('focus', function() {
		this.classList.remove('error');
		errorMsg.classList.remove('error');
	});
	loginBtn.addEventListener('click', function() {

		var username = usernameInput.value.trim();
		var password = passwordInput.value.trim();

		if(validate(username, password)) {
			$.post( "/login", { username: username, password: password }, function( data ) {
				if(data === 'success') {
					window.location.replace('/');
				} else if (data === 'failure') {
					loginFailed();
				} else {
					alert('ERROR: There was a problem with your login. Please contact support.')
				}
			});
		}
	});



	function validate(username, password) {

		valid = true
		usernameInput.classList.remove('error');
		passwordInput.classList.remove('error');
		errorMsg.innerText = '';
		errorMsg.classList.remove('error');


		if(username == '') {
			valid = false;
			usernameInput.classList.add('error');
		}
		if(password == '') {
			valid = false;
			passwordInput.classList.add('error');
		}
		if(!valid) {
			errorMsg.innerText = 'Please enter username and password.';
			errorMsg.classList.add('error');
		}

		return valid;
	}

	function loginFailed() {

		usernameInput.classList.add('error');
		passwordInput.classList.add('error');
		
		errorMsg.innerText = 'Incorrect username and or password. Please enter a valid username and password.';
		errorMsg.classList.add('error');

	}


});