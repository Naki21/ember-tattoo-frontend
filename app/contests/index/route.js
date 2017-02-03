import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  isClient: Ember.computed.alias('auth.isClient'),

  model() {
    return this.get('store').findAll('contest');
  },
  actions: {
    editContest(contest) {
      console.log('inside contests route');
      console.log(contest.id);
      this.transitionTo('contests.contest.edit', contest.id);
    },

  }
});
