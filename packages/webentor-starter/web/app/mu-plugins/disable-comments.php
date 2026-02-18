<?php
/*
Plugin Name: Disable Comments (Must Use version)
Plugin URI: https://github.com/solarissmoke/disable-comments-mu
Description: Disables all WordPress comment functionality on the entire network.
Version: 1.1.2
Author: Samir Shah
Author URI: http://rayofsolaris.net/
License: GPL2
GitHub Plugin URI: https://github.com/solarissmoke/disable-comments-mu
*/

if (!defined('ABSPATH')) {
    exit;
}

class Disable_Comments_MU
{
    public function __construct()
    {
        // these need to happen now
        add_action('widgets_init', [ $this, 'disable_rc_widget' ]);
        add_filter('wp_headers', [ $this, 'filter_wp_headers' ]);
        add_action('template_redirect', [ $this, 'filter_query' ], 9); // before redirect_canonical

        // Admin bar filtering has to happen here since WP 3.6
        add_action('template_redirect', [ $this, 'filter_admin_bar' ]);
        add_action('admin_init', [ $this, 'filter_admin_bar' ]);

        // these can happen later
        add_action('wp_loaded', [ $this, 'setup_filters' ]);
    }

    public function setup_filters()
    {
        $types = array_keys(get_post_types([ 'public' => true ], 'objects'));
        if (!empty($types)) {
            foreach ($types as $type) {
                // we need to know what native support was for later
                if (post_type_supports($type, 'comments')) {
                    remove_post_type_support($type, 'comments');
                    remove_post_type_support($type, 'trackbacks');
                }
            }
        }

        // Filters for the admin only
        if (is_admin()) {
            add_action('admin_menu', [ $this, 'filter_admin_menu' ], 9999);    // do this as late as possible
            add_action('admin_print_styles-index.php', [ $this, 'admin_css' ]);
            add_action('admin_print_styles-profile.php', [ $this, 'admin_css' ]);
            add_action('wp_dashboard_setup', [ $this, 'filter_dashboard' ]);
            add_filter('pre_option_default_pingback_flag', '__return_zero');
        }
        // Filters for front end only
        else {
            add_action('template_redirect', [ $this, 'check_comment_template' ]);
            add_filter('comments_open', [ $this, 'filter_comment_status' ], 20, 2);
            add_filter('pings_open', [ $this, 'filter_comment_status' ], 20, 2);

            // remove comments links from feed
            add_filter('post_comments_feed_link', '__return_false', 10, 1);
            add_filter('comments_link_feed', '__return_false', 10, 1);
            add_filter('comment_link', '__return_false', 10, 1);

            // remove comment count from feed
            add_filter('get_comments_number', '__return_false', 10, 2);

            // Remove feed link from header
            add_filter('feed_links_show_comments_feed', '__return_false');
        }
    }

    public function check_comment_template()
    {
        if (is_singular()) {
            // Kill the comments template. This will deal with themes that don't check comment stati properly!
            add_filter('comments_template', [ $this, 'dummy_comments_template' ], 20);
            // Remove comment-reply script for themes that include it indiscriminately
            wp_deregister_script('comment-reply');
            // Remove feed action
            remove_action('wp_head', 'feed_links_extra', 3);
        }
    }

    public function dummy_comments_template()
    {
        return dirname(__FILE__) . '/disable-comments-mu/comments-template.php';
    }

    public function filter_wp_headers($headers)
    {
        unset($headers['X-Pingback']);

        return $headers;
    }

    public function filter_query()
    {
        if (is_comment_feed()) {
            // we are inside a comment feed
            wp_die(__('Comments are closed.'), '', [ 'response' => 403 ]);
        }
    }

    public function filter_admin_bar()
    {
        if (is_admin_bar_showing()) {
            // Remove comments links from admin bar
            remove_action('admin_bar_menu', 'wp_admin_bar_comments_menu', 60);
            if (is_multisite()) {
                add_action('admin_bar_menu', [ $this, 'remove_network_comment_links' ], 500);
            }
        }
    }

    public function remove_network_comment_links($wp_admin_bar)
    {
        if (is_user_logged_in()) {
            foreach ((array) $wp_admin_bar->user->blogs as $blog) {
                $wp_admin_bar->remove_menu('blog-' . $blog->userblog_id . '-c');
            }
        }
    }

    public function filter_admin_menu()
    {
        global $pagenow;

        if (in_array($pagenow, [ 'comment.php', 'edit-comments.php', 'options-discussion.php' ])) {
            wp_die(__('Comments are closed.'), '', [ 'response' => 403 ]);
        }

        remove_menu_page('edit-comments.php');
        remove_submenu_page('options-general.php', 'options-discussion.php');
    }

    public function filter_dashboard()
    {
        remove_meta_box('dashboard_recent_comments', 'dashboard', 'normal');
    }

    public function admin_css()
    {
        echo '<style>
			#dashboard_right_now .comment-count,
			#dashboard_right_now .comment-mod-count,
			#latest-comments,
			#welcome-panel .welcome-comments,
			.user-comment-shortcuts-wrap {
				display: none !important;
			}
		</style>';
    }

    public function filter_comment_status($open, $post_id)
    {
        return false;
    }

    public function disable_rc_widget()
    {
        // This widget has been removed from the Dashboard in WP 3.8 and can be removed in a future version
        unregister_widget('WP_Widget_Recent_Comments');
    }
}

new Disable_Comments_MU();
