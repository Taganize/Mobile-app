angular.module('app', ['ionic', 'ngCordova', 'ionic.service.core', 'ionic.service.analytics', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordovaBeacon'])

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

.factory('nfcService', function ($rootScope, $ionicPlatform) {
      var tag = {};

      $ionicPlatform.ready(function() {

          nfc.addNdefListener(function (nfcEvent) {
              console.log(nfcEvent.tag);
              var tagId = nfc.bytesToHexString(tag.id || tag.nuid);

              window.processRecievedData(tagId);

              $rootScope.$apply(function(){
                  angular.copy(nfcEvent.tag, tag);
              });
          }, function () {
              console.log("Listening for NDEF Tags.");
          }, function (reason) {
              alert("No NFC available on this device.");
          });

          nfc.addTagDiscoveredListener(function (nfcEvent) {
              console.log(nfcEvent.tag);
              var tag = nfcEvent.tag;
              var tagId = nfc.bytesToHexString(tag.id);

              window.processRecievedData(tagId);

              $rootScope.$apply(function(){
                  angular.copy(nfcEvent.tag, tag);
              });
          }, function () {
              console.log("Listening for non-NDEF Tags.");
          }, function (reason) {
              //alert("Error adding NFC Listener " + reason);
          });

          nfc.addMimeTypeListener('text/pg',
           function (nfcEvent) {
                console.log(nfcEvent.tag);

                var tagId = nfc.bytesToHexString(tag.id);

                window.processRecievedData(tagId);

                $rootScope.$apply(function(){
                  angular.copy(nfcEvent.tag, tag);
                });
            }, function () {
                console.log("Listening for Mime Tags.");
            }, function (reason) {
                //alert("Error adding NFC Listener " + reason);
          });

      });

      return {
          tag: tag,

          clearTag: function () {
              angular.copy({}, this.tag);
          }

      };
})
