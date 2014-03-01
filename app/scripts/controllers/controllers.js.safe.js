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

app.factory('DeviceService', function($resource) {
  return $resource('/api/v1/devices/:id')
});

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

  $scope.editDevice = function(device) {
    if (device === 'new') {
      $scope.newDevice = true;
      $scope.device = {name: '', type: '', hash: ''};
    }
    else {
      $scope.newDevice = false;
      $scope.device = {_id: device._id, name: device.name, type: device.type, hash: device.hash};
    }
  };

  $scope.save = function() {
    var id = $scope.device._id;
    $scope.device._id = undefined;
    var newDevice = new DeviceService($scope.device);
    newDevice.$save(function(){
      $scope.devices.push(newDevice);
    });
    if (id) {
      $scope.devices.forEach(function(e, index) {
        if (e._id === id) {
          e.active = false;
          e.$save();
          $scope.devices.splice(index, 1);
        }
      });          
    }
  };

  $scope.delete = function(device) {
    $scope.devices.forEach(function(e, index) {
      if (e._id == device._id) {
        e.active = false;
        e.$save();
        $scope.devices.splice(index, 1);
      }
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
