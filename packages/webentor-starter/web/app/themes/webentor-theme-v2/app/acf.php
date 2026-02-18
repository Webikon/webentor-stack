<?php

add_action('init', function () {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page([
            'page_title' => 'Theme Settings',
            'menu_title' => 'Theme Settings',
            'menu_slug' => 'theme-general-settings',
            'capability' => 'manage_options',
            'redirect' => false,
        ]);

        acf_add_options_sub_page([
            'page_title' => 'Theme Header Settings',
            'menu_title' => 'Header',
            'menu_slug' => 'theme-header',
            'parent_slug' => 'theme-general-settings',
            'capability' => 'manage_options',
        ]);

        // acf_add_options_sub_page([
        //     'page_title' => 'Theme Footer Settings',
        //     'menu_title' => 'Footer',
        //     'menu_slug' => 'theme-footer',
        //     'parent_slug' => 'theme-general-settings',
        //     'capability' => 'manage_options',
        // ]);
    }
});
