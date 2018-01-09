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
	loginBtn.addEventListener('click', submitLogin);
	passwordInput.addEventListener('keypress', function(e) {
		if(e.keyCode == 13) submitLogin();
	})

	function submitLogin() {
		var username = usernameInput.value.trim();
		var password = passwordInput.value.trim();

		if(validate(username, password)) {

			$.ajax({
			    type: "POST",
			    url: "/login",
			    data: { username: username, password: password },
			    statusCode: {
			    	200: function() {
						window.location.replace('/');
			        },
			        401: function() {
						loginFailed();
			        },
			        500: function() {
			            alert("There was a problem. Please try again.");
			        }
			    }
			});
		}
	}

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