'use strict';


// TODO Remove before upload ?
var username = 'admin';
var password = 'district';
var dhisAPI = 'http://apps.dhis2.org/demo';

var login = 'Basic ' + btoa( username + ":" + password);


/// Services

var skipLogicServices = angular.module( 'skipLogic.services', [] );

skipLogicServices.factory('dhis', ['$http', '$q', function($http, $q) {
   return {
      getData: function( target ) {
         var deferred = $q.defer();

         $http.get( '/api/' + target + '.json' )
            .success( function( data, status, headers, config ) {
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
      'ngRoute',
      'skipLogic.services',
      'skipLogic.controllers',
      ]);

skipLogic.config(function($httpProvider) {
   $httpProvider.defaults.headers.common = {
      'Accept': 'application/json, text/plain, * / *',
      'Data': '',
      'Authorization': "Basic YWRtaW46ZGlzdHJpY3Q="};
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

