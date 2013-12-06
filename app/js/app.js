'use strict';


// TODO Remove before upload ?
var username = 'admin';
var password = 'district';
var dhisAPI = 'http://apps.dhis2.org/demo';
var orgUnit = "g8upMTyEZGZ";  // ID for Njandama MCHP

var login = 'Basic ' + btoa( username + ":" + password);


var operators = {
    "==" :  0,
    "!=" :  1,
    "<"  :  2,
    "<=" :  3,
    ">"  :  4,
    ">=" :  5
};


/// Services

var skipLogicServices = angular.module( 'skipLogic.services', [] );

skipLogicServices.factory('dhis', ['$http', '$q', function($http, $q) {
   return {
      getData: function( target ) {
         var deferred = $q.defer();

          //Running as app in DHIS, /api/ must be changed to /demo/api/.
         $http.get( '/api/' + target + '.json' )
         .success( function( data, status, headers, config ) {
            deferred.resolve( data );
         })
         .error( function( data, status, headers, config ) {
            alert( "Error getting data:\n" + status );
            deferred.reject();
         });

         return deferred.promise;
      },

   // TODO Actually test this...
      saveData: function( target, data ) {
         var deferred = $q.defer();
         //Running as app in DHIS, /api/ must be changed to /demo/api/.
         $http.post( '/api/' + target, data )
         .success( function( data, status, headers, config ) {
            alert( "Save success\n" + data );
            deferred.resolve( data, status, headers, config );
         })
         .error( function(  data, status, headers, config ) {
            alert( "Save failed\n" + data );
            deferred.reject( data, status, headers, config);
         });
      }
   };
}]);


/// Controllers

var skipLogicControls = angular.module( 'skipLogic.controllers', [] );

skipLogicControls.controller( 'selectProgramCtrl', [ '$scope', 'dhis', function( $scope, dhis ) {

   $scope.getStages = function( index ) {
      $scope.showStages = false;
      $scope.selectedProgramName = $scope.programs.programs[index].name;
      
      dhis.getData( 'programs/' + $scope.programs.programs[index].id )
      .then( function( data ) {
         $scope.programStages = data;
         $scope.showStages = true;
      });
   };

   $scope.showStages = false;

   dhis.getData( 'programs' )
   .then( function( data ) {
      $scope.programs = data;
   });

}]);


skipLogicControls.controller('fillFormCtrl', ['$scope', 'dhis', '$routeParams', function($scope, dhis, $routeParams) {

    // Show/Hide debug output (raw data containers)
    $scope.debug = true;

    $scope.form = {};
    if($scope.form.isSent == null) $scope.form.isSent = false;


    // Skip logic function
    $scope.showQuestion = function( item ) {
        if ( ! item.logic ) {
            item["show"] = true;
        }

        // Loop through fields to check
        for ( var compField in item.logic ) {
            // Loop through fields to find value of field to check
            var compValue;
            for ( var element in $scope.form.programStageDataElements )
                if ( $scope.form.programStageDataElements[ element ].dataElement.id === item.logic[ compField ].compFieldId )
                    compValue = $scope.form.programStageDataElements[ element ].input;
            if ( ! compValue ) {
                item["show"] = false;
                return false;
            }
            // Loop through requirements for field
            for ( var requirement in item.logic[ compField ].requirements ) {
                var reqValue = item.logic[ compField ].requirements[ requirement ].value;

                // Check if requirement is fulfilled for value
                switch( operators[ item.logic[ compField ].requirements[ requirement ].operator ] ) {
                    case operators["=="]:
                        if ( ! ( compValue === reqValue ) ) {
                            item["show"] = false;
                            return false;
                        }
                        break;

                    case operators["!="]:
                        if ( ! ( compValue !== reqValue ) )  {
                            item["show"] = false;
                            return false;
                        }
                        break;

                    case operators["<"]:
                        if ( ! ( Number( compValue ) < Number( reqValue ) ) )  {
                            item["show"] = false;
                            return false;
                        }
                        break;

                    case operators["<="]:
                        if ( ! ( Number( compValue ) <= Number( reqValue ) ) ) {
                            item["show"] = false;
                            return false;
                        }
                        break;

                    case operators[">"]:
                        if ( ! ( Number( compValue ) > Number( reqValue ) ) ) {
                            item["show"] = false;
                            return false;
                        }
                        break;

                    case operators[">="]:
                        if ( ! (Number( compValue ) >= Number( reqValue ) ) )  {
                            item["show"] = false;
                            return false;
                        }
                        break;

                    default:
                        console.log( "Invalid skipLogic operator: " + item.logic[ compField ].requirements[ requirement ].operator );
                }
            }
        }
        item["show"] = true;
        return true;
    };

    // Function for updating form display, ie. calculating skipLogic for each field
    $scope.updateForm = function() {
        for ( var element in $scope.form.programStageDataElements ) {
            $scope.showQuestion( $scope.form.programStageDataElements[ element ] );
        }
    };

    //Function for updating form display, ie. removing previous input.
    $scope.clearForm = function() {
        for ( var element in $scope.form.programStageDataElements ) {
            $scope.form.programStageDataElements[ element ].input = null;
        }
    };

    // Filter for skipLogic - used for filtering questions.
    $scope.show = function(dataElement) {
        return dataElement.show;
    }

    //Function for sending data from form to DHIS and prepare form for new entry
    $scope.deliver = function() {
        $scope.form.isSent = true;
        /*dhis.saveData($scope.form)
            .then( function(report) {
                console.log("Data is sent to DHIS");

            }
        ) */
        $scope.clearForm();
    }




    /* ------- SKIP LOGIC -------- */

    $scope.skipLogic = 
    {
        "programStageId" : "Zj7UnCAulEk",       // Single-Event Inpatient morbidity and mortality
        "fields" : [{
            "id" : "oZg33kd9taw",               // Gender
            "compFields" : [{
                "compFieldId" :"qrur9Dvnyt5",   // Age
                "requirements" : [{
                    "operator" : ">=",          // Comparison operator
                    "value" : 15                // Comparison value
                }]
            }]
        }]
    };

    /* ------- /SKIP LOGIC -------- */

                

    dhis.getData( 'programStages/' + $routeParams.formId )
    .then( function( data ) {
        $scope.form = data;

        // Clojure for getting extra element data
        // (necessary to avoid loop parameter changing while waiting for async return)
        var getDataElement = function( id, saveTo ) {
            dhis.getData( 'dataElements/' + id )
            .then( function( fieldData ) {
                console.log( "Got parameters " + id );
                saveTo["parameters"] = fieldData;
            });
        }

        // Loop through elements
        for ( var x in data.programStageDataElements )  {
            for ( var f in $scope.skipLogic.fields ) {
                // Attach skip Logic if available
                if ( $scope.skipLogic.fields[ f ].id === $scope.form.programStageDataElements[ x ].dataElement.id ) {
                    console.log( "Found skipLogic for " + $scope.form.programStageDataElements[ x ].dataElement.id );
                    $scope.form.programStageDataElements[ x ]["logic"] =
                        $scope.skipLogic.fields[ f ].compFields;
                }
            }
            // Fetch extra data for elements
            getDataElement( data.programStageDataElements[ x ].dataElement.id, $scope.form.programStageDataElements[ x ] );
        };
    })
    .then( function() {
        $scope.updateForm();
    });


}]);

skipLogicControls.controller('editLogicCtrl', ['$scope', 'dhis', '$routeParams', function($scope, dhis, $routeParams) {

   dhis.getData( 'programStages/' + $routeParams.formId )
   .then( function( data ) {
        $scope.form = data;
   });

   // TODO

}]);


/// Application module

var skipLogic =  angular.module('skipLogic', [
    'ngRoute',
    'skipLogic.services',
    'skipLogic.controllers',
]);

skipLogic.config(function($httpProvider) {
    $httpProvider.defaults.headers.common = {
        'Accept': 'application/json, text/plain, * / *',
        'Data': '',
        'Authorization': "Basic YWRtaW46ZGlzdHJpY3Q="
    };
});

skipLogic.config(function($routeProvider) {
    $routeProvider

    .when( '/', {
        controller:     'selectProgramCtrl',
        templateUrl:    'view/selectProgram.html'
    })

    .when( '/fillForm/:formId', {
        controller:     'fillFormCtrl',
        templateUrl:    'view/fillForm.html'
    })

    .when('/editLogic/:formId', {
        controller:     'editLogicCtrl',
        templateUrl:    'view/editLogic.html'
    })

    .otherwise( {
        redirectTo:     '/'
    });
});


//For sending of form, needs proper testing with working proxy/upload to dhis2

//Not working properly, for getting org id for sending form
function getUserOrg() {
    var id;
    $.ajax({
	type : "GET",
	url : "/api/currentUser.json", 
	dataType : "json",
    })
	.fail(function (error) {
	    alert("No user info!");
	})
	.done(function (json) {
	   alert(json.organisationUnits[0].id);
	   id = json.organisationUnits[0].id;
	});
    alert(id);
    return id;
} 

function sendF() {
    var d = new Date();
    //var date = d.getFullYear() + "-" + d.getMonth()+1 + "-" + d.getDate();
    var period = d.getFullYear() + "" + d.getMonth();
    //Missing formID and organiasationID
    var xmlString =  '<?xml version="1.0" encoding="utf-8"?>\n' +
	'<event program="' + 'eBAyeGv0exc' + '" orgUnit="' + 'ImspTQPwCqd' + '" eventDate="' +  period + '" status="COMPLETED" storedBy="admin">\n' +
	'<coordinate latiude="59" longitude="10" />\n' +
	'<dataValues>\n';    
    
    //<!-- Set dataValue dataElement= value= -->
    
    //TEST
    xmlString += '<dataValue dataElement="qrur9Dvnyt5" value="22" />\n' +
	'<dataValue dataElement="oZg33kd9taw" value="Male" />\n' +
	'<dataValue dataElement="msodh3rEMJa" value="2013-05-18" />\n';
    //TEST END

    xmlString +=  '</dataValues>\n</event>'; 
    
    alert(xmlString);
    $.ajax({
	type : "POST",
	data : xmlString,
	contentType : "application/xml",
	url : "http://apps.dhis2.org/demo/api/events",
	dataType : "xml", 
    })
	.fail(function(error) {
	    console.log(error);
	    alert("Sending of form failed!");
	})
	.done(function (xml) {
	    console.log(xml);
	    alert(message);//<!-- Check for return message--->
	});
}
