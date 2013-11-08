
function getData() {
    //alert("Hva");
    //window.open("http://apps.dhis2.org/demo/api/attributeTypes.json");
    document.write("<p>This is a paragraph</p>");
    
    authenticate();
    
    $.ajax({
	type: "GET",
	dataType: "jsonp",
	url: "http://apps.dhis2.org/demo/api/attributeTypes.jsonp",
    })
    
	.done(function(json) {
	    printData(json);
	})
    
	.fail(function() {
	    alert("Something went wrong!");
	});
    document.write("<p>END</p>");
}

function authenticate() {
    //var xhRequest = new XMLHttpRequest();
    //xhRequest.open('POST', 'http://apps.dhis2.org/demo/dhis-web-commons-security/login.action', true, "admin", "district");
    //xhRequest.setRequestHeader("Content-type", "text/javascript");
    //xhRequest.withCredentials = "true";
    //xhRequest.send("j_username=admin&j_password=district");
    //xhRequest.send();
    //console.log(xhRequest);

    var username = "admin";
    var password = "district";
    var tok = username + ':' + password;
    var hash = btoa(tok);
    
    $.ajax({
	type: "POST",
	url:"/api/currentUser",
	data:"jsonp",	

	headers: {
	    Authorization: "Basic " + hash,
	},
	
    })

	.done(function(json) {
	    printData(json);
	})
	.fail(function() {
	    alert("Something went wrong 2!");
	});
    
    //jQuery(document).ready(function() {
//	$.post("http://apps.dhis2.org/demo/dhis-web-commons-security/login.action",{
//	    j_username: "admin", j_password: "district"
//	}
  //     );
    //});
}


function printData(json) {
    //localStorage.setItem('json_test', JSON.stringify(json));
    console.log(json); 
}


