import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['col-sm-6 col-md-4'],
  actions: {
    updateRating(params) {
     const { item: submission, rating } = params;
     submission.set('rating', rating);
     return submission.save();
  }
}
});
