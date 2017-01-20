import Ember from 'ember';

export default Ember.Component.extend({
  auth: Ember.inject.service(),

  isArtist: Ember.computed.alias('auth.isArtist'),
  isClient: Ember.computed.alias('auth.isClient'),
  tagName: 'div',
  classNames: ['col-sm-6 col-md-4'],
  actions: {
    updateRating(params) {
     const { item: submission, rating } = params;
     submission.set('rating', rating);
     return submission.save();
  },
  delete(){
    console.log('here in delete');
    this.sendAction('delete', this.get('submission'));
  }
}
});
