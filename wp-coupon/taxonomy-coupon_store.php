<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package WP Coupon
 */
get_header();

$term = get_queried_object();
wpcoupon_setup_store( $term );
$current_link = get_permalink( $term );
$store_name = wpcoupon_store()->name;
$layout = wpcoupon_get_option( 'store_layout', 'left-sidebar' );
$store_name = wpcoupon_store()->get_display_name();
$store_disc = wpcoupon_store()->get_content( false, true );
?>

<div id="content-wrap" class="container <?php echo esc_attr( $layout ); ?>">

	<div id="primary" class="content-area">
		<main id="main" class="site-main coupon-store-main" role="main">
			<?php
			/**
			 * Hooked
			 *
			 * @see wpcoupon_breadcrumb() - 15
			 *
			 * @since 1.0.0
			 */
				//do_action( 'wpcoupon_before_container' );
			?>
			
			<div class="header_mobile_pic_store">
			    <?php
			    echo wpcoupon_store()->get_thumbnail();
			    ?>
			</div>
			
		    <h1><strong><?php echo wpcoupon_store()->name; ?></strong> <span style="font-size: 20px;">Coupons & Promo Codes</span></h1>
			<?php
			/**
			 * Hooked
			 *
			 * @see: wpcoupon_store_coupons_filter -  15
			 * @see wpcoupon_store_coupons_filter
			 * @since 1.0.0
			 */
			do_action( 'wpcoupon_before_coupon_listings' );

			global $wp_query;
			$coupons = $wp_query->posts;
			$coupon_max_pages = $wp_query->max_num_pages;
			$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;

			if ( $coupon_max_pages >= ( $paged + 1 ) ) {
				$nextpage = ( $paged + 1 );
			} else {
				$nextpage = $paged;
			}

            if ( have_posts() ) {
                ?>
                <section id="coupon-listings-store" class=" wpb_content_element">
                    <div class="ajax-coupons">
                        <div class="store-listings st-list-coupons couponstore-tpl-<?php echo esc_attr( $loop_tpl ); ?>">
                            <?php
                            while ( have_posts() ) {
                                the_post();
                                wpcoupon_setup_coupon( get_post( get_the_ID() ) );
                                get_template_part( 'loop/loop-coupon', $loop_tpl );
                            }
                            ?>
                        </div>
                        <!-- END .store-listings -->
                        <?php
                        $coupon_type = 'all';
                        $available_coupon_type = wpcoupon_get_coupon_types();

                        $get_coupon_var = ( isset( $_GET['coupon_type'] ) ) ? sanitize_text_field( wp_unslash( $_GET['coupon_type'] ) ) : '';
                        if ( isset( $get_coupon_var ) && array_key_exists( $get_coupon_var, $available_coupon_type ) ) {
                            $coupon_type = $get_coupon_var;
                        }
                        if ( $coupon_max_pages > 1 && $paged < $coupon_max_pages ) { ?>
                            <div class="store-load-more wpb_content_element">
                                <a href="<?php echo get_pagenum_link( $nextpage ); ?>" class="ui button btn btn_primary btn_large"
                                   data-loading-text="<?php esc_attr_e( 'Loading...', 'wp-coupon' ); ?>"><?php esc_html_e( 'Load More Coupons', 'wp-coupon' ); ?> <i class="arrow alternate circle down outline icon"></i></a>
                            </div>
                        <?php }

                        ?>
                    </div><!-- /.ajax-coupons -->
                </section>
                <?php
            } else { // No coupon found
                ?>
                <div id="coupon-listings-store">
                    <div class="ajax-coupons">
                        <div class="ui warning message">
                            <i class="close icon"></i>
                            <div class="header">
                                <?php esc_html_e( 'Oops! No coupons found', 'wp-coupon' ); ?>
                            </div>
                            <p><?php esc_html_e( 'There are no coupons for this store, please come back later.', 'wp-coupon' ); ?></p>
                        </div>
                    </div>
                </div>
                <?php
            }


			$number_active = intval( wpcoupon_get_option( 'store_number_active', 15 ) );
			 /**
			 * get coupons of this store
			 */
			$term_id = get_queried_object_id();
			$loop_tpl = wpcoupon_get_option( 'store_loop_tpl', 'full' );

			
			do_action( 'st_after_coupon_listings' );
			echo wpcoupon_store()->get_extra_info();

			wp_reset_postdata();
			?>
		</main><!-- #main -->
	</div><!-- #primary -->
    
    <div class="store_sidebar_cont" style="float: left; width: 30%">
    
	<div id="secondary" class="ab widget-area sidebar" role="complementary" style="padding-bottom: 25px; width: 100%;">
    <section class="custom-page-header single-store-header">
        <div class="content">
		
			<div class="inner shadow-box">
			<div class="inner-content clearfix">
				<div class="header-thumb">
					<div class="header-store-thumb">
						<a rel="nofollow" target="_blank" title="<?php esc_html_e( 'Shop ', 'wp-coupon' );
						echo $store_name; ?>" href="<?php echo wpcoupon_store()->get_go_store_url(); ?>">
							<?php
							echo wpcoupon_store()->get_thumbnail();
							?>
						</a>
					</div>
					<a class="add-favorite" data-id="<?php echo wpcoupon_store()->term_id; ?>" href="#"><i class="empty heart icon"></i><span><?php esc_html_e( 'Favorite This Store', 'wp-coupon' ); ?></span></a>
				</div>
			</div>
			
			<?php
				$code_count = 0;
				$sale_count = 0;
				
				$count = wpcoupon_store()->count_coupon();
				$code_count = $count['code'];
				$sale_count = $count['sale'];
				
				?>
			
			<div style="margin-top: 10px; margin-bottom: 25px;">
					<?php if(function_exists('the_ratings')) { the_ratings(); } ?>	
				</div>
			
			<table class="total_offer_box">
			    <tr>
			        <td class="total_offer_content">
			            <?php echo $code_count + $sale_count; ?>+<br>
			            <div>COUPONS AVAILABLE</div>
			        </td>
			    </tr>
			</table>
				
				
				<div class="header-content">
					<?php
					    echo $store_disc;
					?>
					<?php
					/**
					 * Hooked
					 *
					 * @see wpcoupon_store_share() - 15
					 *
					 * @since 1.0.0
					 */
					do_action( 'wpcoupon_store_content' );
					?>
				</div>
				
		</div>
		</div>
		</section>
	</div>	
	
	<?php get_sidebar( 'store' ); ?>
    </div>
    
    <div class="mobile_desc">
        
        <table class="total_offer_box">
			    <tr>
			        <td class="total_offer_content">
			            <?php echo $code_count + $sale_count; ?>+<br>
			            <div>COUPONS AVAILABLE</div>
			        </td>
			    </tr>
			</table>
			
		<table class="mobile_desc_container">
            <tr>
                <td class="mobile_description">
                    <h3>Description:</h3>
                    <?php echo $store_disc; ?>
                </td>
            </tr>
        </table>
	</div>
	
    <div class="#store_faq">
        <h2><?php echo $store_name; ?> FAQ’s</h2>
        <div class="eachFaq">
        	<h4 class="title">How to use <?php echo $store_name; ?> coupon codes, deals, vouchers and promos?</h4>
        	<div class="accordion-content">
    	        <p>Using the coupons are extremely simple, First Find and shop your desired product/services Add your product or service to your cart and click checkout. You will probably find a discount box to enter a coupon, promo, or voucher code at the checkout page. Search for <?php echo $store_name; ?> at Zensaving.com or search on Google, Bing, Yandex, Baidu with Keyword “<?php echo $store_name; ?> Coupon zensaving.com” Click On “Get Code” for the coupon you wish to use. Copy and paste the code. Congratulations! You saved your money. Deals are applied automatically, you only have to follow instructions written in descriptions of a deal.</p>
    	    </div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
    
        <div class="eachFaq">
        	<h4 class="title">Do the coupons have any restrictions?</h4>
        	<div class="accordion-content">
        	    <p>Some coupons may have restrictions such as minimum purchase requirements, product exclusions, or usage limits. Please read the coupon details carefully before using.</p>
        	</div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
    
        <div class="eachFaq">
        	<h4 class="title">Does <?php echo $store_name; ?> offer free shipping?</h4>
        	<div class="accordion-content">
        	    <p>Yes, <?php echo $store_name; ?> offer free shipping on all order.</p>
        	</div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
    
        <div class="eachFaq">
        	<h4 class="title">Can I use multiple coupons in a single transaction?</h4>
        	<div class="accordion-content">
        	    <p><?php echo $store_name; ?>’s policy may vary. While some promotions allow stacking coupons, others limit you to one coupon per purchase.</p>
        	</div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
        
        <div class="eachFaq">
        	<h4 class="title">How often are new <?php echo $store_name; ?> coupons added?</h4>
        	<div class="accordion-content">
        	    <p>We update our coupon database frequently to provide the latest and most relevant deals. Check back often or subscribe to our newsletter for updates.</p>
        	</div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
        
        <div class="eachFaq">
        	<h4 class="title">Do <?php echo $store_name; ?> offer exclusive coupons not found elsewhere?</h4>
        	<div class="accordion-content">
        	    <p>Yes! We partner with retailers to bring you exclusive deals that aren’t available on other sites.</p>
        	</div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
        
        <div class="eachFaq">
        	<h4 class="title">What should I do if a coupon doesn’t work?</h4>
        	<div class="accordion-content">
        	    <p>If a coupon code is not working, ensure that it is valid, meets the terms and conditions, and hasn’t expired. Contact our support team for further assistance if needed.</p>
        	</div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
        
        <div class="eachFaq">
        	<h4 class="title">Can I use a coupon on a sale item?</h4>
        	<div class="accordion-content">
        	    <p>Some coupons can be used on sale items, while others are only valid for full-price products. Check the coupon details for any restrictions.</p>
        	</div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
        
        <div class="eachFaq">
        	<h4 class="title">Can I submit a coupon if I find a deal elsewhere?</h4>
        	<div class="accordion-content">
        	    <p>Yes, we encourage users to share deals! You can submit a coupon through our website, and our team will verify and publish it.</p>
        	</div> <!-- //.accordion-content -->
        </div> <!-- //.eachFaq -->
        
    </div>

</div> <!-- /#content-wrap -->

<?php get_footer(); ?>
