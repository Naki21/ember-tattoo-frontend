import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['card'],

  actions: {
    edit(){
    console.log('in the info comp', this.get('contest'));
      this.sendAction('editContest', this.get('contest'));
    }
  }
});
