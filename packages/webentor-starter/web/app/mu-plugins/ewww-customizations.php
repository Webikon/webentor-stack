<?php
/**
 * Plugin Name: EWWW Customizations
 * Description: EWWW Image Optimizer Customizations
 * Author: Webikon
 * Version: 1.0
 */
add_action('admin_init', function () {
    if (is_plugin_active('ewww-image-optimizer/ewww-image-optimizer.php')) {
        // Include BIS resized images in EWWW optimization
        define('EWWW_IMAGE_OPTIMIZER_AUX_PATHS', "wp-content/uploads/bis-images");

        // Exclude node_modules and themes from EWWW optimization
        define('EWWW_IMAGE_OPTIMIZER_EXCLUDE_PATHS', "node_modules \n wp-content/themes");

        // Enable WebP conversion
        define('EWWW_IMAGE_OPTIMIZER_WEBP', true);

        // Enable PNG to JPG conversion
        define('EWWW_IMAGE_OPTIMIZER_PNG_TO_JPG', true);
    }
});
