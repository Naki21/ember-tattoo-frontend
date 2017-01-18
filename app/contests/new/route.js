import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.get('store').createRecord('contest');
  },
    actions: {
      willTransition () {
      let store = this.get('store');
      store.peekAll('contest').forEach(function (contest) {
        if (contest.get('isNew') && contest.get('hasDirtyAttributes')) {
          contest.rollbackAttributes();
        }
      });
      return true;
    },
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
