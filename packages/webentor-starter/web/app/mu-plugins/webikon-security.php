<?php

/**
 * Plugin Name: Webikon Security
 * Plugin URI: https://webikon.sk
 * Description: Basic WP security hardening.
 * Version: 1.0
 * Author: Webikon
 * Author URI: https://webikon.sk/
 * License: GPLv2
 * Domain Path: /languages/
 * Text Domain: webikon-security
 */

namespace Webikon;

add_action('init', function () {
    // Disable XMLRPC
    add_filter('xmlrpc_enabled', '__return_false');

    // Disable file edit in admin
    if (!defined('DISALLOW_FILE_EDIT')) {
        define('DISALLOW_FILE_EDIT', true);
    }

    // Disable X-Pingback to header
    add_filter('wp_headers', function ($headers) {
        unset($headers['X-Pingback']);

        return $headers;
    });

    // Disable REST API
    /*add_filter('rest_authentication_errors', function ($result) {
        if (!empty($result)) {
            return $result;
        }

        if (!is_user_logged_in()) {
            return new WP_Error('rest_not_logged_in', 'You are not currently logged in.', array('status' => 401));
        }
        return $result;
    });*/

    // If we still need REST API, at least disable exposed users list
    add_filter('rest_endpoints', function ($endpoints) {
        if (!is_user_logged_in()) {
            if (isset($endpoints['/wp/v2/users'])) {
                unset($endpoints['/wp/v2/users']);
            }

            if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) {
                unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
            }
        }

        return $endpoints;
    });

    // Fix user enumeration
    if (!is_admin()) {
        // default URL format
        if (isset($_SERVER['QUERY_STRING']) && preg_match('/author=([0-9]*)/i', $_SERVER['QUERY_STRING'])) {
            wp_redirect(get_option('home'), 302);
            exit;
        }

        add_filter('redirect_canonical', function ($redirect, $request) {
            // permalink URL format
            if (preg_match('/\?author=([0-9]*)(\/*)/i', $request)) {
                die();
            } else {
                return $redirect;
            }
        }, 10, 2);
    }

    // Disable WP app password
    add_filter('wp_is_application_passwords_available', '__return_false');

    // Hide WP version
    add_filter('the_generator', '__return_null');
});
