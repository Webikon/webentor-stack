<?php

namespace App;

/**
 * Register post types and taxonomies.
 * https://github.com/johnbillion/extended-cpts
 */
add_action('init', function () {
    // CPTs
    // register_extended_post_type('lector', [
    //     'menu_icon' => 'dashicons-businesswoman',
    //     'supports' => ['title', 'editor', 'thumbnail'],
    //     'show_in_rest' => true,
    //     'has_archive' => false,
    //     'public' => true,
    //     'rewrite' => ['slug' => _x('lector', 'cpts-tax-slug', 'webentor'), 'with_front' => false],
    // ], [
    //     'singular' => _x('Lector', 'cpts-tax-label', 'webentor'),
    //     'plural' => _x('Lectors', 'cpts-tax-label', 'webentor'),
    // ]);


    // Taxonomies
    // register_extended_taxonomy('lector_category', 'lector', [
    //     'show_admin_column' => true,
    //     'show_in_rest' => true,
    // ], [
    //     'singular' => _x('Lector Category', 'cpts-tax-label', 'webentor'),
    //     'plural' => _x('Lector Categories', 'cpts-tax-label', 'webentor'),
    // ]);
});
