import Ember from 'ember';

export default Ember.Route.extend({

  model() {
  return this.get('store').createRecord('contest', {});
},
actions: {
  newContest(contest) {
    contest.save();
    console.log(contest);
    this.transitionTo('contests');
  }
}
});
