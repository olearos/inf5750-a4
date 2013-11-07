
function getData() {
    //window.open("http://apps.dhis2.org/demo/api/attributeTypes.json");
//    document.write("<p>This is a paragraph</p>");
    
    //authenticate();


//	var login = btoa("admin:district");
//	document.write("<p>" + login + "</p>");

//	window.open("/api/programStages.json");

	document.write("<ul>");

	$.ajax({
		type: "GET",
		url: "/api/programStages.json",

		// For authorization to DHIS, untested
/*		headers: {
			Authorization: login, //  "YWRtaW46ZGlzdHJpY3Q=" // btoa("admin:district")
		},
*/
		dataType: "json",
	})
	.fail(function (error) {
		alert("OLEerror");
		printObject(error);
	})
	.done(function (json) {
		printObject(json);			
	});
	
	document.write("</ul>");

/*
    $.ajax({
//		url: "api/attributeTypes.json",
		url: "http://ip.jsontest.com/?callback=showMyIP",
		type: "GET",
	
		success: function(json) {
			document.write("<p>" + json + "</p>");
//		    printData(json);
		},
		
		error: function() {
	    	alert("Something went wrong!\n");
		},
	});
*/		
//    document.write("<p>END</p>");
}

//function authenticate() {
//    jQuery(document).ready(function() {
//	$.post("http://apps.dhis2.org/demo/dhis-web-commons/security/login.action",{
//	    j_username: "admin", j_password: "district"
//	});
  //  });
//}

//function authenticate() {
//    jQuery(document).ready(function() {
//	$.post("http://apps.dhis2.org/demo//dhis-web-commons-security/login.action?authOnly=true",{
//	    j_username: "admin", j_password: "district"
//	});
//    });
//}


function printObject(json) {
	console.log("printObject");

	$.each(json, function(index, value) {
		if ( typeof value === "object" ) {
			if ( Object.prototype.toString.call( value ) === "[object Array]" ) {
				console.log("Array");
				document.write(index + "<ol>");
				printObject(value);
				document.write("</ol>");
			}
			else if ( value === null ) {
				console.log("Null");
			}
			else {
				console.log("object");
				document.write(index + "<ul>");
				printObject(value);
				document.write("</ul>");
			}
		}
		else {
			console.log("Value");
			document.write("<li>" + index + " : " + value + "</li>");
		}
	});
}

/**
 * For encoding utf8 to b64, btoa() cannot be used with utf8
 * (if using input fields)
 */
function utf8_to_b64( str ) {
	return btoa(unescape(encodeURIComponent( str )));
}

