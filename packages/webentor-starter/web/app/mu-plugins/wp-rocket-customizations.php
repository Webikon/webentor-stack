<?php

/**
 * Plugin Name: WP Rocket Customizations
 * Description: Additional customizations.
 * Version: 1.0
 * Author: Webikon
 * Author URI: https://webikon.sk
 */

/**
 * Processes the "img" tag that's included in <picture> tags in "Add missing image dimensions".
 */
add_filter('rocket_specify_dimension_skip_pictures', '__return_false');

/**
 * Allow external images in "Add missing image dimensions".
 * This fixes images in multisite (https://github.com/wp-media/wp-rocket/issues/3453).
 */
add_filter('rocket_specify_image_dimensions_for_distant', '__return_true');

/**
 * Disable WP_CACHE setting as we are doing this manually.
 */
add_filter('rocket_set_wp_cache_constant', '__return_false');

/**
 * Enable WP Rocket's lazyload feature
 *
 * @link filter: https://github.com/wp-media/wp-rocket/blob/163a03f4495a5d2e78c9822b9a3ac00f76485bd5/inc/classes/subscriber/Optimization/class-lazyload-subscriber.php#L158
 */
add_filter('rocket_use_native_lazyload', '__return_true');

/**
 * Customize mod expires and increase expire limit to 1 year for all webfonts.
 * See: web/app/plugins/wp-rocket/inc/functions/htaccess.php
 */
add_filter('rocket_htaccess_mod_expires', function ($rules) {
    $rules = <<<HTACCESS
<IfModule mod_mime.c>
    AddType image/avif                                  avif
    AddType image/avif-sequence                         avifs
</IfModule>
# Expires headers (for better cache control)
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresDefault                              "access plus 1 month"
    # cache.appcache needs re-requests in FF 3.6 (thanks Remy ~Introducing HTML5)
    ExpiresByType text/cache-manifest           "access plus 0 seconds"
    # Your document html
    ExpiresByType text/html                     "access plus 0 seconds"
    # Data
    ExpiresByType text/xml                      "access plus 0 seconds"
    ExpiresByType application/xml               "access plus 0 seconds"
    ExpiresByType application/json              "access plus 0 seconds"
    # Feed
    ExpiresByType application/rss+xml           "access plus 1 hour"
    ExpiresByType application/atom+xml          "access plus 1 hour"
    # Favicon (cannot be renamed)
    ExpiresByType image/x-icon                  "access plus 1 week"
    # Media: images, video, audio
    ExpiresByType image/gif                     "access plus 4 months"
    ExpiresByType image/png                     "access plus 4 months"
    ExpiresByType image/jpeg                    "access plus 4 months"
    ExpiresByType image/webp                    "access plus 4 months"
    ExpiresByType video/ogg                     "access plus 4 months"
    ExpiresByType audio/ogg                     "access plus 4 months"
    ExpiresByType video/mp4                     "access plus 4 months"
    ExpiresByType video/webm                    "access plus 4 months"
    ExpiresByType image/avif                    "access plus 4 months"
	ExpiresByType image/avif-sequence           "access plus 4 months"
    # HTC files  (css3pie)
    ExpiresByType text/x-component              "access plus 1 month"
    # Webfonts
    ExpiresByType font/ttf                      "access plus 1 year"
    ExpiresByType font/otf                      "access plus 1 year"
    ExpiresByType font/woff                     "access plus 1 year"
    ExpiresByType font/woff2                    "access plus 1 year"
    ExpiresByType image/svg+xml                 "access plus 1 month"
    ExpiresByType application/vnd.ms-fontobject "access plus 1 month"
    # CSS and JavaScript
    ExpiresByType text/css                      "access plus 1 year"
    ExpiresByType application/javascript        "access plus 1 year"
</IfModule>

HTACCESS;

    return $rules;
});
