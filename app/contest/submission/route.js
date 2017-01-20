import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.get('store').findRecord('contest', params.contest_id);
  },
  actions: {
    saveSubmission(submission) {
      let jpg = "jpg";
      let png = "png";
      let gif = "gif";
      let extensionString = submission.image.split('.').pop();
      if (extensionString === jpg) {} else if (extensionString === png) {} else if (extensionString === gif) {} else {
        this.get('flashMessages').warning("It appears that the URL you've tried to upload to the database is not an image URL or the URL uses an extension that is not accepted by this application. All URLs entered into the field MUST end with '.jpg', '.png', or '.gif' and must not have any character after the file extension.");
        return;
      };
      this.get('store').createRecord('submission', submission).save();
    },
    cancel(submission) {
      this.transitionTo('contests');
      console.log('cancel route');
    }
  }
});
