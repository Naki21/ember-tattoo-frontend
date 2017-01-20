import Ember from 'ember';

export default Ember.Component.extend({
  auth: Ember.inject.service(),

  isArtist: Ember.computed.alias('auth.isArtist'),
  submission: {
    title: null,
    descripton: null,
    image: null,
    rating: 0,
  },
  actions: {
    save() {
      console.log('Inside submission new component');
      console.log(this.get('contest'));
      console.log(this.get('contest.id'));
      console.log(this.get('submission'));
      let submission = this.get('submission');
      submission.contest = this.get('contest');
      this.sendAction('save', submission);
    },
    cancel() {
      this.sendAction('cancel', this.get('submission'));
    }
  }
});
