<?php

/**
 * Gravity Forms markup customizations.
 */

namespace App;

/**
 * Append theme classes to Gravity Forms' buttons, leaving GF's own markup intact.
 */
$gf_button_classes = function (string $classes): callable {
    return function ($button) use ($classes) {
        $processor = new \WP_HTML_Tag_Processor($button);

        if (!$processor->next_tag()) {
            return $button;
        }

        // add_class() takes one name at a time; a space-separated string would
        // bypass its de-duplication.
        foreach (preg_split('/\s+/', $classes, -1, PREG_SPLIT_NO_EMPTY) as $class) {
            $processor->add_class($class);
        }

        return $processor->get_updated_html();
    };
};

add_filter('gform_submit_button', $gf_button_classes('btn btn--primary btn--size-large'), 10, 1);
add_filter('gform_next_button', $gf_button_classes('btn btn--primary btn--size-large'), 10, 1);
add_filter('gform_previous_button', $gf_button_classes('btn btn--secondary btn--size-large'), 10, 1);

/**
 * Disable Gravity Forms CSS
 */
add_filter('gform_disable_css', function ($disable) {
    return true;
});

/**
 * Whether a form renders at least one datepicker Date field.
 */
$gf_form_has_datepicker = function ($form) {
    foreach (rgar($form, 'fields', []) as $field) {
        if ($field->get_input_type() !== 'date') {
            continue;
        }

        // GF treats an unset dateType as the datepicker (see GF's js.php).
        if (empty($field->dateType) || $field->dateType === 'datepicker') {
            return true;
        }
    }

    return false;
};

/**
 * GF marks the datepicker toggle with dashicons classes, but dashicons is
 * admin-only — without it the icon has no glyph and the button collapses to zero
 * width, so the calendar cannot be opened. Scoped to forms that render one.
 */
add_action('gform_enqueue_scripts', function ($form) use ($gf_form_has_datepicker) {
    if ($gf_form_has_datepicker($form)) {
        wp_enqueue_style('dashicons');
    }
});
