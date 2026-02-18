<?php

/**
 * Configuration overrides for WP_ENV === 'staging'
 */

use Roots\WPConfig\Config;

/**
 * You should try to keep staging as close to production as possible. However,
 * should you need to, you can always override production configuration values
 * with `Config::define`.
 *
 * Example: `Config::define('WP_DEBUG', true);`
 * Example: `Config::define('DISALLOW_FILE_MODS', false);`
 */
Config::define('WP_CACHE', true);
Config::define('WP_POST_REVISIONS', 10);
Config::define('DISALLOW_INDEXING', true);
Config::define('WP_DEVELOPMENT_MODE', 'theme');

if (isset($_GET['debug_display'])) {
    Config::define('WP_DEBUG', true);
    Config::define('WP_DEBUG_DISPLAY', true);
}
