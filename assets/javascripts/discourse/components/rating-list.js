import Component from "@glimmer/component";
import { ratingListHtml } from "../lib/rating-utilities";

export default class RatingList extends Component {
  get ratingHtml() {
    return ratingListHtml(this.args.ratings);
  }

  <template>
    <div class="post-ratings">
      {{this.ratingHtml}}
    </div>
  </template>
}
