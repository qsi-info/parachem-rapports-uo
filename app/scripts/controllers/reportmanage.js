'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:ReportManageCtrl
 * @description
 * # ReportManageCtrl
 * Controller of the AngularSharePointApp
 */

angular.module('AngularSharePointApp').controller('ReportManageCtrl', ['ReportList', '$location', '$routeParams', '$scope', '$rootScope', function (ReportList, $location, $routeParams, $scope, $rootScope) {

	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}

	ReportList.findOne($routeParams.id, '$select=Id,Author/Id,Author/Title&$expand=Author').then(function (report) {
		$scope.report = report;
		if ($scope.report.Author.Id !== $rootScope.me.get_id()) {
			return $location.path('/report/close-last/' + report.Id);
		}
	});



}]);




