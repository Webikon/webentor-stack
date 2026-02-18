<?php
/**
 * Plugin Name: Webikon Post Meta Inspector
 * Description: Allows administrators to inspect post meta data
 * Author: Webikon
 * Version: 1.0
 */
add_action('admin_init', function () {
    if (! (current_user_can('administrator') || current_user_can('manage_woocommerce'))) {
        return;
    }

    $current_user = wp_get_current_user();
    if (! preg_match('/@webikon\.(?:sk|eu)$/', $current_user->user_email)) {
        return;
    }
    add_action('add_meta_boxes', function () {
        add_meta_box(
            'webikon-post-meta-inspector',
            'Webikon Post Meta Inspector (available only to admins and shop managers)',
            function ($post) {
                if (is_a($post, 'WC_Order')) {
                    $post_id = $post->get_id();
                } else {
                    $post_id = $post->ID;
                }
                $meta = get_post_meta($post_id);
                uksort($meta, function ($a, $b) {
                    return strcasecmp(ltrim($a, '_'), ltrim($b, '_'));
                });
                echo '<style>.webikon-post-meta-inspector{border-collapse:collapse;width:100%}.webikon-post-meta-inspector th{padding:.333em;text-align:left}.webikon-post-meta-inspector td{font-family:monospace;font-size:90%;padding:.333em;vertical-align:top}.webikon-post-meta-inspector tr:hover td{background:#0001}.webikon-post-meta-inspector td.multiple{font-weight:bold}.webikon-post-meta-inspector td:nth-child(2) span{opacity:0.333}</style>';
                echo '<table class="webikon-post-meta-inspector"><thead><tr><th>meta key</th><th>meta value</th></tr></thead><tbody>';
                foreach ($meta as $key => $values) {
                    $single = 1 === count($values);
                    if ($single && preg_match('/^(?:a|O:\d+:"[^"]+"):\d+:\{/', $values[0])) {
                        $values[0] = get_post_meta($post_id, $key, true);
                    }
                    echo '<tr><td' . ($single ? '' : ' class="multiple"') . '>' . esc_html($key) . '</td><td>';
                    echo nl2br(webikon_post_meta_inspector_dump($single ? $values[0] : $values));
                    echo '</td></tr>';
                }
                echo '</tbody></table>';
            },
            null,
            'normal',
            'low'
        );
    }, 1000);
});

function webikon_post_meta_inspector_dump($value, $level = 0)
{
    $type = gettype($value);
    if (is_scalar($value)) {
        if ('' === $value) {
            $type .= '/empty';
            $dump = '';
        } else {
            $dump = esc_html(var_export($value, true));
        }
    } elseif (is_array($value)) {
        $type .= ':';
        $dump = webikon_post_meta_inspector_dump_composite($value, $level);
    } elseif (is_object($value)) {
        $dump = get_class($value) . '<span>:</span>' . webikon_post_meta_inspector_dump_composite(get_object_vars($value), $level);
    } else {
        $dump = '';
    }

    return str_repeat('&nbsp;', 4 * $level) . rtrim("<span>$type</span> $dump");
}

function webikon_post_meta_inspector_dump_composite($value, $level)
{
    return "\n" . implode("\n", array_map(function ($value, $key) use ($level) {
        return webikon_post_meta_inspector_dump($key, $level + 1) . ': ' . webikon_post_meta_inspector_dump($value, 0);
    }, array_values($value), array_keys($value)));
}
