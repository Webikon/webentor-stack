<?php
/**
 * Plugin Name:  Loco Permissions
 * Plugin URI:   https://webikon.sk
 * Version:      1.0.0
 * Author:       Webikon
 */

// Enable file mod for Loco translate files
// see: https://localise.biz/wordpress/plugin/manual/filesystem
add_filter('file_mod_allowed', function ($disallow, $context) {
    if ($context == "download_language_pack") {
        return true;
    }

    return $disallow;
}, 10, 2);
