<?php

/**
 * Plugin Name: Webikon WP Cleanup
 * Plugin URI: https://webikon.sk
 * Description: Cleanup unnecessary WP features.
 * Version: 1.0
 * Author: Webikon
 * Author URI: https://webikon.sk/
 * License: GPLv2
 * Domain Path: /languages/
 * Text Domain: webikon-wp-cleanup
 */

// TODO add some hooks to enable/disable this

namespace Webikon;

/**
 * Get rid of unnecessary WP ballast!
 *
 * Most of it is removed through https://github.com/roots/acorn-prettify
 * But these are some additional tweaks.
 */

// Remove admin toolbar menu items.
add_action('admin_bar_menu', function (\WP_Admin_Bar $menu) {
    // $menu->remove_node('archive'); // Archive
    $menu->remove_node('comments'); // Comments
    // $menu->remove_node('customize'); // Customize
    // $menu->remove_node('dashboard'); // Dashboard
    // $menu->remove_node('edit'); // Edit
    // $menu->remove_node('menus'); // Menus
    $menu->remove_node('new-content'); // New Content
    // $menu->remove_node('search'); // Search
    // $menu->remove_node('site-name'); // Site Name
    // $menu->remove_node('themes'); // Themes
    $menu->remove_node('updates'); // Updates
    // $menu->remove_node('view-site'); // Visit Site
    // $menu->remove_node('view'); // View
    // $menu->remove_node('widgets'); // Widgets
    $menu->remove_node('wp-logo'); // WordPress Logo
}, 999);

// Remove admin dashboard widgets.
add_action('wp_dashboard_setup', function () {
    remove_meta_box('dashboard_activity', 'dashboard', 'normal'); // Activity
    // remove_meta_box('dashboard_right_now', 'dashboard', 'normal'); // At a Glance
    remove_meta_box('dashboard_site_health', 'dashboard', 'normal'); // Site Health Status
    remove_meta_box('dashboard_primary', 'dashboard', 'side'); // WordPress Events and News
    remove_meta_box('dashboard_quick_press', 'dashboard', 'side'); // Quick Draft
});

// Remove REST API in HTTP Headers
remove_action('template_redirect', 'rest_output_link_header', 11, 0);

remove_action('wp_footer', 'the_block_template_skip_link');

// Remove inline Gutenberg blocks style
add_filter('should_load_separate_core_block_assets', '__return_true');
add_filter('styles_inline_size_limit', '__return_zero');

add_action('after_setup_theme', function () {
    // Launch head cleanup
    add_action('init', __NAMESPACE__ . '\\head_cleanup');

    /**
     * Load Enqueued Scripts in the Footer
     * Automatically move JavaScript code to page footer, speeding up page loading time.
     *
     * Important note: Not used when Woocommerce is active as this breaks WC Blocks chunking.
     */
    if (!is_admin() && !function_exists('is_woocommerce')) {
        remove_action('wp_head', 'wp_print_scripts');
        remove_action('wp_head', 'wp_print_head_scripts', 9);
        add_action('wp_footer', 'wp_print_scripts', 1);
        add_action('wp_footer', 'wp_print_head_scripts', 1);

        // Leave jQuery in the <head>
        add_action('wp_head', function () {
            wp_print_scripts('jquery');
        });
    }
});

// Remove marketplace suggestions
add_filter('woocommerce_allow_marketplace_suggestions', '__return_false');

// Remove connect your store to WooCommerce.com admin notice
add_filter('woocommerce_helper_suppress_admin_notices', '__return_true');

// Remove the WooCommerce Admin Install Nag
add_filter('woocommerce_show_admin_notice', __NAMESPACE__ . '\\wc_disable_wc_admin_install_notice', 10, 2);
function wc_disable_wc_admin_install_notice($notice_enabled, $notice)
{
    if ('wc_admin' === $notice) {
        return false;
    }

    return $notice_enabled;
}

/**
 * Clean WP_HEAD
 *
 * Courtesy of http://cubiq.org/clean-up-and-optimize-wordpress-for-your-next-theme
 */
function head_cleanup()
{
    // Index link
    remove_action('wp_head', 'index_rel_link');
    // Previous link
    remove_action('wp_head', 'parent_post_rel_link', 10, 0);
    // Start link
    remove_action('wp_head', 'start_post_rel_link', 10, 0);
}
