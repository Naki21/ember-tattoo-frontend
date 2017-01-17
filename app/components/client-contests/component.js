import Ember from 'ember';

export default Ember.Component.extend({
actions: {
    edit(){
      console.log('in the client contests');
      this.sendAction('editContest', this.get('contest'));
  }
}
});
