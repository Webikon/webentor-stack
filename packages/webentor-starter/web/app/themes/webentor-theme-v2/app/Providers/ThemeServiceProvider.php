<?php

namespace App\Providers;

use Roots\Acorn\Sage\SageServiceProvider;

class ThemeServiceProvider extends SageServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        parent::register();
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        // Load all blocks data files
        // These are used instead of View composers in app/View/Composers to keep all block relevant code in one place
        $block_data_files = glob(get_template_directory() . '/resources/blocks/**/data.php');

        foreach ($block_data_files as $filename) {
            require_once $filename;
        }

        $core_data_files = glob(WEBENTOR_CORE_PHP_PATH . '/resources/blocks/**/data.php');

        foreach ($core_data_files as $filename) {
            require_once $filename;
        }
    }
}
