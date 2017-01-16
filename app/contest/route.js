import Ember from 'ember';

export default Ember.Route.extend({
  model(contest) {
  console.log(contest);
  return this.get('store').findRecord('contest', contest.contest_id);
},
actions: {
  editContest(){
    console.log('In Contest Route');
    this.transitionTo('contest.edit');
  }
}
});
