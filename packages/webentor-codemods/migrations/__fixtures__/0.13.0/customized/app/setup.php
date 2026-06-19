<?php

namespace App;

use Illuminate\Support\Facades\File;

/**
 * A consumer theme that already restructured (or never matched) the canonical
 * shape — only the editor JS is enqueued here. The migration must leave this
 * file completely untouched (idempotent / conservative no-op).
 */
add_action('enqueue_block_editor_assets', function (): void {
    $dependencies = File::exists(get_template_directory() . '/public/build/editor.deps.json') ? File::json(get_template_directory() . '/public/build/editor.deps.json') : [];

    \Kucrut\Vite\enqueue_asset(
        get_template_directory() . '/public/build',
        'resources/scripts/editor.ts',
        [
            'handle' => 'theme-blocks-editor',
            'dependencies' => $dependencies,
            'in-footer' => true,
        ]
    );
}, 10);
