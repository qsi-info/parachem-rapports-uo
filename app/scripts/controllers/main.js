'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the AngularSharePointApp
 */

angular.module('AngularSharePointApp').controller('MainCtrl', ['SectionList', function (SectionList) {

	SectionList.find('$filter=(ReportType eq \'UO\')').then(function (sections) {
		console.log(sections);
	});

}]);




