angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

      .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('manage', {
    url: '/manage',
    templateUrl: 'templates/manage.html',
    controller: 'manageCtrl'
  })

  .state('termsOfUse', {
    url: '/termsOfUse',
    templateUrl: 'templates/termsOfUse.html',
    controller: 'termsOfUseCtrl'
  })

  $urlRouterProvider.otherwise('/home')

});
