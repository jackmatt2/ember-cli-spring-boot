# ember-cli-spring-boot
Spring Boot integration for ember-data

##Installation
```
TODO - Still in Development
```

##Feature Summary
* Lazy loading of all relationships
* Spring Boot Configuration
* spring-data-rest integration with ember-data
* Polymorphic relationship support via JPA mappings
* CORS
* Ember metadata
* Side Loading Records
* Tips

##Feature Details
###Lazy loading of all relationships
All `DS.belongsTo()` and `DS.hasMany()` relationships should be marked with `{async : true}`. What this means is that all relationships are lazy loaded (Hibernate likes this).

```javascript
//blog
export default DS.Model.extend({
	name : DS.attr('string'),
	category : DS.belongsTo('category', {async : true}), //needs to be {async : true}
	posts : DS.belongsTo('post', {async : true}) //needs to be {async : true}
});
```

###Spring Boot Configuration
Add the following dependency:

Gradle Users
```
compile("org.reflections:reflections:0.9.9-RC2")
```

Maven Users
```xml
<dependency>
	<groupId>org.reflections</groupId>
	<artifactId>reflections-maven</artifactId>
	<version>0.9.9-RC2</version>
</dependency>
```
You need to configure spring-data-rest to return the payload when creating and updating records.  In addition I configured it to also return the ID of the record although this is not strictly necessary as the ember parser will already do this for us. replace `com.yourpackage.domain` with the package containing your @Entity classes.

```java
package com.yourpackage;

import java.nio.charset.Charset;
import java.util.Set;

import javax.persistence.Entity;

import org.reflections.Reflections;
import org.springframework.boot.autoconfigure.data.rest.SpringBootRepositoryRestMvcConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.http.MediaType;

@Configuration
public class RepositoryConfig extends SpringBootRepositoryRestMvcConfiguration {

	@Override
	protected void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {

		Reflections reflections = new Reflections("com.yourpackage.domain");
		Set<Class<?>> entities =
				reflections.getTypesAnnotatedWith(Entity.class, false);

		config.setReturnBodyOnCreate(true)
				.setReturnBodyOnUpdate(true)
				.exposeIdsFor(entities.toArray(new Class[entities.size()]))
				.setDefaultMediaType(new MediaType("application", "json",
						Charset.forName("UTF-8")));
	}
}
```

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


###CORS
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
###Ember metadata
TODO

###Side Loading Records
TODO

###Tips
* Don't add the ember-cli project anywhere under `/src` or any folder that gets added to the tomcat server as this slows load time.  Instead create a new folder in the root of your project called `ember`.  Later you can deploy the production code via the build command `ember build --environment=production --output-path=../public` which will obfuscate, minify and other goodies.
