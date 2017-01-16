import Ember from 'ember';

export default Ember.Route.extend({
  model(contest) {
  console.log(contest);
  return this.get('store').findRecord('contest', contest.contest_id);
},
actions: {
  editContest(contest){
    console.log('here');
    console.log(this.get('contest'));
    console.log(this.get('contest.prize'));
    console.log('here');
    this.transitionTo('contest.edit');
  }
}
});
