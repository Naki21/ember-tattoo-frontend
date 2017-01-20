import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.get('store').findRecord('contest', params.contest_id);
  },
  actions: {
    saveSubmission(submission) {
      this.get('store').createRecord('submission', submission).save();
    },
    cancel(submission) {
      this.transitionTo('contests');
      console.log('cancel route');
    }
  }
});
