import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.get('store').findAll('contest');
  },
  actions: {
    editContest(contest){
      console.log('inside contests route');
      console.log(contest.id);
      this.transitionTo('contest.edit', contest.id);
    }
  }
});
