'use strict';

angular.module('presents', ['core'])
.config(function ($stateProvider) {
	$stateProvider
	.state('presents', {
		url: '/presents',
		templateUrl: 'app/presents/list.html',
		controller: 'PresentsListCtrl',
		authenticate: true
	})
	// sub-state that opens the form inline above of the table
	.state('presents.addInline', {
		url: '/add',
		templateUrl: 'app/presents/addInline.html',
		controller: 'PresentsAddCtrl',
		authenticate: true
	})
	// state that opens the form in a separate view
	.state('presentsAdd', {
		url: '/addPresents',
		templateUrl: 'app/presents/add.html',
		controller: 'PresentsAddCtrl',
		authenticate: true
	});
});
