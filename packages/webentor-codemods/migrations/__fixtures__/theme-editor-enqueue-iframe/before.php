<?php

namespace App;

use Illuminate\Support\Facades\File;

/**
 * Register the theme assets.
 *
 * @return void
 */
add_action('enqueue_block_editor_assets', function (): void {
    $dependencies = File::exists(get_template_directory() . '/public/build/editor.deps.json') ? File::json(get_template_directory() . '/public/build/editor.deps.json') : [];

    \Kucrut\Vite\enqueue_asset(
        get_template_directory() . '/public/build',
        'resources/scripts/editor.ts',
        [
            'handle' => 'theme-blocks-editor',
            'dependencies' => $dependencies,
            'in-footer' => true, // Optional. Defaults to false.
        ]
    );

    \Kucrut\Vite\enqueue_asset(
        get_template_directory() . '/public/build',
        'resources/styles/editor.css',
        [
            'handle' => 'theme-blocks-editor-styles',
            'css-only' => true,
        ]
    );

    \Kucrut\Vite\enqueue_asset(
        get_template_directory() . '/public/build',
        'resources/core-components/button/button.style.css',
        [
            'handle' => 'theme-button-styles',
            'css-only' => true,
        ]
    );
}, 10);

add_action('wp_enqueue_scripts', function () {
    \Kucrut\Vite\enqueue_asset(
        get_template_directory() . '/public/build',
        'resources/scripts/app.ts',
        [
            'handle' => 'theme-app-scripts',
            'in-footer' => true
        ]
    );

    \Kucrut\Vite\enqueue_asset(
        get_template_directory() . '/public/build',
        'resources/styles/app.css',
        [
            'handle' => 'theme-app-styles',
            'css-only' => true,
        ]
    );

    \Kucrut\Vite\enqueue_asset(
        get_template_directory() . '/public/build',
        'resources/styles/lightgallery.css',
        [
            'handle' => 'theme-lightgallery-styles',
            'css-only' => true,
        ]
    );

    // Core components
    \Kucrut\Vite\enqueue_asset(
        get_template_directory() . '/public/build',
        'resources/core-components/button/button.style.css',
        [
            'handle' => 'theme-button-styles',
            'css-only' => true,
        ]
    );

    // $manifest = \Kucrut\Vite\get_manifest(get_template_directory() . '/public/build');

    // $components = glob(get_template_directory() . '/resources/core-components/*/');
    // foreach ($components as $component) {
    //     $componentName = basename($component);
    //     if (!empty($manifest->data->{"resources/core-components/{$componentName}/{$componentName}.script.ts"})) {
    //         \Kucrut\Vite\enqueue_asset(
    //             get_template_directory() . '/public/build',
    //             "resources/core-components/{$componentName}/{$componentName}.script.ts",
    //             [
    //                 'handle' => "theme-{$componentName}-scripts",
    //             ]
    //         );
    //     }

    //     if (!empty($manifest->data->{"resources/core-components/{$componentName}/{$componentName}.style.css"})) {
    //         \Kucrut\Vite\enqueue_asset(
    //             get_template_directory() . '/public/build',
    //             "resources/core-components/{$componentName}/{$componentName}.style.css",
    //             [
    //                 'handle' => "theme-{$componentName}-styles",
    //                 'css-only' => true,
    //             ]
    //         );
    //     }
    // }
}, 10);

/**
 * Use the generated theme.json file.
 *
 * @return string
 */
add_filter('theme_file_path', function ($path, $file) {
    return $file === 'theme.json'
        ? public_path('build/assets/theme.json')
        : $path;
}, 10, 2);

/**
 * Add custom classes to body.
 *
 * @param  array $classes Array of body classes.
 * @return array Modified array of body classes.
 */
add_filter('body_class', function (array $classes): array {
    $classes[] = 'webentor-theme';

    return $classes;
});

/**
 * Add custom classes to Gutenberg editor wrapper, but only on edit pages.
 *
 * @param  string $classes String of editor wrapper classes.
 * @return string Modified string of editor wrapper classes.
 */
add_filter('admin_body_class', function (string $classes): string {
    $screen = get_current_screen();

    if ($screen && $screen->is_block_editor()) {
        $classes .= ' webentor-theme';
    }

    return $classes;
});

/**
 * Register the initial theme setup.
 *
 * @return void
 */
add_action('after_setup_theme', function () {
    /**
     * Load languages.
     */
    load_theme_textdomain('webentor', get_stylesheet_directory() . '/resources/languages');

    /**
     * Register the navigation menus.
     *
     * @link https://developer.wordpress.org/reference/functions/register_nav_menus/
     */
    register_nav_menus([
        'primary_nav' => __('Primary Nav', 'webentor'),
    ]);

    /**
     * Enable plugins to manage the document title.
     *
     * @link https://developer.wordpress.org/reference/functions/add_theme_support/#title-tag
     */
    add_theme_support('title-tag');

    /**
     * Enable post thumbnail support.
     *
     * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
     */
    add_theme_support('post-thumbnails');

    /**
     * Enable responsive embed support.
     *
     * @link https://developer.wordpress.org/block-editor/how-to-guides/themes/theme-support/#responsive-embedded-content
     */
    add_theme_support('responsive-embeds');

    /**
     * Enable HTML5 markup support.
     *
     * @link https://developer.wordpress.org/reference/functions/add_theme_support/#html5
     */
    add_theme_support('html5', [
        'caption',
        'comment-form',
        'comment-list',
        'gallery',
        'search-form',
        'script',
        'style',
    ]);

    /**
     * Enable selective refresh for widgets in customizer.
     *
     * @link https://developer.wordpress.org/reference/functions/add_theme_support/#customize-selective-refresh-widgets
     */
    add_theme_support('customize-selective-refresh-widgets');
}, 20);
