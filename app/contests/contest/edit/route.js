import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    editContest(contest) {
      console.log(contest);
      console.log(this.get('contest.prize'));
      console.log('here');
      contest.save();
      this.transitionTo('contests.contest', contest.id);
    },
    cancelContest(contest) {
      contest.rollbackAttributes();
      this.transitionTo('contest', contest.id);
      console.log('cancel route');
    }
  }
});
