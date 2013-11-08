
function getData() {
	var username = "admin";
	var password = "district";

	$.ajax({
		type : "GET",
		url : "/api/currentUser", //programStages.json",

		headers : {
			Authorization: "Basic " + btoa( username + ":" + password ),
		},

		dataType : "json",
	})
	.fail(function (error) {
		alert("OLEerror");
		document.write("<ul>");
		printObject(error);
		document.write("</ul>");
	})
	.done(function (json) {
		document.write("<ul>");
		printObject(json);			
		document.write("</ul>");
	});
}


function printObject(json) {
	$.each(json, function(index, value) {
		if ( typeof value === "object" ) {
			if ( Object.prototype.toString.call( value ) === "[object Array]" ) {
				document.write(index + "<ol>");
				printObject(value);
				document.write("</ol>");
			}
			else if ( value === null ) {
				document.write("<li>" + index + " : NULL!</li>");
			}
			else {
				document.write(index + "<ul>");
				printObject(value);
				document.write("</ul>");
			}
		}
		else {
			document.write("<li>" + index + " : " + value + "</li>");
		}
	});
}

/**
 * For encoding utf8 to b64, btoa() cannot be used directly with utf8
 * (if using input fields and utf8 encoding in browser)
 */
function utf8_to_b64( str ) {
	return btoa(unescape(encodeURIComponent( str )));
}

