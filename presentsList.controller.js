'use strict';

angular.module('presents')
.controller('PresentsListCtrl', function ($scope, $filter, $log, $translatePartialLoader, AppConfig, PresentsRestService, ngTableParams) {
	AppConfig.setCurrentApp('Presents', 'fa-gift', 'presents', 'app/presents/menu.html');
	$translatePartialLoader.addPart('presents');
	
	$scope.counts = [10, 25, 50, 100];  // set to an empty array to disable the toggler

	// see alternative solution for initial data load using promise to load data into ng-table: 
	// http://stackoverflow.com/questions/23608247/how-to-refresh-ng-table-loaded-from-an-http-request-with-dynamic-data
	$scope.tableParams = new ngTableParams({
		page:     1,            		// show first page
		count:   10          			// count per page
	}, {
        total:    0,					// length of data
        counts: $scope.counts,		// set to an empty array to disable the toggler
       	getData: function($defer, params) {
       		PresentsRestService.all('presents').getList().then(function(data) {
       	    	var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
        		var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData; 
       			params.total(orderedData.length);
       			$defer.resolve($scope.data = orderedData.slice((params.page() -1) * params.count(), params.page() * params.count()));           
       		}, 500);
       	}
    });

	// todo: does not work as expected yet, should turn on and off the toggler. Toggler seems to be set correctly in $scope.counts,
	// but has no effect on the view (reload seems not to work)
    $scope.toggleCounts = function() {
		$log.log('entering PresentsListCtrl:toggleCounts, $scope.counts=<' + $scope.counts + '>');

    	if ($scope.counts.length > 0) {
    		$scope.counts = [];
    	}
    	else {
    		$scope.counts = [10, 25, 50, 100];
    	}
    	$scope.tableParams.reload();
    };

    $scope.export = function() {
		$log.log('entering PresentsListCtrl:export into presents.csv'); 
//    	$scope.csv.generate($event, 'presents.csv');
    };

    $scope.clearFilter = function() {
		$log.log('entering PresentsListCtrl:clearFilter'); 
		$scope.tableParams.filter({});
	};
	$scope.clearSorting = function() {
		$log.log('entering PresentsListCtrl:clearSorting'); 
		$scope.tableParams.sorting({});
	};

	$scope.getDate = function(dateStr) {
		$log.log('entering PresentsListCtrl:getDate(' + dateStr + ')'); 
		return new Date(dateStr);
	};

	// inline edit
	$scope.save = function(data) {
		$log.log('entering PresentsListCtrl:save(' + data + ')');
		var currentPresent = PresentsRestService.one('presents', data._id);
		currentPresent = data;
		currentPresent.put().then(function() {
			data.$edit=false;
		});
	};

	$scope.delete = function (data) {
		$log.log('entering PresentsListCtrl:delete(' + data + ')');
		if(window.confirm('Are you sure?')) {
			PresentsRestService.one('presents', data._id).remove().then(function () {
				$scope.tableParams.reload();
			});
		}
	};
});



