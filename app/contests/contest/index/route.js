import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  isArtist: Ember.computed.alias('auth.isArtist'),

  //   model(params) {
  //   return this.get('store').findRecord('contest', params.contest_id);
  // },
  actions: {
    delete(submission) {
      console.log('delete in index contest');
      submission.destroyRecord();
    }
  }
});
