import Component from "@glimmer/component";

export default class StarRating extends Component {
  stars = [1, 2, 3, 4, 5];
  
  get enabled() {
    return this.args.enabled || false;
  }
}
