<?php
/**
 * Title: HP Banner section
 * Slug: webentor/hp-banner-section
 * Categories: webentor/sections
 * Description: Section that contains Image content block.
 * Keywords: banner, pattern, section, homepage
 * Block Types: webentor/l-section, webentor/l-flexible-container, core/heading, core/paragraph, webentor/e-button, webentor/b-image-content
 * Post Types: page
 *
 * @see https://wordpress.stackexchange.com/a/398395/134384
 * @see https://fullsiteediting.com/lessons/introduction-to-block-patterns/#h-registering-block-patterns-using-the-patterns-folder
 */
?>
<!-- wp:webentor/l-section {"spacing":{"padding-top":{"value":{"basic":"pt-10","lg":"pt-20"}},"padding-bottom":{"value":{"basic":"","lg":""}}}} -->
    <!-- wp:webentor/b-image-content {"type":"left","img": null} -->
        <!-- wp:heading {"textColor":"grey-900","customTypography":"text-h2-semibold"} -->
            <h2 class="wp-block-heading has-grey-900-color has-text-color text-h2-semibold">This is a prefilled heading</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"textColor":"grey-700","customTypography":"text-headline"} -->
            <p class="has-grey-700-color has-text-color text-headline">Here goes some text content.</p>
        <!-- /wp:paragraph -->

        <!-- wp:webentor/e-button {"button":{"showButton":true,"title":"Discover now","variant":"primary","url":"#","size":"large"}} /-->
    <!-- /wp:webentor/b-image-content -->
<!-- /wp:webentor/l-section -->
