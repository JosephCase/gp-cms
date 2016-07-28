// if (typeof String.prototype.endsWith !== 'function') {
// 	console.log("not a function");
//     String.prototype.endsWith = function(suffix) {
//         return this.indexOf(suffix, this.length - suffix.length) !== -1;
//     };
// }


function route(handle, pathname, response, request) {
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response, request);
	} else {
		handle['file'](response, pathname);
	}
}

exports.route = route;