import DS from 'ember-data';

export default DS.Model.extend({
  image: DS.attr('string'),
  title: DS.attr('string'),
  description: DS.attr('string'),
  rating: DS.attr('number'),
  contest: DS.belongsTo('contest'),
  submission: DS.belongsTo('submission'),
  editable: DS.attr('boolean'),

});
