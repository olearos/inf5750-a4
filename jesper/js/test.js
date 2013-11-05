
function getData() {
    //alert("Hva");
    //window.open("http://apps.dhis2.org/demo/api/attributeTypes.json");
    document.write("<p>This is a paragraph</p>");
    
    //authenticate();

    $.ajax({
	type: "GET",
	//dataType: "json",
	url: "http://apps.dhis2.org/demo/api/attributeTypes.json",
    })

	.done(function(json) {
	    printData(json);
	})
    
	.fail(function() {
	    alert("Something went wrong!");
	});
    document.write("<p>END</p>");
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

function printData(json) {
    console.log(json); 
}


