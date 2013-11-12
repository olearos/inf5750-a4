
username = "admin";
password = "district";


function LoginCtrl( $scope ) {
   $scope.login = function() {
      ajaxFetch( "currentUser" )
         .success( function() {
            ajaxFetch( "programStages.json" );
            // populate ??
         })
         .fail( function() {
            $scope.loginError = "Login failed, please try again";
         });
   }
}



/*
module.factory( 'myService', function( $http ) {
   return {
       getFoos: function() {
           //return the promise directly.
           return $http.get( '/foos' )
              .then( function( result ) {
                  //resolve the promise as the data
                  return result.data;
              });
       }
   }
});


module.controller( 'MyCtrl', function( $scope, myService ) {
   $scope.foos = myService.getFoos().then( function( foos ) {
      $scope.foos = foos;
   });
});


// Old school ajax(?)
function ajaxFetch( target ) {
   var xhReq = new CMLHttpRequest();
   xhReq.open( "GET", "/api/" + target, false );
   xhReq.setRequestHeader( "Authorization", "Basic " + btoa( username + ":" + password ) )
   xhReq.send();
   var serverResponse = JSON.parse(xhReq.responseText);
}


function saveCredentials() {
   username = $username;
   password = $password;
}

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

/*


/**
 * For encoding utf8 to b64, btoa() cannot be used directly with utf8
 * (if using input fields and utf8 encoding in browser)
 */
function utf8_to_b64( str ) {
	return btoa(unescape(encodeURIComponent( str )));
}

