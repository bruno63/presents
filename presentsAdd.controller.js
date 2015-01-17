'use strict';

angular.module('presents')
.controller('PresentsAddCtrl', function ($scope, $log, $location, $translatePartialLoader, cfg, PresentsRestService) {
	cfg.GENERAL.CURRENT_APP = 'presents';
	$translatePartialLoader.addPart('presents');
	$scope.save = function (isValid) {
		$log.log('entering PresentsAddCtrl:save(' + isValid + ')');
		$log.log('new present:');
		$log.log('datum  : <' + this.formData.datum + '>');
		$log.log('from   : <' + this.formData.from + '>');
		$log.log('to     : <' + this.formData.to + '>');
		$log.log('type   : <' + this.formData.type + '>');
		$log.log('comment: <' + this.formData.comment + '>');
		if (isValid) {
			PresentsRestService.all('presents').post(this.formData).then(function () {
				$location.path('/presents');
			});
		}
		else {
			$scope.submitted = true;
		}
	};
});



