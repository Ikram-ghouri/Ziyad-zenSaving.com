<?php
/**
 * The header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="content">
 *
 * @package WP Coupon
 */
global $st_option;
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16918905913"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'AW-16918905913');
    </script>

    
    <script> (function(w,d,t,r,u) { var f,n,i; w[u]=w[u]||[],f=function() { var o={ti:"187114683", enableAutoSpaTracking: true}; o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad") }, n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function() { var s=this.readyState; s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null) }, i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i) }) (window,document,"script","//bat.bing.com/bat.js","uetq"); </script>



	<!-- verivoation code  --->
	<meta name="linkapprove-verification" content="268d782b-5189-4252-8303-4149908711b5" />
	<meta name="linkapprove-verification" content="268d782b-5189-4252-8303-4149908711b5" />
	<meta name="verify-admitad" content="1fb8e3082b" />
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="lhverifycode" content="32dc01246faccb7f5b3cad5016dd5033" />
    <meta name="verify-admitad" content="2e60b98236" />
    <meta name="fo-verify" content="d483b5fc-21f3-4fef-b3df-47a054d178d0" /
    <link rel="profile" href="http://gmpg.org/xfn/11">
    <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
    <?php
    if(isset($_GET['coupon_type'])){
        ?>
        <META NAME="robots" CONTENT="noindex,nofollow">
        <?php
    }
    ?>
    <?php wp_head(); ?>

<!-- Event snippet for Page view conversion page -->
<script>
  gtag('event', 'conversion', {
      'send_to': 'AW-16499821279/QKppCI64450ZEN-V3bs9',
      'value': 1.0,
      'currency': 'PKR'
  });
</script>

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-16499821279"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-16499821279');
</script>

<?php
if(isset($_GET['coupon_type'])){
    ?>
    <META NAME="robots" CONTENT="noindex,nofollow">
    <?php
}
?>
<meta name="clicksnova-site-verification" content="q0ZAKPp106538xEIznqj" />
</head>
<body <?php body_class(); ?>>
    <div id="page" class="hfeed site">
    	<header id="masthead" class="ui page site-header" role="banner">
            <?php do_action('wpcoupon_before_header_top'); ?>
            <div class="primary-header">
                <div class="container">
                    <div class="logo_area fleft">
                        <?php if ( wpcoupon_get_option('site_logo', false, 'url') != '' ) { ?>
                        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home">
                            <img src="<?php echo wpcoupon_get_option('site_logo', false, 'url'); ?>" alt="<?php echo get_bloginfo( 'name' ) ?>" />
                        </a>
                        <?php } else { ?>
                        <div class="title_area">
                            <?php if ( is_home() || is_front_page() ) { ?>
                                 <h1 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home"><img src="https://i.ibb.co/HPFVJVZ/cvlogo.png" style="width: 250px;"></a></h1>
                            <?php } else {  ?>
                                <h2 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h2>
                            <?php } ?>
                            <p class="site-description"><?php  bloginfo( 'description' ); ?></p>
                        </div>
                        <?php } ?>
                    </div>

                    <?php
                    $header_icons = null;
                    if ( $header_icons ) {
                    ?>
                    <div class="header-highlight fleft">
                        <?php
                        foreach( $header_icons as $icon ){
                        ?>
                        <a href="<?php echo ( $icon['url'] ) ? esc_attr( $icon['url'] ) : '#'; ?>">
                            <div class="highlight-icon"><?php echo balanceTags( $icon['description'] ); ?></div>
                            <div class="highlight-text"><?php echo esc_html( $icon['title'] ); ?></div>
                        </a>
                        <?php } ?>

                    </div>
                    <?php } ?>

                    <div class="header_right fright"  style="margin: 25px 0 0 0;">
                        <form action="<?php echo home_url( '/' ); ?>" method="get" id="header-search">
                            <div class="header-search-input ui search large action left icon input">
                                <input autocomplete="off" class="prompt" name="s" placeholder="<?php esc_attr_e( 'Search stores for coupons, deals ...', 'wp-coupon' ); ?>" type="text">
                                <i class="search icon"></i>
                                <button onclick="return submit_coupon('<?php echo get_site_url(); ?>/submit-coupon/')" class="header-search-submit ui button"><?php esc_html_e( 'Submit Coupon', 'wp-coupon' ); ?></button>
                                <div class="results"></div>
                            </div>
                            <div class="clear"></div>
							
                        </form>
                    </div>
					
                </div>
            </div> <!-- END .header -->

            <?php do_action('wpcoupon_after_header_top'); ?>

            <div id="site-header-nav" class="site-navigation">
                <div class="container" style="text-align: center;">
                    <nav class="primary-navigation clearfix" style="display: inline-block;" role="navigation">
                        <a href="#content" class="screen-reader-text skip-link"><?php esc_html_e( 'Skip to content', 'wp-coupon' ); ?></a>
                        <div id="nav-toggle"><i class="content icon"></i></div>
                        <ul class="st-menu">
                           <?php wp_nav_menu( array('theme_location' => 'primary', 'container' => '', 'items_wrap' => '%3$s' ) ); ?>
						   
							<?php
								if ( class_exists( 'WPCoupon_User' ) ) {
									WPCoupon_User::nav();
								}
							?>
						
                        </ul>
                    </nav> <!-- END .primary-navigation -->

                    
                </div> <!-- END .container -->
            </div> <!-- END #primary-navigation -->
						<meta name="verify-admitad" content="d3d4291cc1" />
			<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-136093944-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-136093944-1');
</script>
    	</header><!-- END #masthead -->
        <div id="content" class="site-content">
		
<?php
			