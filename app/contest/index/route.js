import Ember from 'ember';

export default Ember.Route.extend({
  auth: Ember.inject.service(),
  isArtist: Ember.computed.alias('auth.isArtist'),
});
