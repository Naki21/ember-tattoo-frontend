import Ember from 'ember';

export default Ember.Route.extend({
    model(submission){
    return this.get('store').findRecord('submission', submission.submission_id);
}
});
