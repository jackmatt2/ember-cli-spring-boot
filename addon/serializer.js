import HalSerializer from "./ember-data-hal-9000/serializer";
import Ember from 'ember';

export default HalSerializer.extend({
	
	init: function() {
	    Ember.debug('Spring Boot: Loaded Custom Serializer');
	    return this._super.apply(this, arguments);
	},

    extractArray: function(store, primaryType, rawPayload) {
    	var typeKey = primaryType.typeKey;
    	var mergedPayload = [];
    	
    	//merge subclasses into a single supertype record
    	for (var property in rawPayload._embedded) {
    		var originalValue = rawPayload._embedded[property];
    		var isOwnProperty = rawPayload._embedded.hasOwnProperty(property);
    		//var isSubclassOfPrimaryType = true;
    	    var isArray = Ember.isArray(originalValue);
    	    
    	    //Check if the property is a subclass of the primaryType requested
    	    var collectionModelClass = property.singularize().dasherize();
    	    var CollectionModel = store.modelFor(collectionModelClass);
    	    var isSubclassOfPrimaryType = CollectionModel instanceof primaryType.constructor;
    	    
    		if (isOwnProperty && isSubclassOfPrimaryType && isArray) {
    			mergedPayload.pushObjects(originalValue);
    			delete rawPayload._embedded[property];
    	    }
    	}
    	
    	rawPayload._embedded[typeKey] = mergedPayload;

    	return this._super(store, primaryType, rawPayload);
    },
    
	
	serializeIntoHash: function(hash, type, record, options) {
		var serialized = this.serialize(record, options);
		
//		//Setup Self Link
//		serialized['_links'] = {};
//		serialized['_links'].self = {};
//		serialized['_links'].self.href = 'http://localhost:8080/hal' + '/' + relationshipType.type.pluralize() + '/' + record.id;
		
	    //Iterate relationship and turn plain ID values into URL String
	    type.eachRelationship(function(attribute) {
	    	var relationshipType = type.metaForProperty(attribute);
	    	if(relationshipType.kind === 'belongsTo') {
	    		serialized[attribute] = 'http://localhost:8080/hal' + '/' + relationshipType.type.pluralize() + '/' + record.get(attribute + '.id');
	    	}
	    });
		
		//remove the root element
		Ember.merge(hash, serialized);
	}

});