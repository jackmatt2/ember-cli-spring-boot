import DS from 'ember-data';
import Ember from 'ember';

export default DS.Store.extend({
	
	polymorphicTypeAttribute : 'javaClass',
	
    init: function() {
        Ember.debug('Spring Boot: Loaded Custom Store');
        return this._super.apply(this, arguments);
    },

    /**
     * Polymorphic type support: http://vimeo.com/115987599 (7:21)
     */
    push : function(type, data, _partial) {
        var dataType, modelType, oldRecord, oldType;

        modelType = oldType = type;
        var polymorphicTypeAttribute = this.get('polymorphicTypeAttribute');
        dataType = data[polymorphicTypeAttribute]; //The type parameter is required in the payload with the subclass name

        if(dataType) {
        	data[polymorphicTypeAttribute] = undefined; //Don't want to set this on the model
        	dataType = dataType.dasherize();
            if(dataType && (this.modelFor(oldType) !== this.modelFor(dataType))) {
                modelType = dataType;

                if(oldRecord = this.getById(oldType, data.id)) {
                    this.dematerializeRecord(oldRecord);
                }

            }
        }

        return this._super(this.modelFor(modelType), data, _partial);

    }
});