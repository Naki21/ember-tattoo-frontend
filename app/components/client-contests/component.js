import Ember from 'ember';

export default Ember.Component.extend({
  auth: Ember.inject.service(),

  isClient: Ember.computed.alias('auth.isClient'),

  tagName: 'div',
  classNames: ['container-fluid well'],

  actions: {
    edit() {
      console.log('in the client contests');
      this.sendAction('editContest', this.get('contest'));
    }
  }
});
