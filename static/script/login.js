document.addEventListener('DOMContentLoaded', function() {
	var loginBtn = document.getElementById('login');

	loginBtn.addEventListener('click', function() {

		var username = 'giusy';
		var password = 'cool';

		$.post( "/login", { username: username, password: password }, function( data ) {
			console.log(data);
			if(data === 'success') {
				window.location.replace('/');
			}
		});
	})
});