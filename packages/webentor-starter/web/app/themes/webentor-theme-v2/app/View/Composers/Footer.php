<?php

namespace App\View\Composers;

use Roots\Acorn\View\Composer;

class Footer extends Composer
{
    /**
     * List of views served by this composer.
     *
     * @var array
     */
    protected static $views = [
        'partials.footer',
    ];

    protected $field_prefix = 'theme-footer_';

    /**
     * @return array
     */
    public function with()
    {
        return [
            'primary_nav' => $this->getPrimaryNav(),
            'support_btn' => get_field($this->field_prefix . 'support_btn', 'option'),
            'ig_link' => get_field($this->field_prefix . 'ig_link', 'option'),
            'fb_link' => get_field($this->field_prefix . 'fb_link', 'option'),
            'yt_link' => get_field($this->field_prefix . 'yt_link', 'option'),
            'linkedin_link' => get_field($this->field_prefix . 'linkedin_link', 'option'),
            'x_link' => get_field($this->field_prefix . 'x_link', 'option'),
            'secondary_nav' => get_field($this->field_prefix . 'secondary_nav', 'option'),
            'tertiary_nav' => get_field($this->field_prefix . 'tertiary_nav', 'option'),
            'languages' => \Webentor\Core\get_msls_languages(),
            // 'languages' => \App\get_languages(),
            'current_lang' => \Webentor\Core\get_msls_current_lang(),
            'copyright_text' => get_field($this->field_prefix . 'copyright_text', 'option'),
        ];
    }

    /**
     * Returns header primary navigation links.
     *
     * @param  string $segment_suffix Can be empty string or 'b2b'
     * @return array
     */
    public function getPrimaryNav()
    {
        $nav = get_field($this->field_prefix . 'nav', 'option');

        if (!$nav) {
            return false;
        }

        foreach ($nav as $key => $item) {
            // Menu active item
            /* $is_current = \Webentor\Core\is_current_menu_item($item['link']['url'], \Webentor\Core\get_current_url());

            if ($is_current) {
                $nav[$key]['current'] = \Webentor\Core\is_current_menu_item($item['link']['url'], \Webentor\Core\get_current_url());

                continue;
            } */

            $columns['cols'] = isset($nav[$key]['cols']) && !empty($nav[$key]['cols']) ? $nav[$key]['cols'] : false;
        }

        return $nav;
    }
}
