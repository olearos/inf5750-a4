'use strict';

/// Org unit for use with uploads as selection of this is not implemented
var orgUnit = "g8upMTyEZGZ";  // ID for Njandama MCHP

/// Skip logic operators
var operators = {
    "==" :  0,
    "!=" :  1,
    "<"  :  2,
    "<=" :  3,
    ">"  :  4,
    ">=" :  5
};


/// Workaround for the url local vs uploaded problematic
// TODO Test after upload
var getHostApiUrl = function() {
    if ( window.location.host === "localhost" )
        return "";
    else
        return "/demo";
    // TODO Find more versatile approach, app should be uploadable and usable to any dhis instance
}


//      - - Services - -

var skipLogicServices = angular.module( 'skipLogic.services', [] );

skipLogicServices.factory('dhis', ['$http', '$q', function($http, $q) {
    return {
        getData: function( target ) {
            var deferred = $q.defer();

            $http.get( getHostApiUrl() + '/api/' + target + '.json' )
            .success( function( data, status, headers, config ) {
                deferred.resolve( data );
            })
            .error( function( data, status, headers, config ) {
                alert( "Error getting data:\n" + status );
                deferred.reject();
            });

            return deferred.promise;
        },

        saveData: function( target, data ) {
            var deferred = $q.defer();

          /* -------- SAMPLE DATA ENTRY --------- */
/*
            var payload = {
                  "program": "eBAyeGv0exc",
                  "orgUnit": "DiszpKrYNg8",
                  "eventDate": "2013-05-17",
                  "status": "COMPLETED",
                  "storedBy": "admin",
                  "coordinate": {
                      "latitude": "59.8",
                      "longitude": "10.9"
                  },
                  "dataValues": [
                      { "dataElement": "qrur9Dvnyt5", "value": "22" },
                      { "dataElement": "oZg33kd9taw", "value": "Male" },
                      { "dataElement": "msodh3rEMJa", "value": "2013-05-18" }
                  ]
            };

          //data = payload;
*/
          /* -------- /SAMPLE DATA ENTRY --------- */

            var headers = "Content-Type:application/json";

            $http.post( getHostApiUrl() + '/api/' + target, data )
            .success( function( data, status, headers, config ) {
//                alert( "Save success\n" + angular.toJson(data) );
                deferred.resolve( data, status, headers, config );
            })
            .error( function(  data, status, headers, config ) {
                alert( "Communication error while saving: " + status + "\nPlease try again!\n\n" + data );
                deferred.reject( data, status, headers, config);
            });

            return deferred.promise;
        },

        applySkipLogic: function( form ) {

            // TODO Load skipLogic from dhis

            /* ------- SKIP LOGIC -------- */

            var skipLogic =
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

            // Loop through elements
            for ( var x in form.programStageDataElements )  {
                for ( var f in skipLogic.fields ) {
                    // Attach skip Logic if available
                    if ( skipLogic.fields[ f ].id === form.programStageDataElements[ x ].dataElement.id ) {
                        console.log( "Found skipLogic for " + form.programStageDataElements[ x ].dataElement.id );
                        form.programStageDataElements[ x ]["logic"] =
                            skipLogic.fields[ f ].compFields;
                    }
                }
            };
        },

        extractSkipLogic: function( form ) {
            var skipLogic = {};

            var hasLogic = false;

            skipLogic[ "programStageId" ] = form.program.id;
            skipLogic[ "fields" ] = new Array();
            for ( var x in form.programStageDataElements )  {
                if ( form.programStageDataElements[ x ].logic ) {
                    console.log( "Found skipLogic for " + form.programStageDataElements[ x ].dataElement.id );
                    skipLogic.fields.push( angular.copy( form.programStageDataElements[ x ].logic[ 0 ] ) );
                    hasLogic = true;
                }
            };
            
            if ( hasLogic ) return skipLogic;
            else return "";
        }
    };
}]);


//      - - Controllers - -

var skipLogicControls = angular.module( 'skipLogic.controllers', [] );

skipLogicControls.controller( 'selectProgramCtrl', [ '$scope', 'dhis', function( $scope, dhis ) {

   $scope.getStages = function( program ) {
      $scope.showStages = false;
      $scope.selectedProgramName = program.name;
      
      dhis.getData( 'programs/' + program.id )
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


skipLogicControls.controller('fillFormCtrl', ['$scope', 'dhis', '$routeParams', '$filter', function($scope, dhis, $routeParams, $filter) {

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
        $scope.payload = {};

        $scope.form.isSent = true;

        /* ---- Generate entry ----- */
        var d = new Date();
        var dateString = $filter( 'date' )( d, "yyyy-MM-dd" ); //  d.getDay() + "-" + d.getMonth() + "-" + d.getFullYear();
        var dataValues = {};
        for(var element in $scope.form.programStageDataElements) {
            dataValues = {"dataElement":  + $scope.form.programStageDataElements[element].dataElement.id , "value":  + $scope.form.programStageDataElements[element].input};
        }
        //dataValues = dataValues.substr(0, dataValues.length -1);

        $scope.payload = {
            "program": "eBAyeGv0exc",
            "orgUnit": orgUnit,//DiszpKrYNg8,
            "eventDate": dateString,
            "status": "COMPLETED",
            "storedBy": "admin",
            "coordinate": {
                "latitude": "59.8",
                "longitude": "10.9"
            },
            "dataValues": [
                /*{ "dataElement": "qrur9Dvnyt5", "value": "22" },
                { "dataElement": "oZg33kd9taw", "value": "Male" },
                { "dataElement": "msodh3rEMJa", "value": "2013-05-18" } */
                dataValues
            ]
        };

        //$scope.payload = dataValues;
        dhis.saveData("/events/" , $scope.payload)
        .then( function() {
            // TODO Check if return data indicates success or not
            console.log("Data is sent to DHIS");
            // TODO Only clear form if submission is successful
            $scope.clearForm();
        });
        // TODO Handle submission connection/transfer errror
    }


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

        dhis.applySkipLogic( data );

        // Loop through elements
        for ( var x in data.programStageDataElements )  {
            // Fetch extra data for elements
            getDataElement( data.programStageDataElements[ x ].dataElement.id, $scope.form.programStageDataElements[ x ] );
        };
    })
    .then( function() {
        $scope.updateForm();
        $scope.skipLogic = dhis.extractSkipLogic( $scope.form );
    });


}]);

skipLogicControls.controller('editLogicCtrl', ['$scope', 'dhis', '$routeParams', function($scope, dhis, $routeParams) {

   dhis.getData( 'programStages/' + $routeParams.formId )
   .then( function( data ) {
        $scope.form = data;
   });

    /*
      Example Format on input
      programStageId: Zj7UnCAulEk
         fields: [      
            id: oZg33kd9taw      
	    fieldName: testField       
	    testFelt: 12345
     */
    
    $scope.inputText = []; 
    
    $scope.updateText = function() {
	//Sensitive on input, see example above
	var t1, t2, t3;
	var tmp, tmp2;
	$scope.newLogic = {};
	var tmpAr = $scope.inputText.split('\n');
	//Loop through for setting testlogic
	for (tmp = 0; tmp < tmpAr.length; tmp++) {  
	    t1 = tmpAr[tmp].replace(/^\s+|\s+/g, '');
	    if (t1.indexOf("[") != -1) {
		t2 = t1.replace(/\[/g, '');
		var fields = [];
		var ins = {};
		for(tmp2 = tmp+1; tmp2 < tmpAr.length; tmp2++) { 
		    t3 = tmpAr[tmp2].replace(/^\s+|\s+/g, '');
		    console.log("t3: " + t3);
		    if (t3.indexOf("[") != -1) {
			//do something
		    }else if (t3.indexOf(":") != -1){		
			var z = t3.split(":");
			var x = z[0].replace(/^\s+|\s+/g, '');
			var y = z[1].replace(/^\s+|\s+/g, '');
			if(x.indexOf("id") != -1) {
			    ins.id = y;
			} else if (x.indexOf("fieldName")) {
			    ins.fieldName = y;
			}else if (x.indexOf("testFelt")){
			    ins.testFelt = y;
			}
		    }else {
			tmp = tmp2;
			break;
		    }
		}
		fields.push(ins);
		$scope.newLogic.fields = fields; 
		tmp = tmp2;
	    }else if (t1.indexOf[":"] != -1){
		var c = t1.split(":");
		var a = c[0].replace(/^\s+|\s+/g, '');
		var b = c[1].replace(/^\s+|\s+/g, '');
		$scope.newLogic.programStageId = b;
	    }
	}
	console.log($scope.newLogic);
	console.log($scope.newLogic.fields[0].id);
    }

}]);


//      - - Application module - -

var skipLogic =  angular.module('skipLogic', [
    'ngRoute',
    'skipLogic.services',
    'skipLogic.controllers',
]);

/// Adds basic http authorization
// ( should not be neccesary if launched from logged in dhis instance )
skipLogic.config(function($httpProvider) {
    $httpProvider.defaults.headers.common = {
        'Accept': 'application/json, text/plain, * / *',
        'Data': '',
        'Authorization': "Basic YWRtaW46ZGlzdHJpY3Q="  // 'Basic ' + btoa( 'admin' + ":" + 'district' );
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
