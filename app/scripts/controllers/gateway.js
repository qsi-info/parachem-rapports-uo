'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:GatewayCtrl
 * @description
 * # GatewayCtrl
 * Controller of the AngularSharePointApp
 */

angular.module('AngularSharePointApp').controller('GatewayCtrl', ['SharePoint', '$rootScope', '$location', function (SharePoint, $rootScope, $location) {


	if (typeof $rootScope.me === 'undefined') {

		if (typeof $rootScope.sp.host === 'undefined') {
			return $location.path('/reload');
		}

		SharePoint.init($rootScope.sp.host, $rootScope.sp.app, $rootScope.sp.sender).then(function () {
			SharePoint.API.me().then(function (user) {
				$rootScope.me = user;
				$location.path('/home');
			});			
		});

	} else {
		$location.path('/home');
	}

}]);





