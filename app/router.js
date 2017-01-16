import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
});

Router.map(function () {
  this.route('sign-up');
  this.route('sign-in');
  this.route('change-password');
  this.route('users');
  this.route('contests', function() {
    this.route('new');
  });
  this.route('contest', { path: "contest/:contest_id" },function() {
    this.route('edit');
  });
  // this.route('edit', { path: "contest/edit/:contest_id" });
});

export default Router;
