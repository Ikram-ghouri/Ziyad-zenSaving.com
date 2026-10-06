<?php
/**
 * Template Name: Front Page New
 *
 * @package WP-Coupon
 * @since 1.0.
 */


get_header();

/**
 * Hooks wpcoupon_after_header
 *
 * @see wpcoupon_page_header();
 *
 */
do_action( 'wpcoupon_after_header' );
$layout = wpcoupon_get_site_layout();
if ( ! is_active_sidebar( 'frontpage-sidebar' ) ) {
    $layout = 'no-sidebar';
}

?>
<div id="content-wrap" class="frontpage-container container <?php echo esc_attr( $layout ); ?>">

    <?php
    if ( is_active_sidebar( 'frontpage-before-main' ) ){
        echo '<div class="content-widgets frontpage-before-main">';
        dynamic_sidebar( 'frontpage-before-main' );
        echo '</div>';
    }
    
    if ( is_active_sidebar( 'frontpage-main' ) ) {
        ?>
        <div id="primary" class="content-area">
            
            <main id="main" class="site-main content-widgets" role="main">
                <aside id="st_coupons-2" class="widget st-coupons">
                    <h3 class="widget-title">Coupon Codes</h3>
                    <div class="coupons-tab-contents" id="coupons-65081655b0a20">
                         <div class="ajax-coupons coupon-tab-content latest-tab">
                            <div class="store-listings st-list-coupons">
                                <?php
                                global $wpdb;
                                $sql = "SELECT ID, post_title, post_content FROM `wprilk_posts` WHERE `post_type` = 'coupon' AND post_status = 'publish' ORDER BY post_date_gmt DESC LIMIT 0,10;";
                                $coupons = $wpdb->get_results($sql) or die(mysql_error());
                                $site_url = site_url();
                                foreach($coupons as $coupon){
                                    $term_obj_list = get_the_terms( $coupon->ID, 'coupon_store' );
                                    $store_image = get_term_meta($term_obj_list[0]->term_id, '_wpc_store_image');
                                ?>
                                <div data-id="<?php echo $coupon->ID; ?>" class="coupon-item store-listing-item has-thumb c-cat c-type-sale shadow-box coupon-live">
                                    <div class="store-thumb-link">
                                        <div class="store-thumb thumb-img">
                                            <a class="thumb-padding" href="<?php echo $site_url; ?>/store/<?php echo $term_obj_list[0]->slug; ?>/">
                                                <img width="120" height="50" src="<?php echo $store_image[0]; ?>" class="attachment-wpcoupon_medium-thumb size-wpcoupon_medium-thumb" decoding="async" loading="lazy" title="<?php echo $term_obj_list[0]->name; ?>">
                                            </a>
                                        </div>

                                        <div class="store-name">
                                            <a href="<?php echo $site_url; ?>/store/<?php echo $term_obj_list[0]->slug; ?>/"><?php echo $term_obj_list[0]->name; ?><i class="angle right icon"></i></a>
                                        </div>
                                    </div>
                                
                                    <div class="latest-coupon">
                                        <h3 class="coupon-title">
                                            <a class="coupon-link" rel="nofollow" title="<?php echo $coupon->post_title; ?>" data-type="sale" data-coupon-id="<?php echo $coupon->ID; ?>" data-aff-url="<?php echo $site_url; ?>/out/<?php echo $coupon->ID; ?>" data-code="" href="<?php echo $site_url; ?>/store/<?php echo $term_obj_list[0]->slug; ?>/<?php echo $coupon->ID; ?>/"><?php echo $coupon->post_title; ?></a>
                                        </h3>
                                        <div class="coupon-des">
                                            <div class="coupon-des-ellip"><?php echo $coupon->post_content; ?></div>
                                        </div>
                                    </div>

                                    <div class="coupon-detail coupon-button-type">
                                        <a rel="nofollow" data-type="sale" data-coupon-id="<?php echo $coupon->ID; ?>" data-aff-url="<?php echo $site_url; ?>/out/<?php echo $coupon->ID; ?>" class="coupon-deal coupon-button" href="<?php echo $site_url; ?>/store/<?php echo $term_obj_list[0]->slug; ?>/<?php echo $coupon->ID; ?>/">Get Deal <i class="shop icon"></i></a>
                                        <div class="clear"></div>
                                    </div>

                                    <div class="clear"></div>
                                
                                </div>
                                <?php } ?>
        
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
            <!-- #main -->
        </div><!-- #primary -->
        <?php
    }

    if ( $layout != 'no-sidebar' && is_active_sidebar( 'frontpage-sidebar' ) ) {
        ?>
        <div id="secondary" class="widget-area sidebar" role="complementary">
            <?php
            dynamic_sidebar( 'frontpage-sidebar' );
            ?>
        </div>
        <div class="clear"></div>
        <?php
    }
    ?>

    
</div> <!-- /#content-wrap -->


<?php get_footer(); ?>
