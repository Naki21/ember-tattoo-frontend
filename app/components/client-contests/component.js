import Ember from 'ember';

export default Ember.Component.extend({
actions: {
  actions: {
    edit(contest){
      console.log('in the client contests');
      this.sendAction('edit', contest);
    }
  }
}
});
