import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    save() {
      console.log('in component edit save');
      console.log(this.get('contest'));
      this.sendAction('save', this.get('contest'));
    },
    cancel() {
      this.sendAction('cancel', this.get('contest'));
    }
  }
});
