import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['form-group'],
  actions: {
    flavorToggled(choice) {
  console.log("changing flavor choice", choice);
  this.set('role', choice);
  console.log(this.get('role'));
}
  }
});
