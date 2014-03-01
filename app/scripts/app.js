'use strict';

var app = angular.module('casApp', [
  'ui.bootstrap',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'restangular'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .when('/login', {
        templateUrl: 'views/main.html',
        controller: 'LoginCtrl'
      })
      .when('/logout', {
        templateUrl: 'views/main.html',
        controller: 'LogoutCtrl'
      })
      .when('/developer', {
        templateUrl: 'views/developer.html',
        controller: 'DeveloperCtrl'
      })
      .when('/device', {
        templateUrl: 'views/device.html',
        controller: 'DeviceCtrl'
      })
      .when('/software', {
        templateUrl: 'views/software.html',
        controller: 'SoftwareCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }).run( function($rootScope, $location) {
    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      if(!$rootScope.loggedIn
        && next.templateUrl
        && (next.templateUrl.indexOf('main.html') === -1) && (next.templateUrl.indexOf('about.html') === -1)) {
        $location.path( "/" );
      }         
    });
 });

// http://stackoverflow.com/questions/12864887/angularjs-integrating-with-server-side-validation

app.directive('uniqueUsername', ['$http', function($http) {  
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      scope.busy = false;
      scope.$watch(attrs.ngModel, function(value) {
        
        // hide old error messages
        ctrl.$setValidity('isTaken', true);
        ctrl.$setValidity('invalidChars', true);
        
        if (!value) {
          // don't send undefined to the server during dirty check
          // empty username is caught by required directive
          return;
        }
        
        scope.busy = true;
        $http.post('/signup/check/username', {username: value})
          .success(function(data) {
            // everything is fine -> do nothing
            scope.busy = false;
          })
          .error(function(data) {
            
            // display new error message
            if (data.isTaken) {
              ctrl.$setValidity('isTaken', false);
            } else if (data.invalidChars) {
              ctrl.$setValidity('invalidChars', false);
            }

            scope.busy = false;
          });
      })
    }
  }
}]);

// http://codepen.io/brunoscopelliti/pen/ECyka

app.directive('match', [function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {
      
      scope.$watch('[' + attrs.ngModel + ', ' + attrs.match + ']', function(value){
        ctrl.$setValidity('match', value[0] === value[1] );
      }, true);

    }
  }
}]);

app.factory('FileReader', function ($q, $log) {

    var onLoad = function(reader, deferred, scope) {
      return function () {
        scope.$apply(function () {
          deferred.resolve(reader.result);
        });
      };
    };

    var onError = function (reader, deferred, scope) {
      return function () {
        scope.$apply(function () {
          deferred.reject(reader.result);
        });
      };
    };

    var onProgress = function(reader, scope) {
      return function (event) {
        scope.$broadcast("fileProgress",
        {
          total: event.total,
          loaded: event.loaded
        });
      };
    };

    var getReader = function(deferred, scope) {
      var reader = new FileReader();
      reader.onload = onLoad(reader, deferred, scope);
      reader.onerror = onError(reader, deferred, scope);
      reader.onprogress = onProgress(reader, scope);
      return reader;
    };

    var readAsDataURL = function (file, scope) {
      var deferred = $q.defer();
      
      var reader = getReader(deferred, scope);         
      reader.readAsDataURL(file);
      
      return deferred.promise;
    };

    var readAsBinaryString = function (file, scope) {
      var deferred = $q.defer();
      
      var reader = getReader(deferred, scope);         
      reader.readAsBinaryString(file);
      
      return deferred.promise;
    };

    return {
      readAsDataUrl: readAsDataURL, 
      readAsBinaryString: readAsBinaryString 
    }
});
