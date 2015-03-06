# ember-cli-spring-boot
Spring Boot integration for  ember-data

##Feature Summary
* spring-data-rest integration with ember-data
* Polymorphic relationship support via JPA mappings
* CORS Support

##Feature Details
###spring-data-rest integration with ember-data
By default spring-data-rest uses HAL JSON.  This plugin has a patch to convert HAL format to a format that is supported by ember-data.

###Polymorphic relationships
Polymorphic relationships don't really work in ember-data even with the `polymorphic : true` flag set as this requires that you are fetching via a relationship and not directly form the server.

This addon supplies a patch that supports it for every class that has a `javaClass` attribute.

You can enable polymorphic support for any `@Entity` by adding the following to the superclass.

```java
	@Transient
	public String getJavaClass() {
		return this.getClass().getSimpleName();
	}
```

**Example** 
JPA abstract Type:

```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Animal {

	@Column
	private String type;
	
	@Transient
	public String getJavaClass() {
		return this.getClass().getSimpleName();
	}
	
	...
	
}
```

And a subclass implementation:

```java
@Entity
public class Dog extends Animal {

	@Column
	private String breed;

  ...
}
```

Ember models
```javascript
//app/models/animal.js
import DS from 'ember-data';
export default DS.Model.extend({
	type : DS.attr('string')
});
```
```javascript
//app/models/dog.js
import Animal from './animal';
export default Animal.extend({
	breed : DS.attr('string')
});
```

Now you can do something like below and all classes will be converted into their correct subclass.

```javascript
this.store.find('animal');
```


###Adding CORS Support to Spring Boot.  
You will probably do you ember development on the http://localhost:4200 server, therefore, you will need to enable CORS in spring boot.

```java
package com.yourpackage.utils;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;

@Component
public class SimpleCORSFilter implements Filter {

	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletResponse response = (HttpServletResponse) res;
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
		response.setHeader("Access-Control-Max-Age", "3600");
		response.setHeader("Access-Control-Allow-Headers", "x-requested-with, Content-Type");
		chain.doFilter(req, res);
	}

	public void init(FilterConfig filterConfig) {
	}

	public void destroy() {
	}

}
```

Additionally you will need to set the following variables in config/environment.js of you ember-cli project inside the `APP` object.
```
SPRING_BOOT_ADAPTER_REST_HOST : 'http://localhost:8080', //point to your spring-boot server
SPRING_BOOT_ADAPTER_REST_NAMESPACE = '' //needs to match spring.data.rest.base-uri in application.properties of you spring-boot app
```

