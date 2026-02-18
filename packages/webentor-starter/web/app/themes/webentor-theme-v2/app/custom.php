<?php

namespace App;

// Replace default excerpt dots
add_filter('excerpt_more', function () {
    return '...';
});

/**
 * Disable auto sizes styles for images
 */
add_filter('wp_img_tag_add_auto_sizes', '__return_false');
