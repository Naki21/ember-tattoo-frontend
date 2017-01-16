import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    save() {
      this.sendAction('save', this.get('contest'));
    },
    cancel() {
      console.log('inside the edit componant cancel finction');
      this.sendAction('cancel', this.get('contest'));
    }
  }
});
