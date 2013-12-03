'use strict';


// TODO Remove before upload ?
var username = 'admin';
var password = 'district';
var dhisAPI = 'http://apps.dhis2.org/demo';
// console.log('API: '+dhisAPI);

var login = 'Basic ' + btoa( username + ":" + password);


/// Services

var skipLogicServices = angular.module( 'skipLogic.services', [] );

skipLogicServices.factory('dhis', ['$http', '$q', function($http, $q) {
   return {
      getData: function( target ) {
         var deferred = $q.defer();

         $http.get( '/api/' + target + '.json' )
            .success( function( data, status, headers, config ) {
//               console.log( data );
               deferred.resolve( data );
            }).error( function( data, status, headers, config ) {
                  alert( "Error getting data:\n" + status );
            });
         return deferred.promise;
      }
   };
}]);


/// Controllers

var skipLogicControls = angular.module( 'skipLogic.controllers', [] );

skipLogicControls.controller( 'selectProgramCtrl', [ '$scope', 'dhis', function( $scope, dhis ) {

   $scope.getStages = function( index ) {
      $scope.programStages = "";
      $scope.selectedProgramName = $scope.programs.programs[index].name;
      $scope.showStages = true;
      
      dhis.getData( 'programs/' + $scope.programs.programs[index].id )
         .then( function( data ) {
            $scope.programStages = data;
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

    //When form is OK, copy contents to master.
    $scope.master= {};

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

    // var formid = "http://apps.dhis2.org/demo/api/programStages/Zj7UnCAulEk.json";

    //http://localhost/api/programStages/Zj7UnCAulEk.json
   dhis.getData( 'programs/' + $routeParams.formId )
      .then( function( data ) {
      $scope.form = data;
      $scope.master = data;
   });

/*
      $http({
         url: // dhisAPI +
            '/api/programs/' + $routeParams.formId + '.json',
>>>>>>> eb105d37af1be8cf69e3502b716de713a15a537c
         method: "GET",
         dataType: "json",
         accept: "text/json",
         withCredentials: "true",
         headers: {
            'Authorization': "Basic YWRtaW46ZGlzdHJpY3Q=" // login
         }
      }).success( function(data) {
         console.log(data);
         $scope.form = data;
         $scope.master = data;

      });
*/
   // TODO


   }]);

skipLogicControls.controller('editLogicCtrl', ['$scope', 'dhis', '$routeParams', function($scope, dhis, $routeParams) {

   dhis.getData( 'programs/' + $routeParams.formId )
      .then( function( data ) {
      $scope.form = data;
   });

   // TODO

   }]);


/// Application module

var skipLogic =  angular.module('skipLogic', [
//      'ngResource',
      'ngRoute',
      'skipLogic.services',
      'skipLogic.controllers',
      ]);

// Configure HTTP headers, this actually works, apart for Authorization :S
skipLogic.config(function($httpProvider) {
   $httpProvider.defaults.headers.common = {
      'Accept': 'application/json, text/plain, * / *',
      'Data': '',
      'Authorization': "Basic YWRtaW46ZGlzdHJpY3Q="}; // login};
});

skipLogic.config(function($routeProvider) {
      $routeProvider

        .when('/',
            {controller: 'selectProgramCtrl',
               templateUrl: 'view/selectProgram.html'})

         .when('/fillForm/:formId',
            {controller: 'fillFormCtrl',
               templateUrl: 'view/fillForm.html'})

         .when('/editLogic/:formId',
            {controller: 'editLogicCtrl',
               templateUrl: 'view/editLogic.html'})

         .otherwise({redirectTo:'/'});
   });



//// Clutter/tests that does not work

// (Services)

/* // Does not work, can't get ngResource to use headers at all
skipLogicServices.factory( 'dhisResourceApi', function($resource) {
         console.log("Factory");
         var api = $resource(
            //dhisAPI +
               '/api/:id.json',
            {}, // {callback:'JSON_CALLBACK'},
            // TODO Remove headers before upload
            {
               get: {
                     method:'JSONP',
                     headers: {
                        authorization: "Basic YWRtaW46ZGlzdHJpY3Q="
                     }
               },
               save: {
                  method:'POST',
                  headers: {
                     authorization: login
                  }
               }
            }
            );
         return api;
      });
*/

/* // Does not work, headers are not used when http is used through a service
skipLogicServices.factory( 'dhisHttpApi', function($http) {
      return {
         fetch: function(callback) {
            $http({
               method: "JSONP",
               url: // dhisAPI +
                  '/api/programStages.json'// , // + id + '.json',
            })
            .success(callback);
         }
      };
});
*/


// (Controllers)

/* // Does not work with headers, not even trough reverseproxy
skipLogicControls.controller('selectFormCtrl', ['$scope', '$resource', function($scope, $resource) {
   var X = $resource(
      //dhisAPI +
         '/api/:id.json',
      {}, // {callback:'JSON_CALLBACK'},
      // TODO Remove headers before upload
      {
         get: {
               method:'JSONP',
               headers: {
                  authorization: "Basic YWRtaW46ZGlzdHJpY3Q="
               }
         }
      }
      );

   X.get({id:'programStages'}, function(result) {
      $scope.dhisResult = result.programStages;
   });
}]);
*/


/* // 
skipLogicControls.controller('selectFormCtrl', ['$scope', '$http', 'dhisHttpApi', function($scope, $http, dhisHttpApi) {
   dhisHttpApi.fetch(function(results) { //'programStages', function(results) {
      $scope.dhisResult = results.programStages;
   });
}]);
*/

/* // This has worked (not this particular implementation, but the service is currently broken. Headers are disfunctional.
skipLogicControls.controller('selectFormCtrl', ['$scope', '$http', 'dhisResourceApi', function($scope, $http, dhisResourceApi) {
   console.log("Controller");
   dhisResourceApi.get({id: 'programStages'}, function(data) {
      console.log(data);
      $scope.dhisResult = data.programStages;
   });
//   var Api = dhisResourceApi();
//   Api.action({});
}]);
*/



//// Everything below here are notes

/*
   $scope.dhisResult = [
   {name:"A"},
   {name:"B"},
   {name:"C"}
   ];*/
//}


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
*/
