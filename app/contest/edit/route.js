import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    editContest(contest){
      console.log(contest);
      console.log(this.get('contest.prize'));
      console.log('here');
      contest.save();
      this.transitionTo('contest', contest.id);
    }
  }
});
