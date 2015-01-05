'use strict';

/* 
 * a factory defining the external REST interface of the service
 */
angular.module('presents')
.factory('PresentsRestService', function(Restangular, cfg) {
	return Restangular.withConfig(function(RestangularConfigurer) {
		RestangularConfigurer.setBaseUrl(cfg.PresentsSvcUri);
	});
});