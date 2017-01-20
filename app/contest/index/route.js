import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  isArtist: Ember.computed.alias('auth.isArtist'),

  actions: {
    delete(submission){
      console.log('delete in index contest');
submission.destroyRecord();
    }
  }
});
