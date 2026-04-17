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

        // Load theme block data files (View Composers + class split filters).
        // Core block data files are loaded by WebentorCoreServiceProvider.
        $block_data_files = glob(get_template_directory() . '/resources/blocks/**/data.php');

        foreach ($block_data_files as $filename) {
            require_once $filename;
        }
    }
}
