import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  prize: DS.attr('number'),
  end_date: DS.attr('string'),
  description: DS.attr('string'),
  submissions: DS.hasMany('submission', {async: true}),
  user: DS.belongsTo('user')
});
