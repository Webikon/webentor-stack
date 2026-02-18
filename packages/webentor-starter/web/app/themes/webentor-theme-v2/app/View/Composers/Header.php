<?php

namespace App\View\Composers;

use Roots\Acorn\View\Composer;

class Header extends Composer
{
    /**
     * List of views served by this composer.
     *
     * @var array
     */
    protected static $views = [
        'partials.header',
    ];

    protected $field_prefix = 'theme-header_';

    /**
     * @return array
     */
    public function with()
    {
        return [
            'primary_nav' => \App\get_wp_menu_items('primary_nav'),
            'login_btn' => get_field($this->field_prefix . 'login_btn', 'option'),
            'home_url' => home_url('/'),
        ];
    }
}
