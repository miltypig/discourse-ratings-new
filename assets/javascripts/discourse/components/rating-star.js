import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class RatingStar extends Component {
  @tracked inputElement;

  get disabled() {
    return !this.args.enabled;
  }

  get checked() {
    return this.args.value <= this.args.rating;
  }

  @action
  handleClick(event) {
    if (this.args.onRatingChange) {
      this.args.onRatingChange(this.args.value);
    }
  }

  @action
  setupElement(element) {
    this.inputElement = element;
    element.type = "radio";
    element.value = this.args.value;
  }

  <template>
    <input
      type="radio"
      value={{@value}}
      checked={{this.checked}}
      disabled={{this.disabled}}
      {{on "click" this.handleClick}}
      {{did-insert this.setupElement}}
    />
  </template>
}
