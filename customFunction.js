function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

function forEachObjectInObject(source_obj, callback) {
	for (var key in source_obj) {
    	// skip loop if the property is from prototype
	    if (!source_obj.hasOwnProperty(key)) continue;

	    var obj = source_obj[key];	    

        console.log(obj);
        callback(obj);
	}
}

exports.isEmpty = isEmpty;
exports.forEachObjectInObject = forEachObjectInObject;