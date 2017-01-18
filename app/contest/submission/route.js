import Ember from 'ember';

export default Ember.Route.extend({
    model(params){
      console.log(params);
    // return this.get('store').findRecord('submission', params.submission_id);
  }
});
