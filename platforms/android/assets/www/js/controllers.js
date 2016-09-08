String.prototype.contains = function(it) { return this.indexOf(it) !== -1; };

angular.module('app.controllers', [])

.controller('homeCtrl', function($scope, $rootScope, $state, $ionicPlatform, $cordovaBarcodeScanner, $ionicPopup, $cordovaBeacon, $window, nfcService, $cordovaInAppBrowser, $cordovaBeacon) {
  $ionicPlatform.ready(function() {

    $('.signOutBtnCol').remove();

    if($cordovaBeacon){
      //Beacons are accesible.
      console.log("Beacons are accesible. ");
    }else{
      //Beacons are not accesible.
      console.log("Beacons are not accesible. ");
      $ionicPopup.alert({title: "Error",template: "Can not work with beacons."});
    }

    $scope.beacons = {};

    $scope.$on('$ionicView.enter', function() {
        // code to run each time view is entered
        updateScreenForUser();
    });

    function updateScreenForUser(){
      $('.lastRow .col.signOutBtnCol').remove();
      if(firebase.auth().currentUser){

        $('.lastRow').append('<div class="col signOutBtnCol"><a ng-click="signoutBtnClick()" class="button button-block button-dark signOutBtn">Sign out</a></div>');

        $scope.bottomBtnClick = function(){
          $state.go('manage');
        };
        $scope.bottomBtnContent = "Manage Tags";
      }else{
        $('.signOutBtnCol').remove();
        $scope.bottomBtnClick = function(){
          $state.go('login');
        };
        $scope.bottomBtnContent = "Login or Sign Up";
      }
    }

    updateScreenForUser();

    $scope.signoutBtnClick = function(){
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
        $ionicPopup.alert({title: "Success",template: "Sign-out successful."});
        $window.location.reload(true);
      }, function(error) {
        // An error happened.
        console.error(error);
        $ionicPopup.alert({title: "Fail",template: "Sign-out failed."});
      });
    };

    $scope.qrBtn = function(){
      $cordovaBarcodeScanner
        .scan()
        .then(function(result) {
          // Success! Barcode data is here
          window.processRecievedData(result.text);
          console.log(result);
        }, function(error) {
          // An error occurred
          console.error(error);
          $ionicPopup.alert({title: "Error",template: "Failed to scan QR code."});
        },
        {
            "showFlipCameraButton" : true,
            "prompt" : "Place a barcode inside the scan area",
            "formats" : "QR_CODE",
            "orientation" : "portrait"
        });
    };

    $scope.beaconBtn = function(){
      //https://github.com/petermetz/cordova-plugin-ibeacon
      console.log('Starting searching for beacons!');

      $cordovaBeacon.requestWhenInUseAuthorization();

      cordova.plugins.locationManager.isBluetoothEnabled()
          .then(function(isEnabled){
              console.log("isEnabled: " + isEnabled);
              if (isEnabled) {
                  cordova.plugins.locationManager.disableBluetooth();
              } else {
                  cordova.plugins.locationManager.enableBluetooth();
              }
          })
          .fail(function(e) { console.error(e); })
          .done();

      $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function(event, pluginResult) {
          var uniqueBeaconKey;
          for(var i = 0; i < pluginResult.beacons.length; i++) {
              uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
              $scope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];
              console.log(pluginResult.beacons[i]);

              //TODO: process search results
          }
          $scope.$apply();
      });

      //Track Estimote beacons
      $cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion("estimote", "50765cb7-d9ea-4e21-99a4-fa879613a492"));
      //TODO: Track Taganize beacons
      //$cordovaBeacon.startRangingBeaconsInRegion($cordovaBeacon.createBeaconRegion("taganize", "taganizeBeaconUUID"));

      $ionicPopup.alert({title: "Searching...",template: "Taganize is searching for beacons nearby!"});

    };

    var processRecievedData = function (data){
      console.log(data);
      if (data) {
        //Data is the Tag ID
        if(data.contains('http')){
          //Data is a website and is not a registered tag
          console.log('Scanned data is a link');
          $cordovaInAppBrowser.open(data, '_blank', {}).then(function(event) { }) .catch(function(event) { });
        }else{
          //Data can be a Taganize Tag
          firebase.database().ref('nfc/' + data).on('value', function(snapshot) {
            var tagID = snapshot.val();

            console.log(tagID);

            if(tagID){
                //Data is a Taganize Tag
                console.log('Scanned data is a Taganize Tag');
                $cordovaInAppBrowser.open('http://anspiritwebsite.azurewebsites.net/#/tag?id='+tagID, '_blank', {}).then(function(event) { }) .catch(function(event) { });
            }else{
              //Data is not a website and is not a registered tag
              console.log('Scanned data not recognized');
              $ionicPopup.alert({title: "Sorry",template: "Tag has not been recognized"});
            }

          });
        }

      }else{
        // No data
      }
    };
    window.processRecievedData = processRecievedData;
  });
})

.controller('loginCtrl', function($scope, $state, $ionicPopup){

  var user = firebase.auth().currentUser;
  if (user) {
    // User is signed in already.
    console.log('User already in with user id ' + user.uid);
    $ionicPopup.alert({title: "You are already signed in",template: "You can not login twice"});
    $state.go('home');
  }

  $scope.userData = {};
  var userData = $scope.userData;
  $scope.signInBtn = function(){
    if(userData.email != null && userData.email != ''){
      if(userData.password != null && userData.password != ''){
        firebase.auth().signInWithEmailAndPassword(userData.email, userData.password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.error(errorMessage);
          $ionicPopup.alert({title: "Error",template: "Wrong email, password or application failed during login process"});
        });
        console.log(userData.email + " : " + userData.password);
        loginProcessCallback();
      }
    }
  };

  function loginProcessCallback(){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        $state.go('home');
      } else {
        // User is signed out.
      }
    });
  }
})

.controller('signupCtrl', function($scope, $state, $ionicPopup) {
  $scope.userData = {};
  var userData = $scope.userData;

  $scope.signUpBtn = function(){
    //Validate data
    var dataFilled = true;
    if(userData.firstname == null || userData.firstname.length < 2){
      dataFilled = false;
    }
    if(userData.lastname == null || userData.lastname.length < 2){
      dataFilled = false;
    }
    if(userData.email == null || userData.email.length < 0){
      dataFilled = false;
    }
    if(userData.password == null || userData.password.length < 6){
      $ionicPopup.alert({title: "Escuse me",template: "Your password is too short!"});
      dataFilled = false;
    }
    if(dataFilled){
      //Sign up with email in firebase
      firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password).catch(function(error) {
        // Handle Errors here.
        var errorMessage = error.message;

        $ionicPopup.alert({title: "Error",template: errorMessage});
      });
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          var uid = user.uid;
          // User is signed in.
          //Insert new data
          database.ref('user/'+uid).set({
            firstname: dataFilled.firstname,
            lastname: dataFilled.lastname,
            email: dataFilled.email
          });

          $state.go('home');
        } else {
          // User is signed out.
          $ionicPopup.alert({title: "Error",template: "Application failed during sign up process"});
        }
      });
    }else{
      $ionicPopup.alert({
          title: 'Error',
          template: 'Fill all empty fields and make sure data you enter is legit and correct!'
      });
    }
  };
})

.controller('manageCtrl', function($scope){
  $scope.page = "Manage own Tags";
})

.controller('termsOfUseCtrl', function($scope){
  $scope.page = "Terms of Use, License Agreement and Privacy Policy";
})
