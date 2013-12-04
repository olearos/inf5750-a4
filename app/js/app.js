'use strict';


// TODO Remove before upload ?
var username = 'admin';
var password = 'district';
var dhisAPI = 'http://apps.dhis2.org/demo';
var orgUnit = "g8upMTyEZGZ";  // ID for Njandama MCHP

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



    $scope.form = [];
    $scope.debug = true;
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

   $scope.urlole = "";
    $scope.oledata = [];
   
   dhis.getData( 'programStages/' + $routeParams.formId )
   .then( function( data ) {
      $scope.master= data;

       $scope.form.name = data.name;
       $scope.form.description = data.description;
       var x = "";
       for(x in data.programStageDataElements)  {
         $scope.urlole = 'dataElements/' + data.programStageDataElements[x].dataElement.id;

         //$scope.contents += $scope.urlole;
         dhis.getData('dataElements/' + data.programStageDataElements[x].dataElement.id)
         .then(function(data) {
            //$scope.contents += data.id + ', ';
            $scope.oledata = data;
            //Will hide "Age"
            if(data.id == "qrur9Dvnyt5" )$scope.oledata['show'] = false;
            else $scope.oledata['show'] = true;

            // TODO: JQuery? - In WebStorm, push seems to be a part of JQuery. (possible problem)
            //$scope.form.push(data);
              $scope.form.push($scope.oledata);
              $scope.master.push($scope.oledata);


         });
      };
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

