import Ember from 'ember';

export default Ember.Component.extend({
  auth: Ember.inject.service(),
  isArtist: Ember.computed.alias('auth.isArtist'),

});
