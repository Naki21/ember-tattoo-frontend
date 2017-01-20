"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('ember-tattoo-frontend/ajax/service', ['exports', 'ember', 'ember-ajax/services/ajax', 'ember-tattoo-frontend/config/environment'], function (exports, _ember, _emberAjaxServicesAjax, _emberTattooFrontendConfigEnvironment) {
  exports['default'] = _emberAjaxServicesAjax['default'].extend({
    host: _emberTattooFrontendConfigEnvironment['default'].apiHost,

    auth: _ember['default'].inject.service(),
    headers: _ember['default'].computed('auth.credentials.token', {
      get: function get() {
        var headers = {};
        var token = this.get('auth.credentials.token');
        if (token) {
          headers.Authorization = 'Token token=' + token;
        }
        return headers;
      }
    })
  });
});
define('ember-tattoo-frontend/app', ['exports', 'ember', 'ember-tattoo-frontend/resolver', 'ember-load-initializers', 'ember-tattoo-frontend/config/environment'], function (exports, _ember, _emberTattooFrontendResolver, _emberLoadInitializers, _emberTattooFrontendConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _emberTattooFrontendConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _emberTattooFrontendConfigEnvironment['default'].podModulePrefix,
    Resolver: _emberTattooFrontendResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _emberTattooFrontendConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('ember-tattoo-frontend/application/adapter', ['exports', 'ember-tattoo-frontend/config/environment', 'active-model-adapter', 'ember'], function (exports, _emberTattooFrontendConfigEnvironment, _activeModelAdapter, _ember) {
  exports['default'] = _activeModelAdapter['default'].extend({
    host: _emberTattooFrontendConfigEnvironment['default'].apiHost,

    auth: _ember['default'].inject.service(),

    headers: _ember['default'].computed('auth.credentials.token', {
      get: function get() {
        var headers = {};
        var token = this.get('auth.credentials.token');
        if (token) {
          headers.Authorization = 'Token token=' + token;
        }

        return headers;
      }
    })
  });
});
define('ember-tattoo-frontend/application/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),

    actions: {
      signOut: function signOut() {
        var _this = this;

        this.get('auth').signOut().then(function () {
          return _this.get('store').unloadAll();
        }).then(function () {
          return _this.transitionTo('sign-in');
        }).then(function () {
          _this.get('flashMessages').warning('You have been signed out.');
        })['catch'](function () {
          _this.get('flashMessages').danger('There was a problem. Are you sure you\'re signed-in?');
        });
      },

      error: function error(reason) {
        var unauthorized = reason.errors && reason.errors.some(function (error) {
          return error.status === '401';
        });

        if (unauthorized) {
          this.get('flashMessages').danger('You must be authenticated to access this page.');
          this.transitionTo('/sign-in');
        } else {
          this.get('flashMessages').danger('There was a problem. Please try again.');
        }

        return false;
      }
    }
  });
});
define('ember-tattoo-frontend/application/serializer', ['exports', 'active-model-adapter'], function (exports, _activeModelAdapter) {
  exports['default'] = _activeModelAdapter.ActiveModelSerializer.extend({});
});
define("ember-tattoo-frontend/application/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "z52ndvgF", "block": "{\"statements\":[[\"append\",[\"helper\",[\"my-application\"],null,[[\"signOut\"],[\"signOut\"]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/application/template.hbs" } });
});
define('ember-tattoo-frontend/auth/service', ['exports', 'ember', 'ember-local-storage'], function (exports, _ember, _emberLocalStorage) {
  exports['default'] = _ember['default'].Service.extend({
    ajax: _ember['default'].inject.service(),
    credentials: (0, _emberLocalStorage.storageFor)('auth'),
    isAuthenticated: _ember['default'].computed.bool('credentials.token'),
    isArtist: _ember['default'].computed.equal('credentials.role', 'artist'),
    isClient: _ember['default'].computed.equal('credentials.role', 'client'),

    signUp: function signUp(credentials) {
      return this.get('ajax').post('/sign-up', {
        data: {
          credentials: {
            email: credentials.email,
            password: credentials.password,
            password_confirmation: credentials.passwordConfirmation,
            role: credentials.role
          }
        }
      });
    },

    signIn: function signIn(credentials) {
      var _this = this;

      return this.get('ajax').post('/sign-in', {
        data: {
          credentials: {
            email: credentials.email,
            password: credentials.password
          }
        }
      }).then(function (result) {
        _this.get('credentials').set('id', result.user.id);
        _this.get('credentials').set('email', result.user.email);
        _this.get('credentials').set('token', result.user.token);
        _this.get('credentials').set('role', result.user.role);
      });
    },

    changePassword: function changePassword(passwords) {
      return this.get('ajax').patch('/change-password/' + this.get('credentials.id'), {
        data: {
          passwords: {
            old: passwords.previous,
            'new': passwords.next
          }
        }
      });
    },

    signOut: function signOut() {
      var _this2 = this;

      return this.get('ajax').del('/sign-out/' + this.get('credentials.id'))['finally'](function () {
        return _this2.get('credentials').reset();
      });
    }
  });
});
define('ember-tattoo-frontend/auth/storage', ['exports', 'ember-local-storage/local/object'], function (exports, _emberLocalStorageLocalObject) {
  exports['default'] = _emberLocalStorageLocalObject['default'].extend({});
});
define('ember-tattoo-frontend/change-password/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),

    actions: {
      changePassword: function changePassword(passwords) {
        var _this = this;

        this.get('auth').changePassword(passwords).then(function () {
          return _this.get('auth').signOut();
        }).then(function () {
          return _this.transitionTo('sign-in');
        }).then(function () {
          _this.get('flashMessages').success('Successfully changed your password!');
        }).then(function () {
          _this.get('flashMessages').warning('You have been signed out.');
        })['catch'](function () {
          _this.get('flashMessages').danger('There was a problem. Please try again.');
        });
      }
    }
  });
});
define("ember-tattoo-frontend/change-password/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ClfLjOZh", "block": "{\"statements\":[[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Change Password\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"append\",[\"helper\",[\"change-password-form\"],null,[[\"submit\"],[\"changePassword\"]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/change-password/template.hbs" } });
});
define('ember-tattoo-frontend/component-tests/star-rating', ['exports', 'ember-cli-star-rating/component-tests/star-rating'], function (exports, _emberCliStarRatingComponentTestsStarRating) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliStarRatingComponentTestsStarRating['default'];
    }
  });
});
define('ember-tattoo-frontend/components/change-password-form/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'form',
    classNames: ['form-horizontal'],

    passwords: {},

    actions: {
      submit: function submit() {
        this.sendAction('submit', this.get('passwords'));
      },

      reset: function reset() {
        this.set('passwords', {});
      }
    }
  });
});
define("ember-tattoo-frontend/components/change-password-form/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "wqIGQtz9", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"previous\"],[\"flush-element\"],[\"text\",\"Old Password\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"id\",\"placeholder\",\"value\"],[\"password\",\"form-control\",\"previous\",\"Old password\",[\"get\",[\"passwords\",\"previous\"]]]]],false],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"next\"],[\"flush-element\"],[\"text\",\"New Password\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"id\",\"placeholder\",\"value\"],[\"password\",\"form-control\",\"next\",\"New password\",[\"get\",[\"passwords\",\"next\"]]]]],false],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"submit\"]],[\"flush-element\"],[\"text\",\"\\n  Change Password\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"reset\"]],[\"flush-element\"],[\"text\",\"\\n  Cancel\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/change-password-form/template.hbs" } });
});
define('ember-tattoo-frontend/components/client-contests/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['container-fluid well'],
    actions: {
      edit: function edit() {
        console.log('in the client contests');
        this.sendAction('editContest', this.get('contest'));
      }
    }
  });
});
define('ember-tattoo-frontend/components/client-contests/edit/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    actions: {
      save: function save() {
        this.sendAction('save', this.get('contest'));
      },
      cancel: function cancel() {
        console.log('inside the edit componant cancel finction');
        this.sendAction('cancel', this.get('contest'));
      }
    }
  });
});
define("ember-tattoo-frontend/components/client-contests/edit/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "CEyQt+ik", "block": "{\"statements\":[[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"save\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newContestInput\"],[\"flush-element\"],[\"text\",\"Title\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"id\",\"placeholder\",\"value\"],[\"text\",\"form-control\",\"newContestName\",\"Contest Title\",[\"get\",[\"contest\",\"name\"]]]]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newContestInput\"],[\"flush-element\"],[\"text\",\"Prize\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon\"],[\"flush-element\"],[\"text\",\"$\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"id\",\"placeholder\",\"value\"],[\"integer\",\"form-control\",\"newContestPrize\",\"How much will this contest be for?\",[\"get\",[\"contest\",\"prize\"]]]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon\"],[\"flush-element\"],[\"text\",\".00\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newContestInput\"],[\"flush-element\"],[\"text\",\"End Date\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"id\",\"value\"],[\"date\",\"form-control\",\"newContestEndDate\",[\"get\",[\"contest\",\"end_date\"]]]]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newContestInput\"],[\"flush-element\"],[\"text\",\"Description\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"type\",\"class\",\"id\",\"placeholder\",\"value\"],[\"text\",\"form-control\",\"newContestDescription\",\"Please write a little about what you are looking for in your tattoo\",[\"get\",[\"contest\",\"description\"]]]]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-success\"],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"name\",\"button\"],[\"flush-element\"],[\"text\",\"Create\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-danger\"],[\"static-attr\",\"name\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancel\"]],[\"flush-element\"],[\"text\",\"Cancel\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/client-contests/edit/template.hbs" } });
});
define('ember-tattoo-frontend/components/client-contests/info/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['page-header'],
    actions: {
      edit: function edit() {
        console.log('in the info comp', this.get('contest'));
        this.sendAction('editContest', this.get('contest'));
      }
    }
  });
});
define("ember-tattoo-frontend/components/client-contests/info/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "02TpivBD", "block": "{\"statements\":[[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"contest\",\"name\"]],false],[\"open-element\",\"small\",[]],[\"flush-element\"],[\"text\",\"   $\"],[\"append\",[\"unknown\",[\"contest\",\"prize\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"contests\"],null,0],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"Back\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/client-contests/info/template.hbs" } });
});
define('ember-tattoo-frontend/components/client-contests/new/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({

    actions: {
      save: function save() {
        this.sendAction('save', this.get('contest'));
      },
      cancel: function cancel() {
        this.sendAction('cancel', this.get('contest'));
      }
    }
  });
});
define("ember-tattoo-frontend/components/client-contests/new/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "osLrMt7F", "block": "{\"statements\":[[\"open-element\",\"form\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"save\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newContestInput\"],[\"flush-element\"],[\"text\",\"Title\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"required\",\"class\",\"id\",\"placeholder\",\"value\"],[\"text\",\"true\",\"form-control\",\"newContestName\",\"Contest Title\",[\"get\",[\"contest\",\"name\"]]]]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newContestInput\"],[\"flush-element\"],[\"text\",\"Prize\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon\"],[\"flush-element\"],[\"text\",\"$\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"required\",\"id\",\"placeholder\",\"value\"],[\"number\",\"form-control\",\"true\",\"newContestPrize\",\"How much will this contest be for?\",[\"get\",[\"contest\",\"prize\"]]]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group-addon\"],[\"flush-element\"],[\"text\",\".00\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newContestInput\"],[\"flush-element\"],[\"text\",\"End Date\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"input\"],null,[[\"required\",\"type\",\"class\",\"id\",\"value\"],[\"true\",\"date\",\"form-control\",\"newContestEndDate\",[\"get\",[\"contest\",\"end_date\"]]]]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"newContestInput\"],[\"flush-element\"],[\"text\",\"Description\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"type\",\"class\",\"id\",\"required\",\"placeholder\",\"value\"],[\"text\",\"form-control\",\"newContestDescription\",\"true\",\"Please write a little about what you are looking for in your tattoo\",[\"get\",[\"contest\",\"description\"]]]]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-success\"],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"name\",\"button\"],[\"flush-element\"],[\"text\",\"Create\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-danger\"],[\"static-attr\",\"name\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancel\"]],[\"flush-element\"],[\"text\",\"Cancel\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/client-contests/new/template.hbs" } });
});
define('ember-tattoo-frontend/components/client-contests/submission/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    auth: _ember['default'].inject.service(),

    isArtist: _ember['default'].computed.alias('auth.isArtist'),
    isClient: _ember['default'].computed.alias('auth.isClient'),
    tagName: 'div',
    classNames: ['col-sm-6 col-md-4'],
    actions: {
      updateRating: function updateRating(params) {
        var submission = params.item;
        var rating = params.rating;

        submission.set('rating', rating);
        return submission.save();
      },
      'delete': function _delete() {
        console.log('here in delete');
        this.sendAction('delete', this.get('submission'));
      }
    }
  });
});
define('ember-tattoo-frontend/components/client-contests/submission/new/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    auth: _ember['default'].inject.service(),
    isArtist: _ember['default'].computed.alias('auth.isArtist'),
    submission: {
      title: null,
      descripton: null,
      image: null,
      rating: 0
    },
    actions: {
      save: function save() {
        console.log('Inside submission new component');
        console.log(this.get('contest'));
        console.log(this.get('contest.id'));
        console.log(this.get('submission'));
        var submission = this.get('submission');
        submission.contest = this.get('contest');
        this.sendAction('save', submission);
      },
      cancel: function cancel() {
        console.log('cancel component sub');
        this.sendAction('cancel', this.get('submission'));
      }
    }
  });
});
define("ember-tattoo-frontend/components/client-contests/submission/new/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "BoTdMPuS", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isArtist\"]]],null,0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-group\"],[\"static-attr\",\"id\",\"accordion\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel panel-default\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-heading\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"panel-title\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"static-attr\",\"data-parent\",\"#accordion\"],[\"static-attr\",\"href\",\"#collapseOne\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-file\"],[\"flush-element\"],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"POST NEW DESIGN\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"collapseOne\"],[\"static-attr\",\"class\",\"panel-collapse collapse in\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"panel-body\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"save\"],[[\"on\"],[\"submit\"]]],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"required\",\"class\",\"placeholder\",\"value\"],[\"text\",\"true\",\"form-control\",\"Title\",[\"get\",[\"submission\",\"title\"]]]]],false],[\"text\",\"\\n                      \"],[\"close-element\"],[\"text\",\"\\n                      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"required\",\"class\",\"placeholder\",\"rows\",\"value\"],[\"true\",\"form-control\",\"Description\",\"5\",[\"get\",[\"submission\",\"description\"]]]]],false],[\"text\",\"\\n                      \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"well well-sm\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n                          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-addon\"],[\"flush-element\"],[\"text\",\"www.jquery2dotnet.com/\"],[\"close-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"required\",\"class\",\"placeholder\",\"value\"],[\"text\",\"true\",\"form-control\",\"Image Url\",[\"get\",[\"submission\",\"image\"]]]]],false],[\"text\",\"\\n                        \"],[\"close-element\"],[\"text\",\"\\n                      \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6\"],[\"flush-element\"],[\"text\",\"\\n                      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"well well-sm well-primary\"],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-success btn-sm\"],[\"flush-element\"],[\"text\",\"\\n                                                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-floppy-disk\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"Submit\"],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-danger btn-sm\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"cancel\"]],[\"flush-element\"],[\"text\",\"\\n                          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-floppy-disk\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"Cancel\"],[\"close-element\"],[\"text\",\"\\n                      \"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/client-contests/submission/new/template.hbs" } });
});
define("ember-tattoo-frontend/components/client-contests/submission/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Qdtw3HUP", "block": "{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"thumbnail\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"img\",[]],[\"dynamic-attr\",\"src\",[\"unknown\",[\"submission\",\"image\"]],null],[\"static-attr\",\"alt\",\"...\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"caption\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"submission\",\"title\"]],false],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"block\",[\"if\"],[[\"get\",[\"isClient\"]]],null,1],[\"text\",\"\\n        \"],[\"block\",[\"if\"],[[\"get\",[\"submission\",\"editable\"]]],null,0],[\"text\",\"\\n         \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-danger\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"delete\"]],[\"flush-element\"],[\"text\",\"Delete\"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"star-rating\"],null,[[\"item\",\"rating\",\"on-click\",\"fullClassNames\",\"emptyClassNames\"],[[\"get\",[\"submission\"]],[\"get\",[\"submission\",\"rating\"]],\"updateRating\",\"glyphicon glyphicon-star\",\"glyphicon glyphicon-star-empty\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/client-contests/submission/template.hbs" } });
});
define("ember-tattoo-frontend/components/client-contests/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "W7APJ32S", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"media-left\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"contest\",[\"get\",[\"contest\",\"id\"]]],null,1],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"media-body\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"media-heading\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"contest\",\"name\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"$\"],[\"append\",[\"unknown\",[\"contest\",\"prize\"]],false],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"contest\",\"end_date\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isClient\"]]],null,0],[\"text\",\"\\n\\n\\n\"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-warning btn-xs\"],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"name\",\"editButton\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"edit\"]],[\"flush-element\"],[\"text\",\"Edit\"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"media-object\"],[\"static-attr\",\"src\",\"http://placehold.it/64x64\"],[\"static-attr\",\"alt\",\"...\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/client-contests/template.hbs" } });
});
define('ember-tattoo-frontend/components/email-input/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['form-group']
  });
});
define("ember-tattoo-frontend/components/email-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "sXXoMx/x", "block": "{\"statements\":[[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"email\"],[\"flush-element\"],[\"text\",\"Email\"],[\"close-element\"],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"id\",\"placeholder\",\"value\"],[\"email\",\"email\",\"Email\",[\"get\",[\"email\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/email-input/template.hbs" } });
});
define('ember-tattoo-frontend/components/flash-message', ['exports', 'ember-cli-flash/components/flash-message'], function (exports, _emberCliFlashComponentsFlashMessage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliFlashComponentsFlashMessage['default'];
    }
  });
});
define('ember-tattoo-frontend/components/hamburger-menu/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'button',
    classNames: ['navbar-toggle', 'collapsed'],
    attributeBindings: ['toggle:data-toggle', 'target:data-target', 'expanded:aria-expanded'],
    toggle: 'collapse',
    target: '#navigation',
    expanded: false
  });
});
define("ember-tattoo-frontend/components/hamburger-menu/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "kdZWQeCT", "block": "{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"sr-only\"],[\"flush-element\"],[\"text\",\"Toggle navigation\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/hamburger-menu/template.hbs" } });
});
define('ember-tattoo-frontend/components/labeled-radio-button', ['exports', 'ember-radio-button/components/labeled-radio-button'], function (exports, _emberRadioButtonComponentsLabeledRadioButton) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberRadioButtonComponentsLabeledRadioButton['default'];
    }
  });
});
define('ember-tattoo-frontend/components/my-application/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    auth: _ember['default'].inject.service(),

    user: _ember['default'].computed.alias('auth.credentials.email'),
    isAuthenticated: _ember['default'].computed.alias('auth.isAuthenticated'),
    isArtist: _ember['default'].computed.alias('auth.isArtist'),

    actions: {
      signOut: function signOut() {
        this.sendAction('signOut');
      }
    }
  });
});
define("ember-tattoo-frontend/components/my-application/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "sH5aU9px", "block": "{\"statements\":[[\"open-element\",\"nav\",[]],[\"static-attr\",\"class\",\"navbar navbar-default\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container-fluid\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"append\",[\"unknown\",[\"navbar-header\"]],false],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"collapse navbar-collapse\"],[\"static-attr\",\"id\",\"navigation\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"nav navbar-nav\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isAuthenticated\"]]],null,11],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"nav navbar-nav navbar-right\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isAuthenticated\"]]],null,5,3],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Welcome to Group th\"],[\"open-element\",\"strong\",[]],[\"flush-element\"],[\"text\",\"INK\"],[\"close-element\"],[\"text\",\"!\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"each\"],[[\"get\",[\"flashMessages\",\"queue\"]]],null,0],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"Croud sourced tattoo design.\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-8 col-md-offset-2\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"append\",[\"helper\",[\"flash-message\"],null,[[\"flash\"],[[\"get\",[\"flash\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"flash\"]},{\"statements\":[[\"text\",\"Sign In\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Sign Up\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"sign-up\"],null,2],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"sign-in\"],null,1],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"Change Password\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"change-password\"],null,4],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"signOut\"]],[\"flush-element\"],[\"text\",\"Sign Out\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"New Contest\"]],\"locals\":[]},{\"statements\":[[\"text\",\"My Contests\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"contests\"],null,7],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"contests.new\"],null,6],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"All Contests\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"block\",[\"link-to\"],[\"contests\"],null,9],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isArtist\"]]],null,10,8]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/my-application/template.hbs" } });
});
define('ember-tattoo-frontend/components/navbar-header/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['navbar-header']
  });
});
define("ember-tattoo-frontend/components/navbar-header/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "7coKNrMO", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"hamburger-menu\"]],false],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"application\"],[[\"class\"],[\"navbar-brand\"]],0],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"Home\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/navbar-header/template.hbs" } });
});
define('ember-tattoo-frontend/components/password-confirmation-input/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['form-group']
  });
});
define("ember-tattoo-frontend/components/password-confirmation-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "JrzWHR2z", "block": "{\"statements\":[[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"password-confirmation\"],[\"flush-element\"],[\"text\",\"Password Confirmation\"],[\"close-element\"],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"id\",\"placeholder\",\"value\"],[\"password\",\"password-confirmation\",\"Password Confirmation\",[\"get\",[\"password\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/password-confirmation-input/template.hbs" } });
});
define('ember-tattoo-frontend/components/password-input/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['form-group']
  });
});
define("ember-tattoo-frontend/components/password-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "TTG3+gIU", "block": "{\"statements\":[[\"open-element\",\"label\",[]],[\"static-attr\",\"for\",\"kind\"],[\"flush-element\"],[\"text\",\"Password\"],[\"close-element\"],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"id\",\"placeholder\",\"value\"],[\"password\",\"password\",\"Password\",[\"get\",[\"password\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/password-input/template.hbs" } });
});
define('ember-tattoo-frontend/components/radio-button-input', ['exports', 'ember-radio-button/components/radio-button-input'], function (exports, _emberRadioButtonComponentsRadioButtonInput) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberRadioButtonComponentsRadioButtonInput['default'];
    }
  });
});
define('ember-tattoo-frontend/components/radio-button', ['exports', 'ember-radio-button/components/radio-button'], function (exports, _emberRadioButtonComponentsRadioButton) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberRadioButtonComponentsRadioButton['default'];
    }
  });
});
define('ember-tattoo-frontend/components/sign-in-form/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'form',
    classNames: ['form-horizontal'],

    actions: {
      submit: function submit() {
        this.sendAction('submit', this.get('credentials'));
      },

      reset: function reset() {
        this.set('credentials', {});
      }
    }
  });
});
define("ember-tattoo-frontend/components/sign-in-form/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ubo7sWQ7", "block": "{\"statements\":[[\"append\",[\"helper\",[\"email-input\"],null,[[\"email\"],[[\"get\",[\"credentials\",\"email\"]]]]],false],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"password-input\"],null,[[\"password\"],[[\"get\",[\"credentials\",\"password\"]]]]],false],[\"text\",\"\\n\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"submit\"]],[\"flush-element\"],[\"text\",\"\\n  Sign In\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"reset\"]],[\"flush-element\"],[\"text\",\"\\n  Cancel\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/sign-in-form/template.hbs" } });
});
define('ember-tattoo-frontend/components/sign-up-form/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'form',
    classNames: ['form-horizontal'],

    credentials: {},

    actions: {
      submit: function submit() {
        this.sendAction('submit', this.get('credentials'));
      },

      reset: function reset() {
        this.set('credentials', {});
      }
    }
  });
});
define("ember-tattoo-frontend/components/sign-up-form/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "wfeuYmSA", "block": "{\"statements\":[[\"append\",[\"helper\",[\"email-input\"],null,[[\"email\"],[[\"get\",[\"credentials\",\"email\"]]]]],false],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"password-input\"],null,[[\"password\"],[[\"get\",[\"credentials\",\"password\"]]]]],false],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"password-confirmation-input\"],null,[[\"password\"],[[\"get\",[\"credentials\",\"passwordConfirmation\"]]]]],false],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"user-radio-input\"],null,[[\"role\"],[[\"get\",[\"credentials\",\"role\"]]]]],false],[\"text\",\"\\n\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"submit\"]],[\"flush-element\"],[\"text\",\"\\n  Sign Up\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"reset\"]],[\"flush-element\"],[\"text\",\"\\n  Cancel\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/sign-up-form/template.hbs" } });
});
define('ember-tattoo-frontend/components/star-rating', ['exports', 'ember-cli-star-rating/components/star-rating'], function (exports, _emberCliStarRatingComponentsStarRating) {
  exports['default'] = _emberCliStarRatingComponentsStarRating['default'];
});
define('ember-tattoo-frontend/components/submission-button/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    auth: _ember['default'].inject.service(),
    isArtist: _ember['default'].computed.alias('auth.isArtist')

  });
});
define("ember-tattoo-frontend/components/submission-button/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "qTrhznJj", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isArtist\"]]],null,1],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"New Submission\"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"link-to\"],[\"contest.submission\",[\"get\",[\"contest\"]]],null,0]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/submission-button/template.hbs" } });
});
define('ember-tattoo-frontend/components/user-radio-input/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['form-group'],
    actions: {
      flavorToggled: function flavorToggled(choice) {
        console.log("changing flavor choice", choice);
        this.set('role', choice);
        console.log(this.get('role'));
      }
    }
  });
});
define("ember-tattoo-frontend/components/user-radio-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "loVwNMse", "block": "{\"statements\":[[\"block\",[\"radio-button\"],null,[[\"value\",\"groupValue\",\"changed\"],[\"client\",[\"get\",[\"role\"]],\"flavorToggled\"]],1],[\"text\",\"\\n\"],[\"block\",[\"radio-button\"],null,[[\"value\",\"groupValue\",\"changed\"],[\"artist\",[\"get\",[\"role\"]],\"flavorToggled\"]],0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  Artist\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  Client\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/components/user-radio-input/template.hbs" } });
});
define('ember-tattoo-frontend/contest/edit/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    actions: {
      editContest: function editContest(contest) {
        console.log(contest);
        console.log(this.get('contest.prize'));
        console.log('here');
        contest.save();
        this.transitionTo('contest', contest.id);
      },
      cancelContest: function cancelContest(contest) {
        contest.rollbackAttributes();
        this.transitionTo('contest', contest.id);
        console.log('cancel route');
      }
    }
  });
});
define("ember-tattoo-frontend/contest/edit/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "TCjpVzRL", "block": "{\"statements\":[[\"append\",[\"helper\",[\"client-contests/edit\"],null,[[\"contest\",\"save\",\"cancel\"],[[\"get\",[\"model\"]],\"editContest\",\"cancelContest\"]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/contest/edit/template.hbs" } });
});
define('ember-tattoo-frontend/contest/index/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    isArtist: _ember['default'].computed.alias('auth.isArtist'),

    actions: {
      'delete': function _delete(submission) {
        console.log('delete in index contest');
        submission.destroyRecord();
      }
    }
  });
});
define("ember-tattoo-frontend/contest/index/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "jMOhfSx3", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"client-contests/info\"],null,[[\"contest\",\"editContest\"],[[\"get\",[\"model\"]],\"editContest\"]]],false],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"submission-button\"],null,[[\"contest\"],[[\"get\",[\"model\"]]]]],false],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"row\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\",\"submissions\"]]],null,0],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"append\",[\"helper\",[\"client-contests/submission\"],null,[[\"submission\",\"delete\"],[[\"get\",[\"submission\"]],\"delete\"]]],false],[\"text\",\"\\n\"]],\"locals\":[\"submission\"]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/contest/index/template.hbs" } });
});
define('ember-tattoo-frontend/contest/model', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr('string'),
    prize: _emberData['default'].attr('number'),
    end_date: _emberData['default'].attr('string'),
    description: _emberData['default'].attr('string'),
    submissions: _emberData['default'].hasMany('submission', { async: true }),
    // editable: DS.attr('boolean'),
    user: _emberData['default'].belongsTo('user')
  });
});
define('ember-tattoo-frontend/contest/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    //   model(params) {
    //   return this.get('store').findRecord('contest', params.contest_id);
    // },
    // actions: {
    //
    //   saveSubmission(params){
    //     modelconsole.log(params);
    //     params.save();
    //   }
    //
    // }
  });
});
define('ember-tattoo-frontend/contest/submission/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model(params) {
      return this.get('store').findRecord('contest', params.contest_id);
    },
    actions: {
      saveSubmission: function saveSubmission(submission) {
        var jpg = "jpg";
        var png = "png";
        var gif = "gif";
        var extensionString = submission.image.split('.').pop();
        if (extensionString === jpg) {} else if (extensionString === png) {} else if (extensionString === gif) {} else {
          this.get('flashMessages').warning("It appears that the URL you've tried to upload to the database is not an image URL or the URL uses an extension that is not accepted by this application. All URLs entered into the field MUST end with '.jpg', '.png', or '.gif' and must not have any character after the file extension.");
          return;
        }
        this.get('store').createRecord('submission', submission).save();
        this.transitionTo('contests');
      },
      cancel: function cancel() {
        this.transitionTo('contests');
        console.log('cancel route');
      }
    }
  });
});
define("ember-tattoo-frontend/contest/submission/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "aNRHC87M", "block": "{\"statements\":[[\"append\",[\"helper\",[\"client-contests/submission/new\"],null,[[\"contest\",\"save\",\"cancel\"],[[\"get\",[\"model\"]],\"saveSubmission\",\"cancel\"]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/contest/submission/template.hbs" } });
});
define('ember-tattoo-frontend/contest/submissions/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      return this.get('store').findAll('submission');
    }
  });
});
define("ember-tattoo-frontend/contest/submissions/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "U4v90Ds5", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/contest/submissions/template.hbs" } });
});
define("ember-tattoo-frontend/contest/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "zJvJEMfY", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/contest/template.hbs" } });
});
define('ember-tattoo-frontend/contests/index/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    isClient: _ember['default'].computed.alias('auth.isClient'),

    model: function model() {
      return this.get('store').findAll('contest');
    },
    actions: {
      editContest: function editContest(contest) {
        console.log('inside contests route');
        console.log(contest.id);
        this.transitionTo('contest.edit', contest.id);
      }

    }
  });
});
define("ember-tattoo-frontend/contests/index/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "qYwFkx3j", "block": "{\"statements\":[[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\"]]],null,1,0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"\\n\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"You currently have no open contests. Click new contest  in the navbar to  get started.\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"append\",[\"helper\",[\"client-contests\"],null,[[\"contest\",\"editContest\"],[[\"get\",[\"contest\"]],\"editContest\"]]],false],[\"text\",\"\\n\"],[\"open-element\",\"hr\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"contest\"]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/contests/index/template.hbs" } });
});
define('ember-tattoo-frontend/contests/new/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({

    model: function model() {
      return this.get('store').createRecord('contest');
    },
    actions: {
      willTransition: function willTransition() {
        var store = this.get('store');
        store.peekAll('contest').forEach(function (contest) {
          if (contest.get('isNew') && contest.get('hasDirtyAttributes')) {
            contest.rollbackAttributes();
          }
        });
        return true;
      },
      newContest: function newContest(contest) {
        contest.save();
        console.log(contest);
        this.transitionTo('contests');
      },
      cancelNewContest: function cancelNewContest(contest) {
        contest.rollbackAttributes();
        this.transitionTo('contests');
        console.log('cancel route');
      }
    }
  });
});
define("ember-tattoo-frontend/contests/new/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "aoljDTvJ", "block": "{\"statements\":[[\"append\",[\"helper\",[\"client-contests/new\"],null,[[\"contest\",\"save\",\"cancel\"],[[\"get\",[\"model\"]],\"newContest\",\"cancelNewContest\"]]],false],[\"text\",\"\\n\"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/contests/new/template.hbs" } });
});
define('ember-tattoo-frontend/contests/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("ember-tattoo-frontend/contests/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "QouEoM3G", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/contests/template.hbs" } });
});
define('ember-tattoo-frontend/controllers/array', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('ember-tattoo-frontend/controllers/object', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('ember-tattoo-frontend/flash/object', ['exports', 'ember-cli-flash/flash/object'], function (exports, _emberCliFlashFlashObject) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliFlashFlashObject['default'];
    }
  });
});
define('ember-tattoo-frontend/helpers/app-version', ['exports', 'ember', 'ember-tattoo-frontend/config/environment'], function (exports, _ember, _emberTattooFrontendConfigEnvironment) {
  exports.appVersion = appVersion;
  var version = _emberTattooFrontendConfigEnvironment['default'].APP.version;

  function appVersion() {
    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('ember-tattoo-frontend/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('ember-tattoo-frontend/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define("ember-tattoo-frontend/initializers/active-model-adapter", ["exports", "active-model-adapter", "active-model-adapter/active-model-serializer"], function (exports, _activeModelAdapter, _activeModelAdapterActiveModelSerializer) {
  exports["default"] = {
    name: 'active-model-adapter',
    initialize: function initialize() {
      var application = arguments[1] || arguments[0];
      application.register('adapter:-active-model', _activeModelAdapter["default"]);
      application.register('serializer:-active-model', _activeModelAdapterActiveModelSerializer["default"]);
    }
  };
});
define('ember-tattoo-frontend/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'ember-tattoo-frontend/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _emberTattooFrontendConfigEnvironment) {
  var _config$APP = _emberTattooFrontendConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('ember-tattoo-frontend/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('ember-tattoo-frontend/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('ember-tattoo-frontend/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('ember-tattoo-frontend/initializers/export-application-global', ['exports', 'ember', 'ember-tattoo-frontend/config/environment'], function (exports, _ember, _emberTattooFrontendConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_emberTattooFrontendConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _emberTattooFrontendConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_emberTattooFrontendConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('ember-tattoo-frontend/initializers/flash-messages', ['exports', 'ember', 'ember-tattoo-frontend/config/environment'], function (exports, _ember, _emberTattooFrontendConfigEnvironment) {
  exports.initialize = initialize;
  var deprecate = _ember['default'].deprecate;

  var merge = _ember['default'].assign || _ember['default'].merge;
  var INJECTION_FACTORIES_DEPRECATION_MESSAGE = '[ember-cli-flash] Future versions of ember-cli-flash will no longer inject the service automatically. Instead, you should explicitly inject it into your Route, Controller or Component with `Ember.inject.service`.';
  var addonDefaults = {
    timeout: 3000,
    extendedTimeout: 0,
    priority: 100,
    sticky: false,
    showProgress: false,
    type: 'info',
    types: ['success', 'info', 'warning', 'danger', 'alert', 'secondary'],
    injectionFactories: ['route', 'controller', 'view', 'component'],
    preventDuplicates: false
  };

  function initialize() {
    var application = arguments[1] || arguments[0];

    var _ref = _emberTattooFrontendConfigEnvironment['default'] || {};

    var flashMessageDefaults = _ref.flashMessageDefaults;

    var _ref2 = flashMessageDefaults || [];

    var injectionFactories = _ref2.injectionFactories;

    var options = merge(addonDefaults, flashMessageDefaults);
    var shouldShowDeprecation = !(injectionFactories && injectionFactories.length);

    application.register('config:flash-messages', options, { instantiate: false });
    application.inject('service:flash-messages', 'flashMessageDefaults', 'config:flash-messages');

    deprecate(INJECTION_FACTORIES_DEPRECATION_MESSAGE, shouldShowDeprecation, {
      id: 'ember-cli-flash.deprecate-injection-factories',
      until: '2.0.0'
    });

    options.injectionFactories.forEach(function (factory) {
      application.inject(factory, 'flashMessages', 'service:flash-messages');
    });
  }

  exports['default'] = {
    name: 'flash-messages',
    initialize: initialize
  };
});
define('ember-tattoo-frontend/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('ember-tattoo-frontend/initializers/local-storage-adapter', ['exports', 'ember-local-storage/initializers/local-storage-adapter'], function (exports, _emberLocalStorageInitializersLocalStorageAdapter) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberLocalStorageInitializersLocalStorageAdapter['default'];
    }
  });
  Object.defineProperty(exports, 'initialize', {
    enumerable: true,
    get: function get() {
      return _emberLocalStorageInitializersLocalStorageAdapter.initialize;
    }
  });
});
define('ember-tattoo-frontend/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('ember-tattoo-frontend/initializers/text-field', ['exports', 'ember'], function (exports, _ember) {
  exports.initialize = initialize;

  function initialize() {
    _ember['default'].TextField.reopen({
      classNames: ['form-control']
    });
  }

  exports['default'] = {
    name: 'text-field',
    initialize: initialize
  };
});
define('ember-tattoo-frontend/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("ember-tattoo-frontend/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('ember-tattoo-frontend/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('ember-tattoo-frontend/router', ['exports', 'ember', 'ember-tattoo-frontend/config/environment'], function (exports, _ember, _emberTattooFrontendConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _emberTattooFrontendConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.route('sign-up');
    this.route('sign-in');
    this.route('change-password');
    this.route('contests', function () {
      this.route('new');
    });
    this.route('contest', { path: "contest/:contest_id" }, function () {
      this.route('edit');
      // this.route('submission', function() {
      //   this.route('new');
      // this.route('submissions');
      // }
      // );
    });
    this.route('contest.submission', { path: "contest/:contest_id/submission" });
  });

  exports['default'] = Router;
});
define('ember-tattoo-frontend/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('ember-tattoo-frontend/services/flash-messages', ['exports', 'ember-cli-flash/services/flash-messages'], function (exports, _emberCliFlashServicesFlashMessages) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliFlashServicesFlashMessages['default'];
    }
  });
});
define('ember-tattoo-frontend/sign-in/route', ['exports', 'ember', 'rsvp'], function (exports, _ember, _rsvp) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),

    model: function model() {
      return _rsvp['default'].Promise.resolve({});
    },

    actions: {
      signIn: function signIn(credentials) {
        var _this = this;

        return this.get('auth').signIn(credentials).then(function () {
          return _this.transitionTo('application');
        }).then(function () {
          return _this.get('flashMessages').success('Thanks for signing in!');
        })['catch'](function () {
          _this.get('flashMessages').danger('There was a problem. Please try again.');
        });
      }
    }
  });
});
define("ember-tattoo-frontend/sign-in/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "WJ33DdY4", "block": "{\"statements\":[[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Sign In\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"append\",[\"helper\",[\"sign-in-form\"],null,[[\"submit\",\"reset\",\"credentials\"],[\"signIn\",\"reset\",[\"get\",[\"model\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/sign-in/template.hbs" } });
});
define('ember-tattoo-frontend/sign-up/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),

    actions: {
      signUp: function signUp(credentials) {
        var _this = this;

        this.get('auth').signUp(credentials).then(function () {
          return _this.get('auth').signIn(credentials);
        }).then(function () {
          return _this.transitionTo('application');
        }).then(function () {
          _this.get('flashMessages').success('Successfully signed-up! You have also been signed-in.');
        })['catch'](function () {
          _this.get('flashMessages').danger('There was a problem. Please try again.');
        });
      }
    }
  });
});
define("ember-tattoo-frontend/sign-up/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "THJ2VVUi", "block": "{\"statements\":[[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Sign Up\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"append\",[\"helper\",[\"sign-up-form\"],null,[[\"submit\"],[\"signUp\"]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/sign-up/template.hbs" } });
});
define('ember-tattoo-frontend/submission/model', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    image: _emberData['default'].attr('string'),
    title: _emberData['default'].attr('string'),
    description: _emberData['default'].attr('string'),
    rating: _emberData['default'].attr('number'),
    contest: _emberData['default'].belongsTo('contest'),
    submission: _emberData['default'].belongsTo('submission'),
    editable: _emberData['default'].attr('boolean')

  });
});
define('ember-tattoo-frontend/user/model', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    email: _emberData['default'].attr('string'),
    contests: _emberData['default'].hasMany('contest', { async: true }),
    submissions: _emberData['default'].hasMany('submission', { async: true })
  });
});
define('ember-tattoo-frontend/users/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      return this.get('store').findAll('user');
    }
  });
});
define("ember-tattoo-frontend/users/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "1XExTz8D", "block": "{\"statements\":[[\"open-element\",\"h2\",[]],[\"flush-element\"],[\"text\",\"Users\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"model\"]]],null,0],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"user\",\"email\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"user\"]}],\"hasPartials\":false}", "meta": { "moduleName": "ember-tattoo-frontend/users/template.hbs" } });
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('ember-tattoo-frontend/config/environment', ['ember'], function(Ember) {
  var prefix = 'ember-tattoo-frontend';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("ember-tattoo-frontend/app")["default"].create({"name":"ember-tattoo-frontend","version":"0.0.0+6320e4de"});
}

/* jshint ignore:end */
//# sourceMappingURL=ember-tattoo-frontend.map
