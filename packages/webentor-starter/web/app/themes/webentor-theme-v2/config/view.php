<?php

return [

    /*
    |--------------------------------------------------------------------------
    | View Storage Paths
    |--------------------------------------------------------------------------
    |
    | Most templating systems load templates from disk. Here you may specify
    | an array of paths that should be checked for your views. Of course
    | the usual view paths have already been registered for you.
    |
    */

    'paths' => [
        // First look into parent theme
        get_parent_theme_file_path('/resources/views'),
        get_parent_theme_file_path('/resources/blocks'),
        get_parent_theme_file_path('/resources/core-components'),

        // Then look into Webentor Core Blocks
        ...is_dir(WEBENTOR_CORE_PHP_PATH . '/resources/views') ? [WEBENTOR_CORE_PHP_PATH . '/resources/views'] : [],
        ...is_dir(WEBENTOR_CORE_PHP_PATH . '/resources/blocks') ? [WEBENTOR_CORE_PHP_PATH . '/resources/blocks'] : [],
        ...is_dir(WEBENTOR_CORE_PHP_PATH . '/resources/core-components') ? [WEBENTOR_CORE_PHP_PATH . '/resources/core-components'] : [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Compiled View Path
    |--------------------------------------------------------------------------
    |
    | This option determines where all the compiled Blade templates will be
    | stored for your application. Typically, this is within the storage
    | directory. However, as usual, you are free to change this value.
    |
    */

    // 'compiled' => env('VIEW_COMPILED_PATH', storage_path('framework/views')),

    /*
    |--------------------------------------------------------------------------
    | View Debugger
    |--------------------------------------------------------------------------
    |
    | Enabling this option will display the current view name and data. Giving
    | it a value of 'view' will only display view names. Giving it a value of
    | 'data' will only display current data. Giving it any other truthy value
    | will display both.
    |
    */

    'debug' => env('WP_SAGE_BLADE_DEBUG', defined('WP_SAGE_BLADE_DEBUG') ? WP_SAGE_BLADE_DEBUG : false),

    /*
    |--------------------------------------------------------------------------
    | View Namespaces
    |--------------------------------------------------------------------------
    |
    | Blade has an underutilized feature that allows developers to add
    | supplemental view paths that may contain conflictingly named views.
    | These paths are prefixed with a namespace to get around the conflicts.
    | A use case might be including views from within a plugin folder.
    |
    */

    'namespaces' => [
        /*
         | Given the below example, in your views use something like:
         |     @include('MyPlugin::some.view.or.partial.here')
         */
        // 'MyPlugin' => WP_PLUGIN_DIR . '/my-plugin/resources/views',
    ],

    /*
    |--------------------------------------------------------------------------
    | View Directives
    |--------------------------------------------------------------------------
    |
    | The namespaces where view components reside. Components can be referenced
    | with camelCase & dot notation.
    |
    */

    'directives' => [
        'sliderContent' => \App\View\Directives\SliderContentBladeDirective::class,
        'enqueueScripts' => \App\View\Directives\EnqueueScriptsBladeDirective::class,
        'xdebugBreak' => \App\View\Directives\XDebugBladeDirective::class,
    ],
];
