'use strict';

/* 
 * a factory defining the external REST interface of the service
 * this is only used with an externalized Presents Service
 */
angular.module('presents')
.factory('PresentsRestService', function(Restangular, cfg) {
	return Restangular.withConfig(function(RestangularConfigurer) {
		RestangularConfigurer.setBaseUrl(cfg.PresentsSvcUri);
	});
});