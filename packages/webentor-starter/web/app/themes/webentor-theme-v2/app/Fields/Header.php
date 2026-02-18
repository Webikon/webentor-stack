<?php

namespace App\Fields;

use Log1x\AcfComposer\Builder;
use Log1x\AcfComposer\Field;

class Header extends Field
{
    public function fields()
    {
        $name = 'theme-header';
        $prefix = $name . '_';

        $fields = Builder::make($name, [
            'title' => 'Header Settings',
        ]);

        $fields
            ->setLocation('options_page', '==', 'theme-header');

        $fields->addLink($prefix . 'login_btn', [
            'label' => 'Login Button'
        ]);

        return $fields;
    }
}
