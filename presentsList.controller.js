'use strict';

var ptypeHash = {
	1: 'PTBirthday',
	2: 'PTXmas',
	3: 'PTOstern',
	4: 'PTMatur',
	5: 'PTKonfirmation',
	6: 'PTHochzeit',
	7: 'PTOther'
};

angular.module('presents')
.filter('mapType', function($log, $translate) {
	return function(input) {
		if (input < 1 || input > ptypeHash.length) {
			$log.log('**** ERROR: presents.mapType: input is ' + input);
			return '';
		} else {
			$log.log('presents.mapType = ' + ptypeHash[input]);
			return ptypeHash[input];
		}
	}
})
.controller('PresentsListCtrl', function ($scope, $log, $http, uiGridConstants, $translate, $translatePartialLoader, AppConfig) {
	AppConfig.setCurrentApp('Presents', 'fa-gift', 'presents', 'app/presents/menu.html');
	$translatePartialLoader.addPart('presents');

	$scope.msg = {};

	$scope.gridOptions = {
		minRowsToShow: 20,
		enableSorting: true,
		enableFiltering: true,
		enableHiding: true,
		enableColumnMenus: true,
		enableGridMenu: true,
		// pagingPageSizes: [25, 50, 75],
		// pagingPageSize: 25,
		enableCellEdit: true,
		enableSelectAll: true,
		// csv export -> not working, default 'download.csv' is taken
		// exporterCsvFilename: 'presents.csv',

		columnDefs: [
			{ 	name: 'datum', field: 'datum', displayName: 'Date', visible: true, width: '*', 
				sort: { direction: uiGridConstants.ASC }}, 
			{ 	name: 'from', field: 'from', visible: true, width: '*' },
			{ 	name: 'to', field: 'to', visible: true, width: '*' },
			{ 	name: 'typ', field: 'ptype', displayName: 'Type', visible: true, width: '*', 
				editDropdownFilter: 'translate', cellFilter: 'translate',
				editableCellTemplate: 'ui-grid/dropdownEditor', 
				editDropdownOptionsArray: [
					{ id: 1, value: 'PTBirthday'},
					{ id: 2, value: 'PTXmas'},
					{ id: 3, value: 'PTOstern'},
					{ id: 4, value: 'PTMatur'},
					{ id: 5, value: 'PTKonfirmation'},
					{ id: 6, value: 'PTHochzeit'},
					{ id: 7, value: 'PTOther'}
				]
				/*,
				filter: {
					condition: function(searchTerm, cellValue) {
						$log.log('searchTerm=<' + searchTerm +  '>, cellValue=<' + cellValue > '>');
						//	TODO:
						var showValue = false; 
						$translate(cellValue).then(function(translation) {
							showValue = translation.match(searchTerm);
						});
						return showValue;
						//$translate(cellValue).match(searchTerm);
						//return true;
					}
				}
				*/
			},
			{ name: 'comment', field: 'comment', enableSorting: false, visible: true, width: '*', minWidth: 20 }
		],
		// pdf export
		/*
		// disabled exporterPdfCustomFormatter, because it does not work with a function
		exporterPdfDefaultStyle: { fontSize: 9},
		exporterPdfTableStyle: { margin: [0, 5, 0, 15]},
		exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red'},
		exporterPdfHeader: { text: "Presents", style: 'headerStyle'},
		exporterPdfFooter: function(currentPage, pageCount) {
			return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle'};
		},
		
		exporterPdfCustomFormatter: function(docDefinition) {
			docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
			docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
			return docDefinition;
		},
		exporterPdfOrientation: 'portrait',
		exporterPdfPageSize: 'A4',
		exporterPdfMaxGridWidth: 500,
		*/
		exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),

		onRegisterApi: function(gridApi) {
			$scope.gridApi = gridApi;
			gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
				$scope.msg.lastCellEdited = 'edited row id: ' + rowEntity.id + ' Column: ' + colDef.name 
					+ ' newValue: ' + newValue + ' oldValue: ' + oldValue;
				$scope.apply();
			});
		}
	};

	// TODO: export visible / all data as csv / pdf
	// TODO: import data
	// TODO: add / remove rows
	// TODO: update/edit rows inline
	// TODO: translate the columni headers ->  displayName = $translate.instant('ColDate')
	// TODO: implement tests on test data

	/*
	$translate.use(AppConfig.getCurrentLanguageKey()).then(function(data) {
		$scope.gridOptions.columnDefs[0].displayName = $translate('ColDate');
	})
	$translate('ColDate').then(function(translation) {
		$scope.gridOptions.columnDefs[0].displayName = translation;
	});
*/

	var _presentsListUri = 'http://localhost:3333/api/presents';
	$http.get(_presentsListUri)
	.success(function(data, status, headers, config) {
		var i = 0;
		for(i=0; i < data.length; i++) {
			data[i].datum = new Date(data[i].datum).toLocaleDateString(AppConfig.getCurrentLanguageKey());
			// data[i].ptype = ptypeHash[data[i].ptype];
		}
		$scope.gridOptions.data = data;
		$log.log('**** SUCCESS: GET(' + _presentsListUri + ') returns with ' + status);
    	//$log.log('data=<' + data + '>');
    	//$log.log('headers=<' + headers + '>');
    	//$log.log('config=<' + config + '>');
	})
	.error(function(data, status, headers, config) {
  		// called asynchronously if an error occurs
    	// or server returns response with an error status.
    	$log.log('**** ERROR:  GET(' + _presentsListUri + ') returns with ' + status);
    	//$log.log('data=<' + data + '>');
    	//$log.log('headers=<' + headers + '>');
    	//$log.log('config=<' + config + '>');
  	});	

  	$scope.export = function() {
  		if ($scope.export_format == 'csv') {
  			var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
  			$scope.gridApi.exporter.csvExport($scope.export_row_type, $scope.export_column_type, myElement);
  		} else if ($scope.export_format == 'pdf') {
  			$scope.gridApi.exporter.pdfExport($scope.export_row_type, $scope.export_column_type);
  		} else {
  			$log.log("**** ERROR: PresentsListCtrl.export(): unknown export_format: " + $scope.export_format);
  		}
  	};

	$scope.getLang = function() {
		// $log.log('PresentsListCtrl.getLang() = ' + AppConfig.getCurrentLanguageKey());
		return AppConfig.getCurrentLanguageKey();
	};
});

	/*
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
		// $log.log('entering PresentsListCtrl:getDate(' + dateStr + ')'); 
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
	*/




