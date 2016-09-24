
var LoginBox = React.createClass({
	getInitialState: function() {
		console.log('get initial state');
		return {
			username: {
				invalid: false,
				value: ''
			},
			password: {
				invalid: false,
				value: ''				
			},
			errorMsg: {
				message: '',
				class: ''
			}
		}
	},
	getInputClass: function(name) {
		return this.state[name].invalid ? 'error' : '';
	},
	focusHandler: function(e) {
		console.log('focus');
		var newState = this.state;
		newState[e.target.id].invalid = false;
		this.setState(newState);
	},
	onChange: function(e) {
		console.log('on change');
		var newState = this.state;
		newState[e.target.id].value = e.target.value;
		this.setState(newState);
	},
	submitHandler: function() {

		var newState = this.state;

		var valid = true;
		
		// validate username
		if(this.state.username.value.trim() == '') {
			valid = false;
			newState.username.invalid = false;
		} else {
			newState.username.invalid = true;
		}

		// validate password
		if(this.state.password.value.trim() == '') { 
			valid = false;			
			newState.password.invalid = false;
		} else {
			newState.password.invalid = true;
		}

		if(valid) {			
			newState.errorMsg = '';
		} else {
			newState.errorMsg.class = 'error'	
			newState.errorMsg.message = 'Please enter a valid username and password.'		
		}

		this.setState(newState);
			
	},
	render: function() {
		return(
			<div>
				<input type='username' id='username' value={this.state.username.value} placeholder={'Enter your username'} className={this.getInputClass('username')} onFocus={this.focusHandler} onChange={this.changeHander} />
				<input type='password' id='password' value={this.state.password.value} placeholder={'Enter your password'} className={this.getInputClass('password')} onFocus={this.focusHandler} onChange={this.changeHander} />
				<p id='errorMsg' className={this.state.errorMsg.class}>{this.state.errorMsg.message}</p>			
				<input type='button' value='Login' onClick={this.submitHandler} />		
			</div>
		);
	}
});

var SmartInput = React.createClass({
	getInitialState: function() {
		return {
			value: this.props.value,
			class: ''
		}
	},
	validate: function() {
		if(this.state.value.trim() != '') {
			return true;
		} else {
			this.error();
			return false;
		}
	},
	error: function() {
		this.setState({
			class: 'error'
		});
	},
	textEntered: function(event) {
		this.setState({
			value: event.target.value,
			class: ''
		});
	},
	render: function() {
		return(
			<input type={this.props.type} placeholder={'Enter your ' + this.props.type} className={this.state.class} onChange={this.textEntered} value={this.state.value} />
		)
	}
});

ReactDOM.render(<LoginBox />, document.getElementById('container'));