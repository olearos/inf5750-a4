'use strict';


// TODO Remove before upload
var username = 'admin';
var password = 'district';
var dhisAPI = 'http://apps.dhis2.org/demo';
// console.log('API: '+dhisAPI);

var login = 'Basic ' + btoa( username + ":" + password);


/// Services

var skipLogicServices = angular.module( 'skipLogic.services', ['ngResource'] );

// Does not work
skipLogicServices.factory( 'dhisResourceApi', function($resource) {
         var api = $resource(
            /*dhisAPI +*/ '/x_api/:id.json',
            {}, // {callback:'JSON_CALLBACK'},
            // TODO Remove headers before upload
            {
               get: {
                     method:'JSONP',
                     headers: {
                        authorization: login
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

skipLogicServices.factory( 'dhisHttpApi', ['$http', function($http) {
      var api = {
         fetch: function(id) {
            return $http.jsonp({
//               method: "JSONP",
               url: dhisAPI + '/api/' + id /*'programStages'*/ + '.json',
//               dataType: "json",
               headers: {
                  "Authorization": login
               }
            }).success(function(data, status, headers, config) {
                  return data;
            }).failure(function(data, status, headers, config) {
                  return status; // alert("API failure");
            });
         }
      };
      return api;
}]);



/// Controllers

var skipLogicControls = angular.module('skipLogic.controllers', []);

// This works apart from sending auth header
skipLogicControls.controller('selectFormCtrl', ['$scope', '$http', function($scope, $http) {

      $http({
         url: dhisAPI + '/api/programStages' + '.json',
         method: "GET",
         dataType: "json",
         accept: "text/json",
         withCredentials: "true",
         headers: {
            'Authorization': "Basic YWRtaW46ZGlzdHJpY3Q=" // login
         }
      }).success( function(data) {
         console.log(data);
         $scope.dhisResult = data.programStages;
      });
}]);

/*
// This is a mess, has never worked
skipLogicControls.controller('selectFormCtrl', ['$scope', '$http', 'dhisHttpApi', function($scope, $http, dhisHttpApi) {

      $http({
         url: dhisAPI + '/api/programStages' + '.json',
         method: "JSONP",
         dataType: "text/json",
//         headers: {
//            Authorization: login
//        }
      }).success( function(data) {
         $scope.dhisResult = data;
      });
//      response = dhisApi.fetch('programStages')
//   .then( function(data) { // (function(response) {
//         $scope.dhisResult = data; // data; //.results;
//   }, function(data) {
//      alert("API failure");
//   });
   //   }) //, function() {
//         console.log("Error: Not logged in");
      }]);
//   }]);


// This has worked (not this particular implementation, but the service is currently broken. Headers are disfunctional.
skipLogicControls.controller('selectFormCtrl', ['$scope', '$http', 'dhisResourceApi', function($scope, $http, dhisResourceApi) {
   console.log("Controller");
   dhisResourceApi({id: 'programStages'}, function(data) {
      console.log(data);
      $scope.dhisResult = data.programStages;
   });
//   var Api = dhisResourceApi();
//   Api.action({});
}]);
*/

skipLogicControls.controller('fillFormCtrl', ['$scope', 'dhisApi', function($scope) {
   // TODO
   }]);

skipLogicControls.controller('editLogicCtrl', ['$scope', 'dhisApi', function($scope) {
   // TODO
   }]);



/// Application module

var skipLogic =  angular.module('skipLogic', [
//      'ngResource',
      'ngRoute',
      'skipLogic.controllers',
      'skipLogic.services']);

// Configure HTTP headers, this actually works, apart for Authorization :S
skipLogic.config(function($httpProvider) {
   $httpProvider.defaults.headers.common = {
      'Accept': 'application/json, text/plain, * / *',
      'Data': '',
      'Authorization': "Basic YWRtaW46ZGlzdHJpY3Q="}; // login};
   console.log($httpProvider.defaults);
});

skipLogic.config(function($routeProvider) {
      $routeProvider

        .when('/',
            {controller: 'selectFormCtrl',
               templateUrl: 'view/selectForm.html'})

         .when('/fillForm/:formId',
            {controller: 'fillFormCtrl',
               templateUrl: 'view/fillForm.html'})

         .when('/editLogic/:formId',
            {controller: 'editLogicCtrl',
               templateUrl: 'view/editLogic.html'})

         .otherwise({redirectTo:'/'});
   });




// Everything below here are notes

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
