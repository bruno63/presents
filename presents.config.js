'use strict';

angular.module('presents', ['core'])
.config(function ($stateProvider) {
	$stateProvider
	.state('presents', {
		url: '/presents',
		templateUrl: 'app/presents/list.html',
		controller: 'PresentsListCtrl',
		authenticate: true
	});
});
