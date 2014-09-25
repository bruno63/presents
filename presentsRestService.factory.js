'use strict';

/* 
 * a factory defining the external REST interface of the service
 */
angular.module('presents')
.factory('PresentsRestService', function(Restangular) {
	return Restangular.withConfig(function(RestangularConfigurer) {
		RestangularConfigurer.setBaseUrl('http://localhost:3333/api/');
	});
});