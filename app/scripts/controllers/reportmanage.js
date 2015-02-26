'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:ReportManageCtrl
 * @description
 * # ReportManageCtrl
 * Controller of the AngularSharePointApp
 */

/*jshint latedef: false */
/* global $:false */
/* jshint loopfunc:true */
/* jslint browser: true, plusplus: true */


angular.module('AngularSharePointApp').controller('ReportManageCtrl', ['ReportList', '$location', '$routeParams', '$scope', '$rootScope', 'CommentList', '$q', 'SectionList', 'cfpLoadingBar', function (ReportList, $location, $routeParams, $scope, $rootScope, CommentList, $q, SectionList, cfpLoadingBar) {

	if (typeof $rootScope.me === 'undefined') {
		return $location.path('/gateway');
	}

	$scope.inReview = $routeParams.review === 'yes' ? true : false;

	cfpLoadingBar.start();
	init_report_manager().then(function (result) {
		if (result === 'close') {
			return $location.path('/report/close-last/' + $scope.report.Id);
		}

		get_report_sections().then(function (sections) {
			$scope.sections = sections;
			$scope.inputs = {};
			sections.forEach(function (section) {
				$scope.inputs['UO' + section.Id] = '';
			});
			bootstrap_collaspse_sections(sections);
			$scope.isLoad = true;
			cfpLoadingBar.complete();
		});

	});


	$scope.addComment = function (section) {

		var inputIndentifier = 'UO' + section.Id;

		if ($scope.inputs[inputIndentifier] === '') {
			return window.alert('Vous devez entrez du texte');
		}
		cfpLoadingBar.start();
		var comment = {
			Title: $scope.inputs[inputIndentifier],
			SectionId: section.Id,
			ReportId: $scope.report.Id,
		};
		CommentList.add(comment).then(function (addedComment) {
			$scope.comments.push(addedComment);
			$scope.inputs[inputIndentifier] = '';
			document.getElementById('Comment' + section.Id).focus();
			cfpLoadingBar.complete();				
		});
	};



	$scope.removeComment = function (comment) {
		if (window.confirm('Etes-vous sur de vouloir supprimer cet élélement?')) {
			cfpLoadingBar.start();
			var commentToRemoveIndex = $scope.comments.indexOf(comment);
			var commentToRemove = $scope.comments[commentToRemoveIndex];
			CommentList.remove(commentToRemove.Id).then(function () {
				$scope.comments.splice(commentToRemoveIndex, 1);
				cfpLoadingBar.complete();
			});
		}
	};


	$scope.editComment = function (comment) {
		cfpLoadingBar.start();
		var buffer = comment;
		CommentList.remove(comment.Id).then(function () {
			$scope.comments.splice($scope.comments.indexOf(comment), 1);
			$scope.inputs['UO' + buffer.SectionId] = buffer.Title;
			document.getElementById('Comment' + buffer.SectionId).focus();
			cfpLoadingBar.complete();				
		});
	};	




	$scope.markNoteAsRead = function () {
		if (!$scope.report.HasReadNote) {
			ReportList.update($scope.report.Id, { HasReadNote: true }).then(function () {
				$scope.report.HasReadNote = true;
			});	
		}
	};


	$scope.saveNote = function () {
		if ($scope.report.Note === '' || $scope.report.Note === null && typeof $scope.report.Note === 'object') {
			return window.alert('Le message doit contenir de l\'information.');
		}
		cfpLoadingBar.start();			
		ReportList.update($scope.report.Id, { Note: $scope.report.Note }).then(function () {
			$('#myNote').modal('hide');
			cfpLoadingBar.complete();				
		});
	};



	$scope.submitReport = function () {
		if (window.confirm('Etes-vous certain de vouloir soumettre le rapport? Ceci sera la version finale.')) {
			cfpLoadingBar.start();			
			ReportList.update($scope.report.Id, { IsActive: false }).then(function () {
				cfpLoadingBar.complete();				
				$location.path('/report/end');
			});
		}
	};




	function bootstrap_collaspse_sections (sections) {
		sections.forEach(function (section) {
			// Caret icon orientation when section collapse or open
			$('body').on('hide.bs.collapse', '#Collapse' + section.Id, function () { 
				$('#Icon' + section.Id).removeClass('fa-caret-down').addClass('fa-caret-right'); 
			});
			$('body').on('show.bs.collapse', '#Collapse' + section.Id, function () { 
				$('#Icon' + section.Id).removeClass('fa-caret-right').addClass('fa-caret-down'); 
			});			
		});
	}



	function get_report_sections () {
		return SectionList.find('$filter=ReportType eq \'UO\'');
	}


	function get_current_report () {
		return ReportList.findOne($routeParams.id, '$select=Id,HasReadNote,useLastReport,Created,IsInitialize,Team,Period,Note,Author/Id,Author/Title&$expand=Author');
	}


	function set_report_initialize () {
		return ReportList.update($scope.report.Id, { IsInitialize: true });
	}


	function load_comments () {
		return CommentList.find('$filter=(Report eq \'' + $scope.report.Id + '\')');
	}


	function get_last_report () {
		var deferred = $q.defer();
		ReportList.find('$filter=(IsActive eq 0) and (ReportType eq \'uo\')&$orderby=Modified desc&$top=1&$select=Note,Id,IsActive').then(function (reports) {
			if (reports.length > 0) {
				deferred.resolve(reports[0]);
			} else {
				deferred.resolve(null);
			}
		});
		return deferred.promise;
	}

	function load_previous_comments () {
		var deferred = $q.defer();
		CommentList.find('$filter=(Report eq \'' + $scope.lastReport.Id + '\')').then(function (comments) {
			var promises = [];
			comments.forEach(function (comment) {
				promises.push(CommentList.add({ Title: comment.Title, SectionId: comment.SectionId, ReportId: $scope.report.Id }));
			});
			$q.all(promises).then(deferred.resolve);
		});
		return deferred.promise;
	}



	function init_report_manager () {
		var deferred = $q.defer();
		// Get the current report
		get_current_report().then(function (report) {
			// Check if the current report Author Id matches the current User Id
			if (report.Author.Id !== $rootScope.me.get_id()) {
				// If not, go to close last report page
				deferred.resolve('close');
			}
			// Bind report and initialize comments array
			$scope.report = report;
			$scope.comments = [];
			// Get the last report
			get_last_report().then(function (lastReport) {
				// Bind the last report to scope
				$scope.lastReport = lastReport;
				// Check if report is initialize
				if ($scope.report.IsInitialize) {
					console.log('report already initialize');
					// Load current report comments
					load_comments().then(function (comments) {
						// Bind comments to scope
						$scope.comments = $scope.comments.concat(comments);
						// Show interface
						deferred.resolve(true);
					});
				// Last report is null because first report ever or doesnt want to use last report comments
				} else if ($scope.lastReport === null || !$scope.report.useLastReport) {
					console.log('first report ever or not using last report comments');
					// Set report to initialize
					set_report_initialize().then(function () {
						// Show interface
						deferred.resolve(true);					
					});
				// Report is not initialize but wants to use last report comments
				} else if ($scope.report.useLastReport) {
					console.log('report using last report comments');
					// Load the comments from the last report
					load_previous_comments().then(function (comments) {
						// Bound the new comments
						$scope.comments = $scope.comments.concat(comments);
						// Set report to initialize
						set_report_initialize().then(function () {
							// Show interface
							deferred.resolve(true);
						});
					});
				} else {
					deferred.reject(false);
				}
			});
		});	
		return deferred.promise;	
	}


}]);




