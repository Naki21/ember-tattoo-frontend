import DS from 'ember-data';

export default DS.Model.extend({
  image: DS.attr('string'),
  rating: DS.attr('number'),
  contest: DS.belongsTo('contest'),
});
