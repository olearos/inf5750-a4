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
//get data from form.

    // Skip logic function
    $scope.showQuestion = function( item ) {
        if ( ! item.logic )
            return true;

        // TODO check if requirements for item are fulfilled
        // return false for first found mismatch
        for ( var compField in item.logic ) {

            var compValue = $scope.contents[ compField ];
            if ( ! compValue ) return false;

            for ( var requirement in item.logic[ compField ].requirements ) {

                var reqValue = item.logic[ compField ].requirements[ requirement ].value;
                console.log( "showQuestion: " + compValue + " " + item.logic[ compField ].requirements[ requirement ].operator + " " + reqValue );

                switch( operators[ item.logic[ compField ].requirements[ requirement ].operator ] ) {
                    case operators["=="]:
                        if ( ! compValue === reqValue ) return false;
                        break;
                    case operators["!="]:
                        if ( ! compValue !== reqValue ) return false;
                        break;
                    case operators["<"]:
                        if ( ! compValue < reqValue ) return false;
                        break;
                    case operators["<="]:
                        if ( ! compValue <= reqValue ) return false;
                        break;
                    case operators[">"]:
                        if ( ! compValue > reqValue ) return false;
                        break;
                    case operators[">="]:
                        if ( ! compValue >= reqValue ) return false;
                        console.log( "showQuestion recieved >= operator" );
                        break;
                    default:
                        console.log( "Invalid skipLogic operator" );
                }
            }
        }

        return true;
    };

    $scope.form = {};
    $scope.debug = true;
// Form is now the data shown, master is used only to display raw json from request
    $scope.master= [];

    //Holds contents from form.
    $scope.contents= {};

    //Will update master with data form contents
    $scope.update = function(contents) {
        $scope.master= angular.copy(contents);
    };

    //Will empty contents.
    $scope.reset = function() {
        $scope.contents = {};
    };

    //TODO: Remove? Currently unused
    $scope.show = function(dataElement) {
        return dataElement.show;
    }

    // var formid = "http://apps.dhis2.org/demo/api/programStages/Zj7UnCAulEk.json";

    //http://localhost/api/programStages/Zj7UnCAulEk.json
    /*dhis.getData( 'programs/' + $routeParams.formId )
      .then( function( data ) {
      $scope.form = data;
      $scope.master = data;
    });*/

//    $scope.urlole = "";
    $scope.oledata = [];
    $scope.temp = {};

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
//        $scope.master = data;

        $scope.form = data;

        // Loop through elements
        for ( var x in data.programStageDataElements )  {
            console.log( "Looping through x=" + x );

            // Check if skipLogic exists for element, add as logic key
            for ( var f in $scope.skipLogic.fields ) {
                if ( $scope.skipLogic.fields[ f ].id === $scope.form.programStageDataElements[ x ].dataElement.id ) {
                    console.log( "Found skipLogic for " + $scope.form.programStageDataElements[ x ].dataElement.id );
                    $scope.form.programStageDataElements[ x ]["logic"] =
                        $scope.skipLogic.fields[ f ].compFields;
                    console.log( "Added logic: " + $scope.skipLogic.fields[ f ].compFields );
                }
            }

            // Fetch extra element data
            dhis.getData( 'dataElements/' + data.programStageDataElements[ x ].dataElement.id )
            .then( function( fieldData ) {
                // Store extra element data as parameters
                // FIXME This gets called every time, but the variable x has been updated to 5 (max) when the calls return.
                // Results are overwritten, probably a chance result of which we end up with
                console.log( "Got parameters " + x );
                $scope.form.programStageDataElements[ x ]["parameters"] = fieldData;


                //$scope.contents += data.id + ', ';
                //$scope.oledata = data;
                //Will hide "Age"
/*                if ( data.id == "XXXqrur9Dvnyt5" )
                    $scope.oledata['show'] = false;
                else
                    $scope.oledata['show'] = true;
*/
                //$scope.oledata['skipLogic'] = $scope.skipLogic[data.id];
    // JQuery? - In WebStorm, push seems to be a part of JQuery. (possible problem)
    // A: .push is a js function, but only for arrays (?)
    // $scope.form.push -> ok, because form is an array
    // $scope.master.push -> fail, because master is an object


//                $scope.form.push($scope.oledata);
//                $scope.master.push($scope.oledata);


            });
        };
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
