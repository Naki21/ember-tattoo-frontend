import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('client-contests/info', 'Integration | Component | client contests/info', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{client-contests/info}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#client-contests/info}}
      template block text
    {{/client-contests/info}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
