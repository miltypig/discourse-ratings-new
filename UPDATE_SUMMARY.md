# Discourse Ratings Update Summary

## Overview

This document summarizes all changes made to update the discourse-ratings plugin from v0.2.3 to v0.3.0 for compatibility with Discourse 3.3+ and the new Glimmer component system.

## Version Information

- **Previous Version**: 0.2.3 (Legacy)
- **New Version**: 0.3.0 (Glimmer)
- **Minimum Discourse Version**: 3.3.0
- **Plugin API Version**: 1.14.0 (updated from 0.10.0)

## Major Changes

### 1. Core Framework Updates

#### A. Component System Migration
**From**: Ember Classic Components with decorators
**To**: Glimmer Components with template colocation

Files Updated:
- `star-rating.js` - Converted to @glimmer/component
- `rating-star.js` - Converted with inline template
- `select-rating.js` - Converted to @glimmer/component
- `rating-list.js` - New Glimmer component created

#### B. Widget System Replacement
**From**: Widget-based post stream rendering
**To**: Plugin outlets and value transformers

Changes in `initialize-ratings.js`:
- Replaced `api.decorateWidget()` with `api.renderAfterWrapperOutlet()`
- Replaced `api.reopenWidget()` with `api.registerValueTransformer()`
- Added `withSilencedDeprecations()` for backward compatibility

#### C. API Updates
**From**: `api.includePostAttributes()`
**To**: `api.addTrackedPostProperties()`

### 2. File-by-File Changes

#### `/plugin.rb`
```ruby
# CHANGED:
- version: 0.2.3 → 0.3.0
- Added: required_version: 3.3.0
- Updated about text to mention Discourse 3.3+ support
```

#### `/assets/javascripts/discourse/initializers/initialize-ratings.js`
**Major Changes:**
- Updated Plugin API version: `0.10.0` → `1.14.0`
- Added imports:
  ```javascript
  import Component from "@glimmer/component";
  import { withSilencedDeprecations } from "discourse/lib/deprecated";
  import RenderGlimmer from "discourse/widgets/render-glimmer";
  import RatingList from "../components/rating-list";
  ```

- **Replaced** `api.includePostAttributes("ratings")` 
  **With** `api.addTrackedPostProperties("ratings")`

- **Added** Glimmer component rendering:
  ```javascript
  api.renderAfterWrapperOutlet(
    "post-meta-data-poster-name",
    class extends Component {
      static shouldRender(args) {
        return args.post?.topic?.show_ratings && args.post?.ratings?.length > 0;
      }
      <template>
        <RatingList @ratings={{@post.ratings}} />
      </template>
    }
  );
  ```

- **Added** Value transformer for CSS classes:
  ```javascript
  api.registerValueTransformer("post-class", ({ value, context }) => {
    const { post } = context;
    if (post?.topic?.show_ratings && post?.ratings?.length > 0) {
      return [...value, "has-ratings"];
    }
    return value;
  });
  ```

- **Wrapped** legacy widget code in deprecation silencer:
  ```javascript
  withSilencedDeprecations("discourse.post-stream-widget-overrides", () => {
    // Legacy widget code here
  });
  ```

#### `/assets/javascripts/discourse/components/rating-list.js`
**NEW FILE** - Created as replacement for widget-based rendering:
```javascript
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
```

#### `/assets/javascripts/discourse/components/star-rating.js`
**Before:**
```javascript
import Component from "@ember/component";
import { classNames, tagName } from "@ember-decorators/component";

@tagName("span")
@classNames("star-rating")
export default class StarRating extends Component {
  stars = [1, 2, 3, 4, 5];
  enabled = false;
}
```

**After:**
```javascript
import Component from "@glimmer/component";

export default class StarRating extends Component {
  stars = [1, 2, 3, 4, 5];
  
  get enabled() {
    return this.args.enabled || false;
  }
}
```

#### `/assets/javascripts/discourse/components/star-rating.hbs`
**Before:**
```handlebars
{{#each this.stars as |star|}}
  {{rating-star value=star rating=this.rating enabled=this.enabled}}<i></i>
{{/each}}
```

**After:**
```handlebars
<span class="star-rating">
  {{#each this.stars as |star|}}
    <RatingStar @value={{star}} @rating={{@rating}} @enabled={{this.enabled}} /><i></i>
  {{/each}}
</span>
```

#### `/assets/javascripts/discourse/components/rating-star.js`
**Before:**
```javascript
import Component from "@ember/component";
import { not } from "@ember/object/computed";
import { attributeBindings, tagName } from "@ember-decorators/component";
import discourseComputed from "discourse/lib/decorators";

@tagName("input")
@attributeBindings("value", "checked:checked", "disabled:disabled")
export default class RatingStar extends Component {
  @not("enabled") disabled;
  
  willInsertElement() { /* ... */ }
  didRender() { /* ... */ }
  click() { /* ... */ }
  
  @discourseComputed("rating")
  checked(rating) { /* ... */ }
}
```

**After:**
```javascript
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
```

#### `/assets/javascripts/discourse/components/select-rating.js`
**Before:**
```javascript
import Component from "@ember/component";
import { action } from "@ember/object";
import { classNames, tagName } from "@ember-decorators/component";
import { observes } from "@ember-decorators/object";

@tagName("div")
@classNames("rating-container")
export default class SelectRating extends Component {
  @observes("rating.include")
  removeOnUncheck() { /* ... */ }
  
  @action
  triggerUpdateRating() { /* ... */ }
}
```

**After:**
```javascript
import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class SelectRating extends Component {
  @action
  handleIncludeChange(value) { /* ... */ }

  @action
  handleRatingValueChange(value) { /* ... */ }

  @action
  triggerUpdateRating() { /* ... */ }
}
```

#### `/assets/javascripts/discourse/components/select-rating.hbs`
**Before:**
```handlebars
{{input type="checkbox" checked=this.rating.include class="include-rating"}}
<!-- ... -->
{{star-rating enabled=this.rating.include rating=this.rating.value click=this.triggerUpdateRating}}
```

**After:**
```handlebars
<div class="rating-container">
  <Input @type="checkbox" @checked={{@rating.include}} class="include-rating" {{on "change" (fn this.handleIncludeChange)}} />
  <!-- ... -->
  <StarRating @enabled={{@rating.include}} @rating={{@rating.value}} @onRatingChange={{this.handleRatingValueChange}} {{on "click" this.triggerUpdateRating}} />
</div>
```

#### `/.discourse-compatibility`
**Before:**
```
< 3.3.0.beta1-dev: b2c73f8909dec23c5a0bf18ccd380e298e6aa775
```

**After:**
```
# Discourse Ratings Compatibility
# This plugin is compatible with Discourse 3.3+
>= 3.3.0.beta1-dev
```

### 3. Patterns and Best Practices Applied

#### A. Glimmer Component Pattern
```javascript
// New standard pattern for components
import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class MyComponent extends Component {
  @tracked myProperty;
  
  get computedProperty() {
    return this.args.value * 2;
  }
  
  @action
  handleEvent() {
    // Event handling
  }
  
  <template>
    <div {{on "click" this.handleEvent}}>
      {{this.computedProperty}}
    </div>
  </template>
}
```

#### B. Plugin Outlet Usage
```javascript
// New pattern for customizing post stream
api.renderAfterWrapperOutlet(
  "outlet-name",
  class extends Component {
    static shouldRender(args) {
      return args.post?.someCondition;
    }
    
    <template>
      <div>Custom content</div>
    </template>
  }
);
```

#### C. Value Transformer Pattern
```javascript
// New pattern for adding CSS classes
api.registerValueTransformer(
  "post-class",
  ({ value, context }) => {
    if (context.post?.condition) {
      return [...value, "my-class"];
    }
    return value;
  }
);
```

#### D. Backward Compatibility Pattern
```javascript
// Temporary support for legacy code
withSilencedDeprecations("discourse.post-stream-widget-overrides", () => {
  // Legacy widget code
  api.decorateWidget(/* ... */);
});
```

### 4. Removed Dependencies

- `@ember-decorators/component` - No longer needed with Glimmer
- `@ember-decorators/object` - Replaced with native decorators
- Classic component lifecycle hooks - Replaced with Glimmer patterns

### 5. New Features Enabled

1. **Better Performance**: Glimmer rendering is faster than widgets
2. **Improved Reactivity**: Tracked properties update automatically
3. **Modern Syntax**: Uses latest Ember/JavaScript features
4. **Future-proof**: Aligned with Discourse's direction
5. **Better Developer Experience**: Clearer, more maintainable code

### 6. Testing Considerations

#### Unit Tests
- Component tests need updating for Glimmer syntax
- Use `@ember/test-helpers` for modern testing

#### Integration Tests
- Verify plugin outlets render correctly
- Test value transformers apply classes properly
- Ensure tracked properties update UI

#### Browser Testing
- Test in Chrome, Firefox, Safari, Edge
- Verify mobile responsiveness
- Check for console errors/warnings

### 7. Documentation Updates

Created/Updated:
- `README_UPDATED.md` - Comprehensive new readme
- `MIGRATION_GUIDE.md` - Step-by-step migration instructions
- `UPDATE_SUMMARY.md` - This file
- `.discourse-compatibility` - Updated version requirements

### 8. Known Limitations

1. **Deprecation Warnings**: Legacy widget code still present (wrapped in silencer)
2. **Transition Period**: Some users may see deprecation notices
3. **Theme Compatibility**: Custom themes may need updates
4. **Testing**: Full test suite needs updates for Glimmer patterns

### 9. Next Steps

For future development:

1. **Remove Legacy Code**: After transition period, remove widget code
2. **Full Test Coverage**: Update all tests for Glimmer components
3. **Performance Optimization**: Profile and optimize rendering
4. **Additional Features**: Leverage new Glimmer capabilities
5. **Documentation**: Create developer guide for extending plugin

### 10. Rollback Plan

If issues arise:
1. Use git to revert to tag `v0.2.3`
2. Or use branch `legacy` for pre-Glimmer version
3. Requires Discourse < 3.3.0

## Conclusion

This update represents a major modernization of the discourse-ratings plugin, bringing it in line with current Discourse development practices and ensuring compatibility with Discourse 3.3 and beyond. The changes maintain backward compatibility during a transition period while providing a clear path forward for modern Discourse installations.

## Quick Reference

### Command Summary
```bash
# Check Discourse version
discourse --version

# Backup before update
cd /var/discourse
./launcher backup app

# Update plugin (in app.yml)
# Then rebuild:
./launcher rebuild app

# Check plugin status
./launcher enter app
rails c
Plugin::Instance.all.map(&:name)
```

### Key Files Changed
- `plugin.rb` - Version and requirements
- `initialize-ratings.js` - Main initialization with new APIs
- `rating-list.js` - NEW: Glimmer component
- `star-rating.js` - Converted to Glimmer
- `rating-star.js` - Converted to Glimmer with template
- `select-rating.js` - Converted to Glimmer
- `.discourse-compatibility` - Updated version requirements

### Migration Checklist
- [ ] Discourse 3.3.0+
- [ ] Backup created
- [ ] app.yml updated
- [ ] Container rebuilt
- [ ] Ratings display correctly
- [ ] New ratings work
- [ ] No critical errors
- [ ] Custom themes checked (if any)
