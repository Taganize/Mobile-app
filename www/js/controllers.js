angular.module('app.controllers', [])

.controller('homeCtrl', function($scope, $state) {

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
  }

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
    if(userData.name == null || userData.name.length < 2){
      dataFilled = false;
    }
    if(userData.phone == null || userData.phone.length < 6 || userData.phone.length > 20){
      dataFilled = false;
    }
    if(userData.email == null || userData.email.length < 4){
      dataFilled = false;
    }
    if(userData.city == null || userData.city.length < 2){
      dataFilled = false;
    }
    if(userData.address == null || userData.address.length < 2){
      dataFilled = false;
    }
    if(userData.zip == null || userData.zip.length < 4){
      dataFilled = false;
    }
    if(userData.state == null || userData.state.length < 2){
      dataFilled = false;
    }
    if(dataFilled){
      //Sign up with email in firebase
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          //Copy old data
          database.ref('user/'+uid).on('value', function(snapshot) {
            var oldUserData = snapshot.val();
            //Insert new data
            database.ref('user/'+uid).set({
              name: dataFilled.name,
              email: dataFilled.email,
              phone: dataFilled.phone,
              city: dataFilled.city,
              address: dataFilled.address,
              zip: dataFilled.zip,
              state: dataFilled.state,
              ongoingQueue: oldUserData.ongoingQueue
            });

            $state.go('home');

          });
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
  }
})
