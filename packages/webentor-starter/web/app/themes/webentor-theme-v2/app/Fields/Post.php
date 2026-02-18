<?php

namespace App\Fields;

use Log1x\AcfComposer\Builder;
use Log1x\AcfComposer\Field;

class Post extends Field
{
    public function fields()
    {
        $fields = Builder::make('post_settings', [
            'title' => _x('Additional Post Settings', 'acf-fields', 'webentor')
        ]);

        $fields
            ->setLocation('post_type', '==', 'post')
            ->addText('external_url', [
                'label' => 'External URL',
                'placeholder' => 'https://',
            ]);

        return $fields->build();
    }
}
