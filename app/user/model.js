import DS from 'ember-data';

export default DS.Model.extend({
  email: DS.attr('string'),
  // contests: DS.hasMany('contest')
});
