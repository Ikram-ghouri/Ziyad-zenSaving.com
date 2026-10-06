<?php
    /**
     * The template for displaying the footer.
     *
     * Contains the closing of the #content div and all content after
     *
     * @package WP Coupon
     */
    global $st_option;

        if( wpcoupon_get_option( 'before_footer', '' ) != '' ) {
            if( wpcoupon_get_option( 'before_footer_apply', 'home' ) != 'all' ) {
                if ( get_option( 'show_on_front' ) == 'page' && is_home() ) {
                    echo do_shortcode( wpcoupon_get_option( 'before_footer', '' ) );
                }
            } else {
                echo do_shortcode( wpcoupon_get_option( 'before_footer', '' ) );
            }

        }
        ?>
		</div> <!-- END .site-content -->

        <footer id="colophon" class="site-footer <?php echo ( $st_option['footer_widgets'] ) ? 'footer-widgets-on' : 'footer-widgets-off' ?>" role="contentinfo">
			<div class="container">

                <?php if ( wpcoupon_get_option( 'footer_widgets' ) ) {

                    $footer_columns = 4;
                    $layouts = 16;
                    if ( $footer_columns > 1 ){
                        $layouts = wpcoupon_get_option( 'footer_columns_layout_'.$footer_columns );
                    }
                    $layouts = explode( '+', $layouts );
                    foreach ( $layouts as $k => $v ) {
                        $v = absint( trim( $v ) );
                        $v =  $v >= 16 ? 16 : $v;
                        $layouts[ $k ] = $v;
                    }

                    ?>
                    <div class="footer-widgets-area">
                        <div class="sidebar-footer footer-columns stackable ui grid clearfix">
                            <div id="footer-1" class="<?php echo esc_attr( wpcoupon_number_to_column_class( $layouts[0] ) ); ?> wide column footer-column widget-area" role="complementary">
                                <?php dynamic_sidebar('footer-1'); ?>
                            </div>
                            <div id="footer-2" class="<?php echo esc_attr( wpcoupon_number_to_column_class( $layouts[1] ) ); ?> wide column footer-column widget-area" role="complementary">
                                <?php dynamic_sidebar('footer-2'); ?>
                            </div>
                            <div id="footer-3" class="<?php echo esc_attr( wpcoupon_number_to_column_class( $layouts[2] ) ); ?> wide column footer-column widget-area" role="complementary">
                                <?php dynamic_sidebar('footer-3'); ?>
                            </div>
                            <div id="footer-3" class="<?php echo esc_attr( wpcoupon_number_to_column_class( $layouts[3] ) ); ?> wide column footer-column widget-area" role="complementary">
                                <?php dynamic_sidebar('footer-4'); ?>
                            </div>
                            
                        </div>
                    </div>

                <?php } ?>

                <div class="footer_copy">
                    <hr>
                    <p id="disclosure" style="color: #FFF; text-align: center; margin-bottom: 20px;">
                        Affiliate Disclosure: If You Buy A Product Or Service After Clicking One Of Our Links On Store Pages Or Blog Posts, We May Be Paid A Commission. All Company Logos And Names Used On This Page Are Trademarks Of Their Respective Owners And Are Their Property.
                    </>
                    
                    <nav id="footer-nav" class="site-footer-nav">
                        <?php wp_nav_menu( array( 'container' => false, 'theme_location' => 'footer', 'fallback_cb' => false ) ); ?>
                    </nav>
                    <div class="clearfix"></div>
                    <p style="margin-top: 10px;">
                        Copyright © <?php echo date("Y"); ?> Zen Saving. All Rights Reserved.
                    </p>
                </div>
            </div>
		</footer><!-- END #colophon-->

	</div><!-- END #page -->

    <?php wp_footer(); ?>
</body>
</html>
