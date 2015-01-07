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
.filter('mapType', function($log) {
	return function(input) {
		if (input < 1 || input > ptypeHash.length) {
			$log.log('**** ERROR: presents.mapType: input is ' + input);
			return '';
		} else {
			$log.log('presents.mapType = ' + ptypeHash[input]);
			return ptypeHash[input];
		}
	};
})
.controller('PresentsListCtrl', function ($scope, $log, $http, uiGridConstants, $translate, $timeout, $interval, $translatePartialLoader, AppConfig, cfg) {
	AppConfig.setCurrentApp('Presents', 'fa-gift', 'presents', 'app/presents/menu.html');
	$translatePartialLoader.addPart('presents');

	$scope.addData = function() {
//		var n = $scope.gridOptions.data.length + 1;
		$scope.gridOptions.data.push({
			'datum': new Date().toLocaleDateString(AppConfig.getCurrentLanguageKey()),
			'from': 'myself',
			'to': 'you',
			'ptype': $translate('PTBirthday'),
			'comment': 'bla'
		});
	};

	$scope.removeFirstRow = function() {
//		if ($scope.gridOptions.data.length > 0) {
			$scope.gridOptions.data.splice(0, 1);
//		}
	};

	$scope.saveRow = function( rowEntity ) {
		var _uri = cfg.PresentsSvcUri + 'presents/' + rowEntity._id;
		$log.log('PresentsListCtrl.saveRow() -> $http.put(' + _uri + ')');
		var promise = $http.put(_uri);
		$scope.gridApi.rowEdit.setSavePromise( $scope.gridApi.grid, rowEntity, promise.promise );
	};

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

		columnDefs: [
			{	name: 'id', field: '_id', displayName: 'ID', visible: false, width: '*' },
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
				ev. mit cellFilter: 'date:"yyyy-MM-dd"' versuchen im Datumsfeld
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
		exporterPdfDefaultStyle: { fontSize: 9},
		exporterPdfTableStyle: { margin: [0, 5, 0, 15]},
		exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red'},
		exporterPdfHeader: { text: 'Presents', style: 'headerStyle'},
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

		// csv export -> not working, default 'download.csv' is taken
		exporterCsvFilename: 'presents.csv',
		exporterCsvLinkElement: angular.element(document.querySelectorAll('.custom-csv-link-location')),

		onRegisterApi: function(gridApi) {
			$scope.gridApi = gridApi;
			gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
			// force grid to resize 
			$timeout(function() {
				gridApi.core.handleWindowResize();
			});
			/*
			gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
				$scope.msg.lastCellEdited = 'edited row id: ' + rowEntity.id + ' Column: ' + colDef.name + ' newValue: ' + newValue + ' oldValue: ' + oldValue;
				$scope.apply();
			});
*/
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
	var _presentsListUri = cfg.PresentsSvcUri + 'presents';
	$http.get(_presentsListUri)
	.success(function(data, status) {
		var i = 0;
		for(i=0; i < data.length; i++) {
			data[i].datum = new Date(data[i].datum).toLocaleDateString(AppConfig.getCurrentLanguageKey());
			// data[i].ptype = ptypeHash[data[i].ptype];
		}
		$scope.gridOptions.data = data;
		$log.log('**** SUCCESS: GET(' + _presentsListUri + ') returns with ' + status);
    	//$log.log('data=<' + data + '>');
	})
	.error(function(data, status) {
  		// called asynchronously if an error occurs or server returns response with an error status.
    	$log.log('**** ERROR:  GET(' + _presentsListUri + ') returns with ' + status);
    	$log.log('data=<' + data + '>');
  	});	

  	$scope.export = function() {
  		if ($scope.exportFormat === 'csv') {
  			var myElement = angular.element(document.querySelectorAll('.custom-csv-link-location'));
  			$scope.gridApi.exporter.csvExport($scope.exportRowType, $scope.exportColumnType, myElement);
  		} else if ($scope.exportFormat === 'pdf') {
  			$scope.gridApi.exporter.pdfExport($scope.exportRowType, $scope.exportColumnType);
  		} else {
  			$log.log('**** ERROR: PresentsListCtrl.export(): unknown exportFormat: ' + $scope.exportFormat);
  		}
  	};

	$scope.getLang = function() {
		// $log.log('PresentsListCtrl.getLang() = ' + AppConfig.getCurrentLanguageKey());
		return AppConfig.getCurrentLanguageKey();
	};
});
