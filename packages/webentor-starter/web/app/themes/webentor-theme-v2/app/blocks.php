<?php

/**
 * Filters the allowed block types for all editor types.
 *
 * @param bool|string[]           $allowed_block_types  Array of block type slugs, or boolean to enable/disable all.
 * @param WP_Block_Editor_Context $block_editor_context The current block editor context.
 */
add_filter('allowed_block_types_all', function ($allowed_block_types, $block_editor_context) {
    // Allow all WP core blocks
    $allowed_core = [
        // Design blocks
        // 'core/button',
        // 'core/comment-template',
        // 'core/home-link',
        // 'core/navigation-link',
        // 'core/navigation-submenu',
        // 'core/buttons',
        // 'core/column',
        // 'core/columns',
        // 'core/group',
        'core/more',
        'core/nextpage',
        'core/separator',
        'core/spacer',
        // 'core/text-columns',

        // Embed blocks
        'core/embed',

        // Media blocks
        // 'core/cover',
        'core/file',
        // 'core/gallery',
        // 'core/image',
        // 'core/media-text',
        'core/audio',
        'core/video',

        // Reusable blocks
        'core/block',

        // Text blocks
        'core/footnotes',
        'core/heading',
        'core/list',
        'core/code',
        'core/details',
        'core/freeform',
        'core/list-item',
        'core/missing',
        'core/paragraph',
        'core/preformatted',
        // 'core/pullquote',
        // 'core/quote',
        'core/table',
        // 'core/verse',

        // Theme blocks
        'core/avatar',
        // 'core/comment-author-name',
        // 'core/comment-content',
        // 'core/comment-date',
        // 'core/comment-edit-link',
        // 'core/comment-reply-link',
        // 'core/comments',
        // 'core/comments-pagination',
        // 'core/comments-pagination-next',
        // 'core/comments-pagination-numbers',
        // 'core/comments-pagination-previous',
        // 'core/comments-title',
        // 'core/loginout',
        // 'core/navigation',
        'core/pattern',
        'core/post-author',
        'core/post-author-biography',
        'core/post-author-name',
        // 'core/post-comments-form',
        'core/post-content',
        'core/post-date',
        'core/post-excerpt',
        'core/post-featured-image',
        'core/post-navigation-link',
        'core/post-template',
        'core/post-terms',
        'core/post-title',
        'core/query',
        'core/query-no-results',
        'core/query-pagination',
        'core/query-pagination-next',
        'core/query-pagination-numbers',
        'core/query-pagination-previous',
        'core/query-title',
        'core/read-more',
        'core/site-logo',
        'core/site-tagline',
        'core/site-title',
        'core/template-part',
        'core/term-description',
        // 'core/post-comments',

        // Widget blocks
        'core/legacy-widget',
        'core/widget-group',
        'core/archives',
        'core/calendar',
        'core/categories',
        'core/latest-comments',
        'core/latest-posts',
        'core/page-list',
        'core/page-list-item',
        'core/rss',
        'core/search',
        'core/shortcode',
        'core/social-link',
        'core/tag-cloud',
        'core/html',
        'core/social-links',

        // Plugins blocks
        'gravityforms/form',
    ];

    $allowed_block_types = is_array($allowed_block_types) ? array_merge($allowed_block_types, $allowed_core) : $allowed_core;

    return $allowed_block_types;
}, 99, 2);
