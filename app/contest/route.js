import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
  return this.get('store').findRecord('contest', params.contest_id);
},
actions: {
  editContest(){
    console.log('In Contest Route');
    this.transitionTo('contest.edit');
  }
}
});
