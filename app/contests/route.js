import Ember from 'ember';

export default Ember.Route.extend({
actions: {
  edit(contest){
    // console.log('inside contests route');
    this.transitionTo('contest.edit', contest);
  }
}
});
