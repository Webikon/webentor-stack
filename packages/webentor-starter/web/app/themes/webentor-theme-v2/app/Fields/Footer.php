<?php

namespace App\Fields;

use Log1x\AcfComposer\Field;
use Log1x\AcfComposer\Builder;

class Footer extends Field
{
    public function fields()
    {
        $name = 'theme-footer';
        $prefix = $name . '_';

        $fields = Builder::make($name, [
            'title' => 'Footer Settings',
        ]);

        $fields
            ->setLocation('options_page', '==', 'theme-footer');

        $fields
            ->addText($prefix . 'copyright_text', [
                'label' => 'Copyright text',
                'instructions' => 'This text will be displayed on the bottom of the footer.',
            ]);

        $fields
            ->addRepeater($prefix . 'nav', [
                'button_label' => 'Add Primary Nav Link',
                'label' => 'Primary Navigation',
                'layout' => 'block'
            ])
                ->addFields($this->mainNavSubfieldsPartial())
            ->endRepeater();

        $fields->addLink($prefix . 'support_btn', [
            'label' => 'Support button'
        ]);

        $fields->addLink($prefix . 'ig_link', [
            'label' => 'Instagram link'
        ]);

        $fields->addLink($prefix . 'fb_link', [
            'label' => 'Facebook link'
        ]);

        $fields->addLink($prefix . 'yt_link', [
            'label' => 'YouTube link'
        ]);

        $fields->addLink($prefix . 'linkedin_link', [
            'label' => 'LinkedIn link'
        ]);

        $fields->addLink($prefix . 'x_link', [
            'label' => 'X link'
        ]);

        $fields->addRepeater($prefix . 'secondary_nav', [
            'min' => 0,
            'button_label' => 'Add Secondary Nav Link',
            'label' => 'Secondary Navigation',
            'layout' => 'block',
        ])
            ->addLink('link', ['label' => 'Link'])
        ->endRepeater();

        $fields->addRepeater($prefix . 'tertiary_nav', [
            'min' => 0,
            'button_label' => 'Add Tertiary Nav Link',
            'label' => 'Tertiary Navigation',
            'layout' => 'block',
        ])
            ->addLink('link', ['label' => 'Link'])
        ->endRepeater();

        return $fields;
    }

    private function mainNavSubfieldsPartial()
    {
        $subfields = Builder::make('main_nav_subfields');
        $subfields
            ->addTab('tab1', ['label' => 'Footer section title', 'placement' => 'left'])

            ->addText('section_title', [
                'label' => 'Section Title',
            ])

            ->addTab('tab2', ['label' => 'Columns', 'placement' => 'left'])

            ->addRepeater('cols', [
                'min' => 0,
                'button_label' => 'Add Column',
                'label' => 'Columns',
                'layout' => 'block',
            ])
                ->addText('col_title', [
                    'label' => 'Column Title',
                ])
                ->addRepeater('col_links', [
                    'min' => 0,
                    'button_label' => 'Add Link',
                    'label' => 'Column Links',
                    'layout' => 'block',
                ])
                    ->addLink('link', ['label' => 'Link'])
                ->endRepeater()
            ->endRepeater();

        return $subfields;
    }
}
