import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.get('store').createRecord('contest');
  },
  actions: {
    newContest(contest) {
      contest.save();
      console.log(contest);
      this.transitionTo('contests');
    },
    cancelNewContest(contest) {
      contest.rollbackAttributes();
      this.transitionTo('contests');
      console.log('cancel route');
    }
  }
});
