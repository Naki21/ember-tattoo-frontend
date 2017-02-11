import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('client-contests/info/image-carosel', 'Integration | Component | client contests/info/image carosel', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{client-contests/info/image-carosel}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#client-contests/info/image-carosel}}
      template block text
    {{/client-contests/info/image-carosel}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
