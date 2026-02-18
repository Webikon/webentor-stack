<?php

namespace App;

/**
 * Prepare array of items from WP Menu
 *
 * @link https://developer.wordpress.org/reference/functions/wp_get_nav_menu_items/
 *
 * @param  string $menu_location
 * @return array
 */
function get_wp_menu_items($menu_location = '')
{
    $menu_array = [];

    if ($menu_location && ($locations = get_nav_menu_locations()) && isset($locations[$menu_location])) {
        $menu_items = wp_get_nav_menu_items($locations[$menu_location]);

        // Add classes, current parameters, ...
        _wp_menu_item_classes_by_context($menu_items);

        // Get parent items
        foreach ($menu_items as $item) {
            if (empty($item->menu_item_parent)) {
                $menu_array[$item->ID] = [];
                $menu_array[$item->ID]['ID'] = $item->ID;
                $menu_array[$item->ID]['title'] = $item->title;
                $menu_array[$item->ID]['url'] = $item->url;
                $menu_array[$item->ID]['classes'] = $item->classes;
                $menu_array[$item->ID]['target'] = $item->target;
                $menu_array[$item->ID]['children'] = [];
            }
        }

        // Get also submenu items
        $submenu = [];
        foreach ($menu_items as $item) {
            if (!empty($item->menu_item_parent)) {
                $submenu[$item->ID] = [];
                $submenu[$item->ID]['ID'] = $item->ID;
                $submenu[$item->ID]['title'] = $item->title;
                $submenu[$item->ID]['url'] = $item->url;
                $submenu[$item->ID]['classes'] = $item->classes;
                $submenu[$item->ID]['target'] = $item->target;
                $menu_array[$item->menu_item_parent]['children'][$item->ID] = $submenu[$item->ID];
            }
        }
    }

    return $menu_array;
}
