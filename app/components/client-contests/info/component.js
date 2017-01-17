import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['page-header'],
  actions: {
    edit(){
    console.log('in the info comp', this.get('contest'));
      this.sendAction('editContest', this.get('contest'));
    }
  }
});
