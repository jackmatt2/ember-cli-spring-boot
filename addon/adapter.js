import HalAdapter from "./ember-data-hal-9000/adapter";
import config from './config';
import Ember from 'ember';

var SPRING_BOOT_ADAPTER_REST_NAMESPACE = config.APP.SPRING_BOOT_ADAPTER_REST_NAMESPACE;
if(Ember.isNone(SPRING_BOOT_ADAPTER_REST_NAMESPACE)) {
	Ember.debug('Spring Boot: You have not set the SPRING_BOOT_ADAPTER_REST_NAMESPACE in app/config/environment.js, defaulting to blank');
	SPRING_BOOT_ADAPTER_REST_NAMESPACE = '';
}

var SPRING_BOOT_ADAPTER_REST_HOST = config.APP.SPRING_BOOT_ADAPTER_REST_HOST;
if(Ember.isNone(SPRING_BOOT_ADAPTER_REST_HOST)) {
	Ember.debug('Spring Boot: You have not set the SPRING_BOOT_ADAPTER_REST_HOST in app/config/environment.js, defaulting to http://localhost:8080');
	SPRING_BOOT_ADAPTER_REST_HOST = 'http://localhost:8080';
}

Ember.debug('Spring Boot: REST request base url is ' + SPRING_BOOT_ADAPTER_REST_HOST + '/' + SPRING_BOOT_ADAPTER_REST_NAMESPACE );

export default HalAdapter.extend({

	namespace: config.APP.SPRING_BOOT_ADAPTER_REST_NAMESPACE,
	host : config.APP.SPRING_BOOT_ADAPTER_REST_HOST,
		
	init : function() {
		Ember.debug('Spring Boot: Loaded Custom Adapter');
	}

});