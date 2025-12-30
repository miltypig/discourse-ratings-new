import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class SelectRating extends Component {
  @action
  handleIncludeChange(value) {
    if (!value) {
      // Reset rating value when unchecked
      if (this.args.onRatingChange) {
        this.args.onRatingChange({ ...this.args.rating, value: 0, include: false });
      }
    } else {
      if (this.args.onRatingChange) {
        this.args.onRatingChange({ ...this.args.rating, include: true });
      }
    }
  }

  @action
  handleRatingValueChange(value) {
    if (this.args.onRatingChange) {
      this.args.onRatingChange({ ...this.args.rating, value });
    }
  }

  @action
  triggerUpdateRating() {
    if (this.args.updateRating) {
      this.args.updateRating(this.args.rating);
    }
  }
}
