<?php
/**
 * Plugin Name: Webikon Tracy Debugging
 * Description: Enables Tracy debugging
 * Author: Webikon
 * Version: 1.0
 */
$enable_tracy = defined('WP_TRACY_DEBUG_ENABLE') && WP_TRACY_DEBUG_ENABLE;

if ($enable_tracy && file_exists(__DIR__ . '/vendor/autoload.php')) {
    include __DIR__ . '/vendor/autoload.php';

    \Tracy\Debugger::enable(defined('WP_ENVIRONMENT_TYPE') && WP_ENVIRONMENT_TYPE === 'production');

    // Debugger::$showBar = false;
}
