<?php

namespace App\Fields;

use Log1x\AcfComposer\Builder;
use Log1x\AcfComposer\Field;

class ThemeSettings extends Field
{
    public function fields()
    {
        $fields = Builder::make('global_theme_settings', [
            'title' => _x('Global Theme Settings', 'theme-options-fields', 'webentor')
        ]);

        $fields
            ->setLocation('options_page', '==', 'theme-general-settings');

        // $fields
        //     ->addTab('languages_tab', ['label' => 'Languages', 'placement' => 'left'])
        //         ->addRepeater('languages', [
        //             'min' => 0,
        //             'button_label' => 'Add Language',
        //             'label' => 'Languages Navigation',
        //             'instructions' => 'Add languages that will be displayed in the header and footer.',
        //             'layout' => 'block',
        //         ])
        //             ->addLink('link', ['label' => 'Link'])
        //         ->endRepeater();
        // ->addTab('gtm_tab', ['label' => 'Google Tag Manager', 'placement' => 'left'])
        //     ->addText('gtm_code', [
        //         'placeholder' => 'GTM-XXXX',
        //     ]);

        return $fields->build();
    }
}
