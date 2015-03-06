import config from '../config/environment';
import springBootConfig from 'ember-cli-spring-boot/config';

export default {
  name: "spring boot environment details",

  initialize: function(container, app) {
	  $.extend(true, springBootConfig, config);
  }
};