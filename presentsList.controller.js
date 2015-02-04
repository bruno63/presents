'use strict';

var ptypeHash = {
	Birthday: 1,
	Christmas: 2,
	Easter: 3,
	Matura: 4,
	Religion: 5,
	Marriage: 6,
	Other: 7
};

// The english stringified terms (as shown in ptypeHash) are made persistent in the database.
// The same terms serve as the index for translations (see i18n/*) as well as the english default translation.
// In order to use the dropdown menu of predefined types, the numeric index is used during runtime.
// This index is converted with filter 'mapType' for viewing.
// TODO: this works well as long as it is used in english. Some additional work is needed to show the translated terms.
angular.module('presents')
.filter('mapType', function($log) {
	var ptypeHashReversed = {
		1: 'Birthday',
		2: 'Christmas',
		3: 'Easter',
		4: 'Matura',
		5: 'Religion',
		6: 'Marriage',
		7: 'Other'
	};

	return function(input) {
		if (input < 1 || input > ptypeHashReversed.length) {
			$log.log('**** ERROR: presents.mapType(' + input + ') -> input is out of bounds');
			return '';
		} else {
			// $log.log('presents.mapType(' + input + ') = ' + ptypeHashReversed[input]);
			return ptypeHashReversed[input];
		}
	};
})
.controller('PresentsListCtrl', function ($scope, $log, $http, uiGridConstants, $translate, $timeout, $interval, $translatePartialLoader, cfg) {
	cfg.GENERAL.CURRENT_APP = 'presents';
	$translatePartialLoader.addPart('presents');
	$log.log('PresentsListCtrl/cfg = ' + JSON.stringify(cfg, null, '\t'));

	$scope.addData = function() {
//		var n = $scope.gridOptions.data.length + 1;
		$scope.gridOptions.data.push({
			'datum': new Date().toLocaleDateString(cfg.GENERAL.LANGS[cfg.GENERAL.CURRENT_LANG_ID]),
			'from': 'myself',
			'to': 'you',
			'ptype': $translate('Birthday'),
			'comment': 'bla'
		});
	};

	$scope.removeFirstRow = function() {
//		if ($scope.gridOptions.data.length > 0) {
			$scope.gridOptions.data.splice(0, 1);
//		}
	};

	$scope.saveRow = function( rowEntity ) {
		var _uri = cfg.presents.SVC_URI + rowEntity.id;
		$log.log('PresentsListCtrl.saveRow(' + rowEntity.toJSON() + ') -> $http.put(' + _uri + ')');
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
	//	paginationPageSizes: [25, 50, 75],
	//	paginationPageSize: 25,
		enableCellEditOnFocus: true,
		enableSelectAll: true,

		columnDefs: [
			{	name: 'id', field: '_id', displayName: 'ID', enableCellEdit: false, visible: false, width: '*' },
			{ 	name: 'datum', field: 'datum', displayName: 'Date', visible: true, width: '*', 
					sort: { direction: uiGridConstants.ASC }}, 
			{ 	name: 'from', field: 'from', visible: true, width: '*' },
			{ 	name: 'to', field: 'to', visible: true, width: '*' },
			{ 	name: 'ptype', field: 'ptype', displayName: 'Type', visible: true, width: '*',
					cellFilter: 'mapType',
					editDropdownFilter: 'translate',
					editableCellTemplate: 'ui-grid/dropdownEditor', 
					editDropdownOptionsArray: [
						{ id: 1, value: 'Birthday'},
						{ id: 2, value: 'Christmas'},
						{ id: 3, value: 'Easter'},
						{ id: 4, value: 'Matura'},
						{ id: 5, value: 'Religion'},
						{ id: 6, value: 'Marriage'},
						{ id: 7, value: 'Other'}
					]
			},
			{ name: 'comment', field: 'comment', enableSorting: false, visible: true, width: '*', minWidth: 20 }
		],
		// Importing Data
		importerDataAddCallback: function (grid, newObjects) {
			$scope.data = $scope.data.concat( newObjects );
		},
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
	var _listUri = cfg.presents.SVC_URI;
	$log.log("calling get on " + _listUri);
	$http.get(_listUri)
	.success(function(data, status) {
		var i = 0;
		for(i=0; i < data.length; i++) {
			data[i].datum = new Date(data[i].datum).toLocaleDateString(cfg.GENERAL.LANGS[cfg.GENERAL.CURRENT_LANG_ID]);
			// convert the ptype string expressions into indexes in order to work with dropdown list
			data[i].ptype = ptypeHash[data[i].ptype];
		}
		$scope.gridOptions.data = data;
		$log.log('**** SUCCESS: GET(' + _listUri + ') returns with ' + status);
    	// $log.log('data=<' + JSON.stringify(data) + '>');
	})
	.error(function(data, status) {
  		// called asynchronously if an error occurs or server returns response with an error status.
    	$log.log('**** ERROR:  GET(' + _listUri + ') returns with ' + status);
    	// $log.log('data=<' + JSON.stringify(data) + '>');
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
  		return cfg.GENERAL.LANGS[cfg.GENERAL.CURRENT_LANG_ID];
  	};
});
