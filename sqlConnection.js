var mysql = require("mysql"),
	config = require("./config");


function createConnection () {

	var connection = mysql.createConnection(config.databaseLogin);	

	connection.connect(function(err) {              // The server is either down
		if(err) {                                     // or restarting (takes a while sometimes).
		  console.log('error when connecting to db:', err);
		  setTimeout(createConnection, 2000); // We introduce a delay before attempting to reconnect,
		}                                     // to avoid a hot loop, and to allow our node script to
	});

	connection.on('error', function(err) {
		console.log('db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') { // Connection to the MySQL server is usually
		  createConnection();                         // lost due to either server restart, or a
		} else {                                      // connnection idle timeout (the wait_timeout
		  throw err;                                  // server variable configures this)
		}
	});

	exports.connection = connection;

}

createConnection();

// var db_connection = 'HELLO';
// console.log(db_connection);
// setTimeout(function() {
// 	db_connection = 'GOODBYE';
// 	exports.connection = db_connection;
// 	console.log(db_connection);
// }, 1000);

// exports.connection = db_connection;

