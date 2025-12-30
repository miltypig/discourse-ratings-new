# Migration Guide: Discourse Ratings v0.2.x to v0.3.0

This guide will help you migrate from the old version of discourse-ratings (v0.2.x) to the new Glimmer-compatible version (v0.3.0).

## Prerequisites

Before migrating, ensure:

1. ✅ Your Discourse installation is **version 3.3.0 or higher**
2. ✅ You have a backup of your Discourse instance
3. ✅ You have access to rebuild your Discourse container
4. ✅ You understand the breaking changes (listed below)

## Checking Your Discourse Version

```bash
cd /var/discourse
./launcher enter app
discourse --version
```

If you're running a version below 3.3.0, you'll need to upgrade Discourse first, or continue using the legacy version of this plugin.

## Breaking Changes

### 1. Minimum Version Requirement
- **Old**: Worked with Discourse < 3.3.0
- **New**: Requires Discourse >= 3.3.0

### 2. Widget System Removed
The plugin no longer primarily uses the legacy widget rendering system. It now uses:
- Glimmer components for rendering
- Plugin outlets for customization points
- Value transformers for behavior modification

### 3. API Changes

| Old API | New API | Notes |
|---------|---------|-------|
| `api.includePostAttributes()` | `api.addTrackedPostProperties()` | Property tracking for updates |
| `api.decorateWidget()` | `api.renderAfterWrapperOutlet()` | Use plugin outlets instead |
| `api.reopenWidget()` | `api.registerValueTransformer()` | Use transformers for customization |
| Classic Ember Components | `@glimmer/component` | All components updated |

### 4. Component Syntax Changes

**Old (Ember Classic):**
```javascript
import Component from "@ember/component";
import { classNames } from "@ember-decorators/component";

@classNames("my-component")
export default class MyComponent extends Component {
  // ...
}
```

**New (Glimmer):**
```javascript
import Component from "@glimmer/component";

export default class MyComponent extends Component {
  <template>
    <div class="my-component">
      {{! template content }}
    </div>
  </template>
}
```

## Migration Steps

### Step 1: Backup Your Installation

Before making any changes:

```bash
cd /var/discourse
./launcher backup app
```

### Step 2: Update Discourse (if needed)

If you're on a version below 3.3.0:

```bash
cd /var/discourse
git pull
./launcher rebuild app
```

### Step 3: Update Plugin Reference

Edit your `app.yml` file:

**Old:**
```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - mkdir -p plugins
          - git clone https://github.com/paviliondev/discourse-ratings.git
```

**New:**
```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - mkdir -p plugins
          - git clone -b glimmer-update https://github.com/YOUR-REPO/discourse-ratings.git
```

### Step 4: Rebuild Container

```bash
cd /var/discourse
./launcher rebuild app
```

### Step 5: Verify Functionality

After rebuild, test the following:

#### 1. Existing Ratings Display
- [ ] Navigate to a topic with existing ratings
- [ ] Verify ratings are displayed correctly
- [ ] Check that average ratings show in topic lists

#### 2. Creating New Ratings
- [ ] Create a new post in a ratings-enabled category
- [ ] Verify the rating interface appears in the composer
- [ ] Submit a rating and verify it saves

#### 3. Editing Ratings
- [ ] Edit a post with a rating
- [ ] Verify you can modify the rating
- [ ] Save and verify changes persist

#### 4. Admin Settings
- [ ] Go to Admin > Settings > Plugins > discourse-ratings
- [ ] Verify all settings are accessible
- [ ] Test changing a setting and verify it works

### Step 6: Check Browser Console

Open your browser's developer console and check for:
- ❌ No JavaScript errors
- ⚠️ Deprecation warnings (these are expected during transition)
- ✅ Successful API calls

## Troubleshooting

### Issue: Ratings Not Displaying

**Symptoms:**
- Old ratings don't show up
- New ratings interface missing

**Solutions:**
1. Clear browser cache
2. Check browser console for errors
3. Verify plugin is enabled in Admin > Plugins
4. Ensure category/tag settings are configured

```bash
# Check plugin status
cd /var/discourse
./launcher enter app
rails c
```

```ruby
# In Rails console:
Plugin::Instance.all.map(&:name)
# Should include "discourse-ratings"
```

### Issue: Widget Deprecation Warnings

**Symptoms:**
- Console shows: `discourse.post-stream-widget-overrides deprecated`

**Solutions:**
These warnings are expected during the transition period. They indicate the plugin is using backward compatibility mode. They won't affect functionality but will be removed in a future update.

To silence them (not recommended):
```javascript
// In your browser console
localStorage.setItem('suppress-deprecation-warnings', 'true');
```

### Issue: Custom Theme Conflicts

**Symptoms:**
- Custom themes break after update
- Styling issues with ratings

**Solutions:**

If you have a custom theme that modifies ratings:

1. **Identify Widget Usage:**
```bash
# Search your theme for widget decorators
grep -r "decorateWidget" /var/discourse/public/themes/
grep -r "reopenWidget" /var/discourse/public/themes/
```

2. **Update to Plugin Outlets:**
Replace widget decorators with plugin outlet rendering (see examples below)

3. **Update CSS Selectors:**
Some class names may have changed. Verify your custom CSS.

### Issue: Composer Not Showing Ratings

**Symptoms:**
- Rating interface missing in composer
- Can't create new ratings

**Solutions:**

1. **Check Category Settings:**
```ruby
# In Rails console
category = Category.find_by(name: "Your Category")
category.custom_fields['rating_types']
```

2. **Verify Site Settings:**
- Admin > Settings > Plugins > discourse-ratings
- Ensure `rating_enabled` is checked

3. **Check Tag Configuration:**
- Verify rating tags are properly configured
- Check site settings for tag rating types

## Custom Theme/Plugin Updates

If you've extended discourse-ratings in your own themes or plugins:

### Example 1: Widget Decorator to Plugin Outlet

**Old Code (Widget):**
```javascript
api.decorateWidget("poster-name:after", (helper) => {
  const post = helper.getModel();
  if (post.my_custom_property) {
    return helper.h("div.my-custom-class", "My Content");
  }
});
```

**New Code (Plugin Outlet):**
```javascript
import Component from "@glimmer/component";

api.renderAfterWrapperOutlet(
  "post-meta-data-poster-name",
  class extends Component {
    static shouldRender(args) {
      return args.post?.my_custom_property;
    }

    <template>
      <div class="my-custom-class">My Content</div>
    </template>
  }
);
```

### Example 2: Component Extension

**Old Code:**
```javascript
import Component from "@ember/component";
import { classNames } from "@ember-decorators/component";

@classNames("rating-custom")
export default class extends Component {
  didInsertElement() {
    super.didInsertElement(...arguments);
    // Custom logic
  }
}
```

**New Code:**
```javascript
import Component from "@glimmer/component";
import { action } from "@ember/object";

export default class extends Component {
  @action
  setupElement(element) {
    // Custom logic
  }

  <template>
    <div class="rating-custom" {{did-insert this.setupElement}}>
      {{yield}}
    </div>
  </template>
}
```

### Example 3: CSS Class Addition

**Old Code:**
```javascript
api.reopenWidget("post", {
  buildClasses(attrs) {
    if (attrs.my_condition) {
      return ["my-custom-class"];
    }
  }
});
```

**New Code:**
```javascript
api.registerValueTransformer("post-class", ({ value, context }) => {
  const { post } = context;
  if (post.my_condition) {
    return [...value, "my-custom-class"];
  }
  return value;
});
```

## Performance Considerations

The new Glimmer implementation should provide:

- ✅ **Faster rendering**: Glimmer is more efficient than widgets
- ✅ **Better reactivity**: Tracked properties update automatically
- ✅ **Reduced bundle size**: Modern JavaScript is more tree-shakeable
- ✅ **Improved maintainability**: Cleaner, more standard code

## Rollback Plan

If you encounter critical issues:

### Step 1: Restore to Legacy Version

Edit `app.yml`:
```yaml
- git clone -b legacy https://github.com/paviliondev/discourse-ratings.git
```

### Step 2: Rebuild

```bash
cd /var/discourse
./launcher rebuild app
```

### Step 3: Report Issue

Open an issue on GitHub with:
- Discourse version
- Plugin version attempted
- Error messages
- Browser console output
- Steps to reproduce

## Getting Help

If you need assistance:

1. **Check Documentation:**
   - README_UPDATED.md
   - This migration guide
   - Discourse Meta forums

2. **Browser Console:**
   - Press F12 to open developer tools
   - Check Console tab for errors
   - Take screenshots of errors

3. **System Information:**
```bash
cd /var/discourse
./launcher enter app
discourse --version
rails c
```

```ruby
# In Rails console:
puts "Ruby: #{RUBY_VERSION}"
puts "Rails: #{Rails::VERSION::STRING}"
puts "Discourse: #{Discourse::VERSION::STRING}"
```

4. **Create Support Request:**
   - Include all information above
   - Describe expected vs actual behavior
   - Provide reproduction steps

## Post-Migration Checklist

After successful migration:

- [ ] All existing ratings display correctly
- [ ] New ratings can be created
- [ ] Ratings can be edited
- [ ] Topic list shows averages
- [ ] Admin settings work
- [ ] No JavaScript errors in console
- [ ] Custom themes/plugins work (if applicable)
- [ ] Performance is acceptable
- [ ] Users can interact with ratings
- [ ] Mobile view works correctly

## Future Updates

This version includes backward compatibility for the transition period. In future updates:

- Legacy widget support will be removed
- Deprecation warnings will become errors
- Performance will be further optimized

Plan to keep your installation updated to benefit from ongoing improvements.

## Questions?

For questions about this migration:
- Open an issue on GitHub
- Post on Discourse Meta
- Contact the maintainers

Remember to always backup before major updates!
