angular.module('app', ['ionic', 'ngCordova', 'ionic.service.core', 'ionic.service.analytics', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordovaOauth'])

.run(function($ionicPlatform, $ionicAnalytics, $state) {
  $ionicPlatform.ready(function() {
    //Register analytics
    $ionicAnalytics.register();

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleLightContent();
    }
    
  });
})

.config(['$ionicAppProvider', function($ionicAppProvider) {
  $ionicAppProvider.identify({
    app_id: '345820ce',
    api_key: 'dc5e4606f6a8aa086c64f0a327b3f09ddf7c0dab7a353e8f'
  });
}])
