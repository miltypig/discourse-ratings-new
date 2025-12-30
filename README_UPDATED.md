# Discourse Ratings - Updated for Discourse 3.3+

![image](https://github.com/paviliondev/discourse-ratings/actions/workflows/plugin-tests.yml/badge.svg) ![image](https://github.com/paviliondev/discourse-ratings/actions/workflows/plugin-linting.yml/badge.svg)

A Discourse plugin that lets you use topics to rate things. [Read more about this plugin on Discourse Meta](https://meta.discourse.org/t/topic-star-ratings/39578).

## ⚠️ Important Update Notice

This is an **updated version** of the discourse-ratings plugin that has been modernized to work with **Discourse 3.3+** and the new **Glimmer component system**. The original plugin was only compatible with Discourse versions below 3.3.0.

### What's New in v0.3.0

- ✅ **Glimmer Component Migration**: Converted from legacy widget system to modern Glimmer components
- ✅ **Discourse 3.3+ Compatible**: Works with the latest Discourse versions (3.3+, 3.4+, 3.5+)
- ✅ **Post Stream Updates**: Updated to work with the new Glimmer post stream
- ✅ **Modern API Usage**: Uses `addTrackedPostProperties` instead of deprecated `includePostAttributes`
- ✅ **Backward Compatibility**: Includes legacy widget support (with deprecation warnings) for transition period
- ✅ **Value Transformers**: Uses new value transformer API for CSS class customization
- ✅ **Updated Components**: All JavaScript components converted to `@glimmer/component` syntax

### Breaking Changes from v0.2.x

1. **Minimum Discourse Version**: Now requires Discourse 3.3.0 or higher
2. **Component Syntax**: Components now use Glimmer component syntax instead of Ember classic components
3. **Widget Decorators**: Widget-based customizations have been replaced with plugin outlets and transformers
4. **API Version**: Updated from Plugin API 0.10.0 to 1.14.0

## Features

1. Topics can be designated as 'for rating', by being posted in a category with ratings setting on (see below), or by being given the tag 'rating'.

2. Each ratings topic concerns a single thing ("rating subject"); e.g. a service or a product.

3. Users rate the rating subject by choosing a star rating when posting (i.e. in the composer).

4. The average (mean) of all the ratings in the topic is displayed under the topic title and on the relevant topic list item.

## Installation

### For Discourse 3.3+ (Current Version)

To install using docker, add the following to your app.yml in the plugins section:

```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - mkdir -p plugins
          - git clone https://github.com/YOUR-USERNAME/discourse-ratings.git
```

and rebuild docker via:

```bash
cd /var/discourse
./launcher rebuild app
```

### For Older Discourse Versions (< 3.3)

If you're running Discourse versions below 3.3.0, you should use the original version:

```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - mkdir -p plugins
          - git clone -b legacy https://github.com/paviliondev/discourse-ratings.git
```

## Migration Guide

If you're upgrading from the old version (< 0.3.0) to this version, here's what you need to know:

### 1. Check Discourse Version

First, ensure your Discourse installation is version 3.3.0 or higher:

```bash
cd /var/discourse
./launcher enter app
discourse --version
```

### 2. Update Plugin

Replace the old plugin with this updated version in your app.yml and rebuild.

### 3. Test Functionality

After rebuilding, verify that:
- Existing ratings display correctly
- New ratings can be created
- The composer rating interface works
- Topic lists show average ratings

### 4. Custom Themes/Plugins

If you have custom themes or plugins that interact with discourse-ratings:

- **Widget Decorators**: Replace with plugin outlets or value transformers
- **Component Extensions**: Update to use `@glimmer/component` syntax
- **Post Attributes**: Use `addTrackedPostProperties` instead of `includePostAttributes`

## Technical Details

### Updated Components

The following components have been converted to Glimmer components:

- `rating-list` - New Glimmer component for displaying ratings
- `star-rating` - Converted to @glimmer/component
- `rating-star` - Converted to @glimmer/component with template colocation
- `select-rating` - Converted to @glimmer/component
- `rating-type` - Updated for Glimmer compatibility
- `rating-actions` - Updated for Glimmer compatibility

### New APIs Used

- `api.addTrackedPostProperties()` - Replaces `includePostAttributes()`
- `api.renderAfterWrapperOutlet()` - For plugin outlet rendering
- `api.registerValueTransformer()` - For CSS class customization
- `withSilencedDeprecations()` - For backward compatibility during transition

### Plugin Outlets

The plugin now uses these outlet locations:

- `post-meta-data-poster-name` - For displaying ratings after poster name
- `post-content-cooked-html` - For content-related rating displays

## Configuration

Configuration remains the same as the original plugin. See Settings > Plugins > discourse-ratings in your Discourse admin panel.

## Development

### Running Tests

```bash
bundle exec rake plugin:spec[discourse-ratings]
```

### Linting

```bash
pnpm install
pnpm lint:js
pnpm lint:hbs
```

## Compatibility

- **Discourse Version**: 3.3.0 or higher
- **Node Version**: 22+
- **Package Manager**: pnpm 9.x
- **Plugin API**: 1.14.0+

## To Do

1. Prevent a user from posting in a ratings topic more than once. Currently, users cannot rate in a ratings topic more than once.

2. Create a sorted topic list (highest to lowest) of all topics within a ratings category or with the 'rating'. Perhaps use Bayesian estimation [as discussed in the code comments](https://github.com/angusmcleod/discourse-ratings/blob/master/plugin.rb#L40).

3. Add translations for the `category.for_ratings` and `composer.your_rating` text.

4. Allow the user to select the tag(s) they wish to use to designate ratings topics in the admin config.

5. Allow the user to choose the number of total stars in a rating.

6. Allow the user to change the rating item image (i.e. use something other than stars).

## Support

If you encounter any issues with this updated version:

1. Check the browser console for errors
2. Verify your Discourse version is 3.3.0+
3. Review the migration guide above
4. Open an issue on GitHub with:
   - Discourse version
   - Plugin version
   - Error messages
   - Steps to reproduce

## Credits

- Original authors: Angus McLeod, Faizaan Gagan
- Glimmer migration: Updated for Discourse 3.3+ compatibility
- Maintained by: Pavilion Dev

## License

See LICENSE.txt for details.

## Changelog

### Version 0.3.0 (2025)
- **Major Update**: Migrated to Glimmer components
- **Breaking**: Now requires Discourse 3.3.0+
- Updated all components to use `@glimmer/component`
- Replaced widget decorators with plugin outlets
- Added value transformers for customization
- Updated to Plugin API 1.14.0
- Added backward compatibility layer with deprecation warnings
- Improved TypeScript/modern JavaScript support

### Version 0.2.3 (2024)
- Last version supporting Discourse < 3.3.0
- Widget-based implementation
- Legacy Ember component syntax
