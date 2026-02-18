<?php

namespace App;

/**
 * Change submit button markup
 */
add_filter('gform_submit_button', function ($button, $form) {
    $button_classes = 'btn btn--primary btn--size-large';

    return "<button class='{$button_classes}' id='gform_submit_button_{$form['id']}'>{$form['button']['text']}</button>";
}, 10, 2);

/**
 * Disable Gravity Forms CSS
 */
add_filter('gform_disable_css', function ($disable) {
    return true;
});
