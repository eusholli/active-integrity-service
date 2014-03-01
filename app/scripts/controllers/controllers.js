'use strict';

app.controller('MainCtrl', function ($rootScope, $scope, $location) {
  console.log("MainCtrl");
  if($rootScope.loggedIn){
    $location.path('/developer');
  } 
});

app.controller('LoginCtrl', function ($rootScope, $scope, $location) {
  console.log("LoginCtrl");
  $location.path('#/developer');
  $rootScope.loggedIn = true;
});

app.controller('LogoutCtrl', function ($rootScope, $scope, $location) {
  console.log("LogoutCtrl");
  $location.path('#/');
  $rootScope.loggedIn = false;
});

app.controller('DeveloperCtrl', function ($scope) {
    console.log("DeveloperCtrl");
  });

/*app.factory('DeviceService', function($resource) {
  return $resource('/api/v1/devices/:id')
});*/

app.factory('DeviceService', ['$resource', function($resource) {
  return $resource('/api/v1/devices/:id', { id: '@_id' },
    {
        'update': { method:'PUT' }
    });
}]);

app.controller('DeviceCtrl', function($scope, $location, DeviceService, Restangular) {
  
  console.log("DeviceCtrl");

  DeviceService.query({active : true}, function(devices){
    $scope.devices = devices;
  });

  $scope.deviceHistory = function(device) {
    DeviceService.query({name : device.name}, function(devices){
      $scope.devices = devices;
    });
  }

  $scope.createDevice = function(device) {
    $scope.device = {name: '', type: '', hash: ''};
  };

  $scope.editDevice = function(device) {
    $scope.device = {_id: device._id, name: device.name, type: device.type, hash: device.hash};
  };

  $scope.update = function(device) {

    device.active = false;

    var oldDevice = new DeviceService(device);
    oldDevice.$delete(function(oldDevice, putResponseHeaders) {
      var newDevice = {name: oldDevice.name, type: oldDevice.type, hash: oldDevice.hash};

      newDevice = new DeviceService($scope.device);
      newDevice = newDevice.$save(function(newDevice, putResponseHeaders) {
        DeviceService.query({active : true}, function(devices){
          $scope.devices = devices;
        });
      });  
    });  
  };

  $scope.save = function() {

    var newDevice = new DeviceService($scope.device);
    newDevice = newDevice.$save(function(newDevice, putResponseHeaders) {
      DeviceService.query({active : true}, function(devices){
        $scope.devices = devices;
      });
    });  
  };

  $scope.delete = function(device) {
    device.active = false;
    var newDevice = new DeviceService(device);
    newDevice.$delete();  
    DeviceService.query({active : true}, function(devices){
      $scope.devices = devices;
    });
  };
});

app.controller('AboutCtrl', function ($scope) {
    console.log("AboutCtrl");
  });

app.controller('SoftwareCtrl', function ($rootScope, $scope, FileReader, Restangular) {
    console.log("SoftwareCtrl");

    $scope.selectFile = function() {
    	console.log("SoftwareCtrl selectFile");
    	var fileName = $scope.fileinput.replace(/^.*[\\\/]/, '')
    	$scope.content = "File Selected: " + fileName; 			
    };

    $scope.createAction = function(){

    	if(!$rootScope.restangular){
    		$rootScope.restangular = Restangular.all('api/v1');
    	}

    	var restangular = $rootScope.restangular;

    	var newAction = {
    		content : $scope.content,
    		passphrase : $scope.passphrase
    	}

    	var action = restangular.post(newAction);
	  }

	  $scope.getFile = function () {
      $scope.progress = 0;
      $scope.gettingFile=true;
      FileReader.readAsBinaryString(new File($scope.content), $scope)
        .then(function(result) {
        	$scope.gettingFile=false;
          $scope.contents = result;
	        console.log(contents);
        });
	  };
	  
	  $scope.$on("fileProgress", function(e, progress) {
       $scope.progress = progress.loaded / progress.total;
	  });    
  });
