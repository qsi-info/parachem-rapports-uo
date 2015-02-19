'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:ReportNewCtrl
 * @description
 * # ReportNewCtrl
 * Controller of the AngularSharePointApp
 */

angular.module('AngularSharePointApp').controller('ReportNewCtrl', ['$scope', '$rootScope', '$location', 'ReportList', function ($scope, $rootScope, $location, ReportList) {


	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}


	$scope.report = {
		Title: '',
		ReportType: 'uo',
		useLastReport: true,
	};

	$scope.inCreation = true;	


	$scope.setReportGroup = function (team) {
		$scope.report.Team = team;
	};

	$scope.setReportPeriod = function (period) {
		$scope.report.Period = period;
	};	



	$scope.create = function () {
		if (typeof $scope.report.Period === 'undefined') {
			return window.alert('Vous devez selectionner la période de votre quart.');
		}

		if (typeof $scope.report.Team === 'undefined') {
			return window.alert('Vous devez selectionner une équipe');
		}

		$scope.inCreation = false;

		ReportList.add($scope.report).then(function (reportCreated) {
			$location.path('/report/manage/' + reportCreated.Id);
		});
	};	


}]);




