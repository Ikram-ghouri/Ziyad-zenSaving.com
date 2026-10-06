<?php
/**
 * Plugin Name: Zen Saving Headless Bridge
 * Description: REST API, write actions and revalidation webhooks for the Zen Saving Next.js frontend.
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Author: Zen Saving
 * Text Domain: zensaving-headless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class ZS_Headless_Bridge {
	const VERSION = '1.0.0';
	const NS = 'zs/v1';

	public static function boot() {
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
		add_action( 'init', array( __CLASS__, 'register_audience_taxonomy' ), 30 );
		add_action( 'admin_menu', array( __CLASS__, 'settings_page' ) );
		add_action( 'admin_init', array( __CLASS__, 'settings' ) );
		add_action( 'add_meta_boxes_coupon', array( __CLASS__, 'coupon_meta_box' ) );
		add_action( 'save_post_coupon', array( __CLASS__, 'save_coupon_fields' ), 10, 2 );
		add_action( 'coupon_store_add_form_fields', array( __CLASS__, 'store_add_fields' ) );
		add_action( 'coupon_store_edit_form_fields', array( __CLASS__, 'store_edit_fields' ) );
		add_action( 'created_coupon_store', array( __CLASS__, 'save_store_fields' ) );
		add_action( 'edited_coupon_store', array( __CLASS__, 'save_store_fields' ) );
		add_filter( 'rest_pre_serve_request', array( __CLASS__, 'cors' ), 10, 4 );
		add_action( 'save_post_coupon', array( __CLASS__, 'content_changed' ), 20 );
		add_action( 'save_post_post', array( __CLASS__, 'content_changed' ), 20 );
		add_action( 'save_post_page', array( __CLASS__, 'content_changed' ), 20 );
		add_action( 'edited_coupon_store', array( __CLASS__, 'content_changed' ), 20 );
		add_action( 'edited_coupon_category', array( __CLASS__, 'content_changed' ), 20 );
		add_action( 'edited_special_discount_audience', array( __CLASS__, 'content_changed' ), 20 );
		add_action( 'delete_post', array( __CLASS__, 'content_changed' ), 20 );
	}

	public static function routes() {
		$public = array( 'permission_callback' => '__return_true' );
		register_rest_route( self::NS, '/coupons', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'coupons' ) ) ) );
		register_rest_route( self::NS, '/coupons/(?P<id>\d+)', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'coupon' ) ) ) );
		register_rest_route( self::NS, '/stores', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'stores' ) ) ) );
		register_rest_route( self::NS, '/stores/(?P<slug>[a-z0-9-]+)', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'store' ) ) ) );
		register_rest_route( self::NS, '/categories', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'categories' ) ) ) );
		register_rest_route( self::NS, '/categories/(?P<slug>[a-z0-9-]+)', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'category' ) ) ) );
		register_rest_route( self::NS, '/posts', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'posts' ) ) ) );
		register_rest_route( self::NS, '/pages/(?P<slug>[a-z0-9-]+)', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'page' ) ) ) );
		register_rest_route( self::NS, '/home', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'home' ) ) ) );
		register_rest_route( self::NS, '/search', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'search' ) ) ) );
		register_rest_route( self::NS, '/seo', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'seo' ) ) ) );
		register_rest_route( self::NS, '/redirects', array_merge( $public, array( 'methods' => WP_REST_Server::READABLE, 'callback' => array( __CLASS__, 'redirects' ) ) ) );
		register_rest_route( self::NS, '/coupons/(?P<id>\d+)/vote', array( 'methods' => WP_REST_Server::CREATABLE, 'callback' => array( __CLASS__, 'vote' ), 'permission_callback' => array( __CLASS__, 'write_permission' ) ) );
		register_rest_route( self::NS, '/coupons/(?P<id>\d+)/use', array( 'methods' => WP_REST_Server::CREATABLE, 'callback' => array( __CLASS__, 'use_coupon' ), 'permission_callback' => array( __CLASS__, 'write_permission' ) ) );
		register_rest_route( self::NS, '/submit-coupon', array( 'methods' => WP_REST_Server::CREATABLE, 'callback' => array( __CLASS__, 'submit_coupon' ), 'permission_callback' => array( __CLASS__, 'write_permission' ) ) );
	}

	public static function register_audience_taxonomy() {
		if ( taxonomy_exists( 'special_discount_audience' ) ) {
			return;
		}
		register_taxonomy( 'special_discount_audience', array( 'coupon' ), array(
			'labels' => array( 'name' => 'Special Discount Audiences', 'singular_name' => 'Special Discount Audience' ),
			'public' => true,
			'show_ui' => true,
			'show_admin_column' => true,
			'show_in_rest' => false,
			'hierarchical' => false,
			'rewrite' => array( 'slug' => 'discounts' ),
		) );
	}

	public static function coupons( WP_REST_Request $request ) {
		$key = self::cache_key( 'coupons', $request->get_params() );
		$cached = get_transient( $key );
		if ( false !== $cached ) {
			return rest_ensure_response( $cached );
		}
		$page = max( 1, absint( $request->get_param( 'page' ) ) );
		$per_page = min( 100, max( 1, absint( $request->get_param( 'per_page' ) ?: 20 ) ) );
		$args = array( 'post_type' => 'coupon', 'post_status' => 'publish', 'paged' => $page, 'posts_per_page' => $per_page, 'ignore_sticky_posts' => true );
		$tax_query = array();
		foreach ( array( 'store' => 'coupon_store', 'category' => 'coupon_category', 'tag' => 'coupon_tag', 'audience' => 'special_discount_audience' ) as $param => $taxonomy ) {
			$value = sanitize_title( (string) $request->get_param( $param ) );
			if ( $value ) {
				$tax_query[] = array( 'taxonomy' => $taxonomy, 'field' => 'slug', 'terms' => $value );
			}
		}
		if ( $tax_query ) {
			$args['tax_query'] = $tax_query;
		}
		$meta_query = array();
		$type = sanitize_key( (string) $request->get_param( 'type' ) );
		if ( in_array( $type, array( 'code', 'sale', 'print' ), true ) ) {
			$meta_query[] = array( 'key' => '_wpc_coupon_type', 'value' => $type );
		}
		if ( rest_sanitize_boolean( $request->get_param( 'featured' ) ) ) {
			$meta_query[] = array( 'key' => '_wpc_is_featured', 'value' => array( '1', 'on', 'yes' ), 'compare' => 'IN' );
		}
		if ( rest_sanitize_boolean( $request->get_param( 'exclusive' ) ) ) {
			$meta_query[] = array( 'key' => '_wpc_exclusive', 'value' => array( '1', 'on', 'yes' ), 'compare' => 'IN' );
		}
		if ( rest_sanitize_boolean( $request->get_param( 'active_only' ) ) ) {
			$meta_query[] = array( 'relation' => 'OR', array( 'key' => '_wpc_expires', 'compare' => 'NOT EXISTS' ), array( 'key' => '_wpc_expires', 'value' => '', 'compare' => '=' ), array( 'key' => '_wpc_expires', 'value' => current_time( 'timestamp' ), 'compare' => '>=', 'type' => 'NUMERIC' ) );
		}
		if ( $meta_query ) {
			$args['meta_query'] = $meta_query;
		}
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		if ( $search ) {
			$args['s'] = $search;
		}
		$sort = sanitize_key( (string) $request->get_param( 'sort' ) );
		if ( 'popular' === $sort ) {
			$args['meta_key'] = '_wpc_used'; $args['orderby'] = 'meta_value_num'; $args['order'] = 'DESC';
		} elseif ( 'expiring' === $sort ) {
			$args['meta_key'] = '_wpc_expires'; $args['orderby'] = 'meta_value_num'; $args['order'] = 'ASC';
		} else {
			$args['orderby'] = 'date'; $args['order'] = 'DESC';
		}
		$query = new WP_Query( $args );
		$items = array_map( array( __CLASS__, 'normalize_coupon' ), $query->posts );
		$response = array( 'items' => $items, 'page' => $page, 'per_page' => $per_page, 'total' => (int) $query->found_posts, 'total_pages' => (int) $query->max_num_pages );
		set_transient( $key, $response, 5 * MINUTE_IN_SECONDS );
		return rest_ensure_response( $response );
	}

	public static function coupon( WP_REST_Request $request ) {
		$post = get_post( absint( $request['id'] ) );
		if ( ! $post || 'coupon' !== $post->post_type || 'publish' !== $post->post_status ) {
			return new WP_Error( 'zs_not_found', 'Coupon not found.', array( 'status' => 404 ) );
		}
		return rest_ensure_response( self::normalize_coupon( $post ) );
	}

	public static function stores( WP_REST_Request $request ) {
		$args = array( 'taxonomy' => 'coupon_store', 'hide_empty' => false, 'number' => min( 500, max( 1, absint( $request->get_param( 'per_page' ) ?: 100 ) ) ), 'orderby' => 'name', 'order' => 'ASC' );
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		if ( $search ) { $args['search'] = $search; }
		$terms = get_terms( $args );
		if ( is_wp_error( $terms ) ) { return $terms; }
		return rest_ensure_response( array( 'items' => array_map( array( __CLASS__, 'normalize_store' ), $terms ), 'total' => count( $terms ) ) );
	}

	public static function store( WP_REST_Request $request ) {
		$term = get_term_by( 'slug', sanitize_title( $request['slug'] ), 'coupon_store' );
		if ( ! $term ) { return new WP_Error( 'zs_not_found', 'Store not found.', array( 'status' => 404 ) ); }
		$store = self::normalize_store( $term );
		$active_request = new WP_REST_Request( 'GET' );
		$active_request->set_param( 'store', $term->slug ); $active_request->set_param( 'active_only', true ); $active_request->set_param( 'per_page', 100 );
		$active = self::coupons( $active_request )->get_data();
		$store['coupons'] = $active['items'];
		return rest_ensure_response( $store );
	}

	public static function categories() {
		$terms = get_terms( array( 'taxonomy' => 'coupon_category', 'hide_empty' => false, 'orderby' => 'name' ) );
		if ( is_wp_error( $terms ) ) { return $terms; }
		return rest_ensure_response( array_map( function( $term ) { return array( 'id' => (int) $term->term_id, 'slug' => $term->slug, 'name' => $term->name, 'count' => (int) $term->count, 'icon' => get_term_meta( $term->term_id, '_wpc_icon', true ), 'image' => get_term_meta( $term->term_id, '_wpc_cat_image', true ) ); }, $terms ) );
	}

	public static function category( WP_REST_Request $request ) {
		$term = get_term_by( 'slug', sanitize_title( $request['slug'] ), 'coupon_category' );
		if ( ! $term ) { return new WP_Error( 'zs_not_found', 'Category not found.', array( 'status' => 404 ) ); }
		$coupon_request = new WP_REST_Request( 'GET' ); $coupon_request->set_param( 'category', $term->slug ); $coupon_request->set_param( 'active_only', true ); $coupon_request->set_param( 'per_page', 100 );
		return rest_ensure_response( array( 'id' => (int) $term->term_id, 'slug' => $term->slug, 'name' => $term->name, 'description' => wp_kses_post( $term->description ), 'coupons' => self::coupons( $coupon_request )->get_data()['items'] ) );
	}

	public static function posts( WP_REST_Request $request ) {
		$query = new WP_Query( array( 'post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => min( 100, max( 1, absint( $request->get_param( 'per_page' ) ?: 20 ) ) ), 'paged' => max( 1, absint( $request->get_param( 'page' ) ) ), 's' => sanitize_text_field( (string) $request->get_param( 'search' ) ) ) );
		$items = array_map( function( $post ) { $categories = get_the_category( $post->ID ); return array( 'id' => (int) $post->ID, 'slug' => $post->post_name, 'title' => get_the_title( $post ), 'excerpt' => wp_strip_all_tags( get_the_excerpt( $post ) ), 'content' => apply_filters( 'the_content', $post->post_content ), 'category' => $categories ? $categories[0]->name : 'Guides', 'date' => get_the_date( DATE_W3C, $post ) ); }, $query->posts );
		return rest_ensure_response( array( 'items' => $items, 'total' => (int) $query->found_posts ) );
	}

	public static function page( WP_REST_Request $request ) {
		$posts = get_posts( array( 'post_type' => 'page', 'post_status' => 'publish', 'name' => sanitize_title( $request['slug'] ), 'posts_per_page' => 1 ) );
		if ( ! $posts ) { return new WP_Error( 'zs_not_found', 'Page not found.', array( 'status' => 404 ) ); }
		$post = $posts[0];
		return rest_ensure_response( array( 'id' => (int) $post->ID, 'slug' => $post->post_name, 'title' => get_the_title( $post ), 'excerpt' => wp_strip_all_tags( get_the_excerpt( $post ) ), 'content' => apply_filters( 'the_content', $post->post_content ), 'date' => get_the_modified_date( DATE_W3C, $post ) ) );
	}

	public static function home() {
		$stores_request = new WP_REST_Request( 'GET' ); $stores_request->set_param( 'per_page', 12 );
		$coupons_request = new WP_REST_Request( 'GET' ); $coupons_request->set_param( 'per_page', 24 ); $coupons_request->set_param( 'active_only', true );
		$posts_request = new WP_REST_Request( 'GET' ); $posts_request->set_param( 'per_page', 6 );
		return rest_ensure_response( array( 'stores' => self::stores( $stores_request )->get_data()['items'], 'coupons' => self::coupons( $coupons_request )->get_data()['items'], 'posts' => self::posts( $posts_request )->get_data()['items'], 'categories' => self::categories()->get_data() ) );
	}

	public static function search( WP_REST_Request $request ) {
		$q = sanitize_text_field( (string) $request->get_param( 'q' ) );
		if ( strlen( $q ) < 2 ) { return rest_ensure_response( array( 'stores' => array(), 'coupons' => array(), 'posts' => array() ) ); }
		$store_request = new WP_REST_Request( 'GET' ); $store_request->set_param( 'search', $q ); $store_request->set_param( 'per_page', 10 );
		$coupon_request = new WP_REST_Request( 'GET' ); $coupon_request->set_param( 'search', $q ); $coupon_request->set_param( 'active_only', true ); $coupon_request->set_param( 'per_page', 10 );
		$post_request = new WP_REST_Request( 'GET' ); $post_request->set_param( 'search', $q ); $post_request->set_param( 'per_page', 10 );
		return rest_ensure_response( array( 'stores' => self::stores( $store_request )->get_data()['items'], 'coupons' => self::coupons( $coupon_request )->get_data()['items'], 'posts' => self::posts( $post_request )->get_data()['items'] ) );
	}

	public static function seo( WP_REST_Request $request ) {
		$path = '/' . ltrim( sanitize_text_field( (string) $request->get_param( 'path' ) ), '/' );
		$url = home_url( $path );
		$id = url_to_postid( $url );
		$title = $id ? get_the_title( $id ) : get_bloginfo( 'name' );
		$description = $id ? get_post_meta( $id, '_yoast_wpseo_metadesc', true ) : get_bloginfo( 'description' );
		$yoast_title = $id ? get_post_meta( $id, '_yoast_wpseo_title', true ) : '';
		return rest_ensure_response( array( 'title' => $yoast_title ?: $title, 'description' => $description ?: ( $id ? wp_strip_all_tags( get_the_excerpt( $id ) ) : get_bloginfo( 'description' ) ), 'canonical' => $url, 'open_graph' => array( 'title' => $title, 'description' => $description, 'url' => $url ) ) );
	}

	public static function redirects() {
		$store_slug = self::theme_option( 'rewrite_store_slug', 'store' );
		$category_slug = self::theme_option( 'rewrite_category_slug', 'coupon-category' );
		$tag_slug = self::theme_option( 'rewrite_tag_slug', 'coupon-tag' );
		return rest_ensure_response( array( array( 'source' => '/' . $store_slug . '/:slug', 'destination' => '/store/:slug', 'permanent' => true ), array( 'source' => '/' . $category_slug . '/:slug', 'destination' => '/coupon-category/:slug', 'permanent' => true ), array( 'source' => '/' . $tag_slug . '/:slug', 'destination' => '/coupon-tag/:slug', 'permanent' => true ) ) );
	}

	public static function vote( WP_REST_Request $request ) {
		if ( ! self::rate_limit( 'vote', 30 ) ) { return new WP_Error( 'zs_rate_limited', 'Too many requests.', array( 'status' => 429 ) ); }
		$id = absint( $request['id'] ); $direction = sanitize_key( (string) $request->get_param( 'direction' ) );
		if ( ! in_array( $direction, array( 'up', 'down' ), true ) ) { return new WP_Error( 'zs_invalid_vote', 'Invalid vote.', array( 'status' => 400 ) ); }
		$key = 'up' === $direction ? '_wpc_vote_up' : '_wpc_vote_down'; update_post_meta( $id, $key, absint( get_post_meta( $id, $key, true ) ) + 1 ); self::bump_cache();
		return rest_ensure_response( array( 'success' => true ) );
	}

	public static function use_coupon( WP_REST_Request $request ) {
		if ( ! self::rate_limit( 'use', 60 ) ) { return new WP_Error( 'zs_rate_limited', 'Too many requests.', array( 'status' => 429 ) ); }
		$id = absint( $request['id'] );
		foreach ( array( '_wpc_used', '_wpc_views' ) as $key ) { update_post_meta( $id, $key, absint( get_post_meta( $id, $key, true ) ) + 1 ); }
		self::bump_cache(); return rest_ensure_response( array( 'success' => true ) );
	}

	public static function submit_coupon( WP_REST_Request $request ) {
		if ( ! self::rate_limit( 'submit', 5 ) ) { return new WP_Error( 'zs_rate_limited', 'Too many submissions.', array( 'status' => 429 ) ); }
		if ( $request->get_param( 'website' ) ) { return rest_ensure_response( array( 'message' => 'Thanks. Your coupon was received.' ) ); }
		$title = sanitize_text_field( (string) $request->get_param( 'title' ) ); $store = sanitize_text_field( (string) $request->get_param( 'store' ) );
		if ( ! $title || ! $store ) { return new WP_Error( 'zs_missing_fields', 'Store and offer title are required.', array( 'status' => 400 ) ); }
		$id = wp_insert_post( array( 'post_type' => 'coupon', 'post_status' => 'pending', 'post_title' => $title, 'post_content' => wp_kses_post( (string) $request->get_param( 'description' ) ) ), true );
		if ( is_wp_error( $id ) ) { return $id; }
		update_post_meta( $id, '_wpc_coupon_type', $request->get_param( 'code' ) ? 'code' : 'sale' ); update_post_meta( $id, '_wpc_coupon_type_code', sanitize_text_field( (string) $request->get_param( 'code' ) ) ); update_post_meta( $id, '_wpc_destination_url', esc_url_raw( (string) $request->get_param( 'url' ) ) );
		$term = term_exists( $store, 'coupon_store' ); if ( $term ) { wp_set_object_terms( $id, (int) ( is_array( $term ) ? $term['term_id'] : $term ), 'coupon_store' ); }
		return new WP_REST_Response( array( 'message' => 'Thanks. Your coupon is awaiting review.', 'id' => (int) $id ), 201 );
	}

	public static function normalize_coupon( $post ) {
		$post = get_post( $post ); $id = (int) $post->ID; $type = get_post_meta( $id, '_wpc_coupon_type', true ) ?: 'code'; $expires_raw = get_post_meta( $id, '_wpc_expires', true ); $expires_ts = is_numeric( $expires_raw ) ? (int) $expires_raw : ( $expires_raw ? strtotime( $expires_raw ) : 0 );
		$stores = wp_get_post_terms( $id, 'coupon_store' ); $store = ( ! is_wp_error( $stores ) && $stores ) ? self::normalize_store( $stores[0] ) : array( 'id' => 0, 'slug' => 'unknown', 'name' => 'Store', 'category' => 'Shopping', 'description' => '', 'audiences' => array() );
		$categories = wp_get_post_terms( $id, 'coupon_category', array( 'fields' => 'names' ) ); if ( is_wp_error( $categories ) ) { $categories = array(); }
		$title = get_the_title( $post ); $save = get_post_meta( $id, '_wpc_coupon_save', true ); $discount = self::discount_text( $save ?: $title ); $up = absint( get_post_meta( $id, '_wpc_vote_up', true ) ); $down = absint( get_post_meta( $id, '_wpc_vote_down', true ) ); $percent = absint( get_post_meta( $id, '_wpc_percent_success', true ) ); if ( ! $percent && ( $up + $down ) ) { $percent = (int) round( $up * 100 / ( $up + $down ) ); }
		return array( 'id' => $id, 'slug' => $post->post_name, 'title' => $title, 'description' => wp_strip_all_tags( $post->post_excerpt ?: wp_trim_words( $post->post_content, 35 ) ), 'content' => apply_filters( 'the_content', $post->post_content ), 'type' => in_array( $type, array( 'code', 'sale', 'print' ), true ) ? $type : 'code', 'code' => sanitize_text_field( get_post_meta( $id, '_wpc_coupon_type_code', true ) ), 'discount' => $discount, 'expires' => $expires_ts ? gmdate( DATE_W3C, $expires_ts ) : '', 'is_expired' => $expires_ts ? current_time( 'timestamp' ) > $expires_ts : false, 'free_shipping' => self::truthy( get_post_meta( $id, '_wpc_free_shipping', true ) ), 'exclusive' => self::truthy( get_post_meta( $id, '_wpc_exclusive', true ) ), 'used' => absint( get_post_meta( $id, '_wpc_used', true ) ), 'percent_success' => $percent ?: 100, 'votes' => array( 'up' => $up, 'down' => $down ), 'store' => $store, 'categories' => array_values( $categories ), 'go_url' => trailingslashit( home_url() ) . self::theme_option( 'go_out_slug', 'out' ) . '/' . $id, 'verified' => self::truthy( get_post_meta( $id, '_zs_verified', true ) ) );
	}

	public static function normalize_store( $term ) {
		$term = get_term( $term, 'coupon_store' ); $image_id = absint( get_term_meta( $term->term_id, '_wpc_store_image_id', true ) ); $logo = $image_id ? wp_get_attachment_image_url( $image_id, 'medium' ) : get_term_meta( $term->term_id, '_wpc_store_image', true ); $audiences = get_term_meta( $term->term_id, '_zs_audiences', true );
		return array( 'id' => (int) $term->term_id, 'slug' => $term->slug, 'name' => $term->name, 'logo' => esc_url_raw( $logo ), 'category' => 'Shopping', 'description' => wp_strip_all_tags( $term->description ?: get_term_meta( $term->term_id, '_wpc_store_heading', true ) ), 'rating' => (float) ( get_term_meta( $term->term_id, '_zs_rating', true ) ?: 0 ), 'review' => wp_kses_post( get_term_meta( $term->term_id, '_zs_review', true ) ), 'pros' => array_filter( array_map( 'trim', explode( "\n", (string) get_term_meta( $term->term_id, '_zs_pros', true ) ) ) ), 'cons' => array_filter( array_map( 'trim', explode( "\n", (string) get_term_meta( $term->term_id, '_zs_cons', true ) ) ) ), 'audiences' => is_array( $audiences ) ? array_values( array_map( 'sanitize_title', $audiences ) ) : array() );
	}

	public static function write_permission( WP_REST_Request $request ) {
		$expected = (string) get_option( 'zs_write_token', '' ); $provided = (string) $request->get_header( 'x-zs-token' );
		return $expected && $provided && hash_equals( $expected, $provided );
	}

	private static function rate_limit( $action, $limit ) {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown'; $key = 'zs_rate_' . md5( $action . '|' . $ip ); $count = absint( get_transient( $key ) ); if ( $count >= $limit ) { return false; } set_transient( $key, $count + 1, HOUR_IN_SECONDS ); return true;
	}

	private static function discount_text( $text ) {
		if ( preg_match( '/(?:up\s+to\s+)?\d+%\s*off/i', $text, $match ) ) { return strtoupper( $match[0] ); }
		if ( preg_match( '/\$\d+(?:\.\d{1,2})?\s*off/i', $text, $match ) ) { return strtoupper( $match[0] ); }
		if ( false !== stripos( $text, 'free shipping' ) ) { return 'FREE SHIPPING'; }
		return 'SPECIAL OFFER';
	}

	private static function truthy( $value ) { return in_array( strtolower( (string) $value ), array( '1', 'yes', 'true', 'on' ), true ); }
	private static function theme_option( $key, $default ) { return function_exists( 'wpcoupon_get_option' ) ? ( wpcoupon_get_option( $key, $default ) ?: $default ) : $default; }
	private static function cache_key( $name, $params ) { return 'zs_' . md5( $name . '|' . wp_json_encode( $params ) . '|' . get_option( 'zs_cache_version', 1 ) ); }
	private static function bump_cache() { update_option( 'zs_cache_version', (int) get_option( 'zs_cache_version', 1 ) + 1, false ); }

	public static function cors( $served, $result, $request ) {
		if ( 0 !== strpos( $request->get_route(), '/' . self::NS . '/' ) ) { return $served; }
		$origin = get_http_origin(); $origins = array_filter( array_map( 'trim', explode( "\n", (string) get_option( 'zs_frontend_origins', '' ) ) ) );
		if ( $origin && in_array( $origin, $origins, true ) ) { header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) ); header( 'Vary: Origin' ); header( 'Access-Control-Allow-Headers: Content-Type, X-ZS-Token' ); header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' ); }
		return $served;
	}

	public static function content_changed() {
		self::bump_cache(); $url = esc_url_raw( (string) get_option( 'zs_revalidate_url', '' ) ); $secret = (string) get_option( 'zs_revalidate_secret', '' );
		if ( $url && $secret ) { wp_remote_post( $url, array( 'timeout' => 3, 'blocking' => false, 'headers' => array( 'x-revalidate-secret' => $secret, 'Content-Type' => 'application/json' ), 'body' => wp_json_encode( array( 'tag' => 'wordpress' ) ) ) ); }
	}

	public static function settings() {
		register_setting( 'zs_headless', 'zs_frontend_origins', array( 'sanitize_callback' => 'sanitize_textarea_field' ) ); register_setting( 'zs_headless', 'zs_revalidate_url', array( 'sanitize_callback' => 'esc_url_raw' ) ); register_setting( 'zs_headless', 'zs_revalidate_secret', array( 'sanitize_callback' => 'sanitize_text_field' ) ); register_setting( 'zs_headless', 'zs_write_token', array( 'sanitize_callback' => 'sanitize_text_field' ) );
	}

	public static function coupon_meta_box() {
		add_meta_box( 'zs_coupon_verification', 'Zen Saving Verification', array( __CLASS__, 'render_coupon_meta_box' ), 'coupon', 'side', 'default' );
	}

	public static function render_coupon_meta_box( $post ) {
		wp_nonce_field( 'zs_save_coupon', 'zs_coupon_nonce' );
		$verified = self::truthy( get_post_meta( $post->ID, '_zs_verified', true ) );
		$date = get_post_meta( $post->ID, '_zs_last_verified', true );
		?><p><label><input type="checkbox" name="zs_verified" value="1" <?php checked( $verified ); ?>> Verified offer</label></p><p><label for="zs_last_verified">Last verified</label><br><input class="widefat" type="date" id="zs_last_verified" name="zs_last_verified" value="<?php echo esc_attr( $date ); ?>"></p><?php
	}

	public static function save_coupon_fields( $post_id, $post ) {
		if ( ! isset( $_POST['zs_coupon_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['zs_coupon_nonce'] ) ), 'zs_save_coupon' ) || ! current_user_can( 'edit_post', $post_id ) || wp_is_post_revision( $post_id ) ) { return; }
		update_post_meta( $post_id, '_zs_verified', isset( $_POST['zs_verified'] ) ? '1' : '0' );
		$date = isset( $_POST['zs_last_verified'] ) ? sanitize_text_field( wp_unslash( $_POST['zs_last_verified'] ) ) : '';
		update_post_meta( $post_id, '_zs_last_verified', preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ? $date : '' );
	}

	private static function audience_options() {
		return array( 'student' => 'Student', 'teacher' => 'Teacher', 'military' => 'Military', 'senior' => 'Senior', 'nurse' => 'Nurse', 'healthcare' => 'Healthcare', 'first-responder' => 'First Responder', 'birthday' => 'Birthday', 'credit-card' => 'Credit Card', 'gift-card' => 'Gift Card' );
	}

	public static function store_add_fields() {
		wp_nonce_field( 'zs_save_store', 'zs_store_nonce' );
		?><div class="form-field"><label for="zs_rating">Rating</label><input type="number" min="0" max="5" step="0.1" id="zs_rating" name="zs_rating"></div><div class="form-field"><label for="zs_review">Review</label><textarea id="zs_review" name="zs_review" rows="5"></textarea></div><div class="form-field"><label for="zs_pros">Pros</label><textarea id="zs_pros" name="zs_pros" rows="4"></textarea><p>One item per line.</p></div><div class="form-field"><label for="zs_cons">Cons</label><textarea id="zs_cons" name="zs_cons" rows="4"></textarea><p>One item per line.</p></div><div class="form-field"><label>Special discount audiences</label><?php foreach ( self::audience_options() as $value => $label ) : ?><label><input type="checkbox" name="zs_audiences[]" value="<?php echo esc_attr( $value ); ?>"> <?php echo esc_html( $label ); ?></label><br><?php endforeach; ?></div><?php
	}

	public static function store_edit_fields( $term ) {
		wp_nonce_field( 'zs_save_store', 'zs_store_nonce' ); $audiences = get_term_meta( $term->term_id, '_zs_audiences', true ); if ( ! is_array( $audiences ) ) { $audiences = array(); }
		?><tr class="form-field"><th><label for="zs_rating">Rating</label></th><td><input type="number" min="0" max="5" step="0.1" id="zs_rating" name="zs_rating" value="<?php echo esc_attr( get_term_meta( $term->term_id, '_zs_rating', true ) ); ?>"></td></tr><tr class="form-field"><th><label for="zs_review">Review</label></th><td><textarea id="zs_review" name="zs_review" rows="5"><?php echo esc_textarea( get_term_meta( $term->term_id, '_zs_review', true ) ); ?></textarea></td></tr><tr class="form-field"><th><label for="zs_pros">Pros</label></th><td><textarea id="zs_pros" name="zs_pros" rows="4"><?php echo esc_textarea( get_term_meta( $term->term_id, '_zs_pros', true ) ); ?></textarea><p class="description">One item per line.</p></td></tr><tr class="form-field"><th><label for="zs_cons">Cons</label></th><td><textarea id="zs_cons" name="zs_cons" rows="4"><?php echo esc_textarea( get_term_meta( $term->term_id, '_zs_cons', true ) ); ?></textarea><p class="description">One item per line.</p></td></tr><tr class="form-field"><th>Special discount audiences</th><td><?php foreach ( self::audience_options() as $value => $label ) : ?><label><input type="checkbox" name="zs_audiences[]" value="<?php echo esc_attr( $value ); ?>" <?php checked( in_array( $value, $audiences, true ) ); ?>> <?php echo esc_html( $label ); ?></label><br><?php endforeach; ?></td></tr><?php
	}

	public static function save_store_fields( $term_id ) {
		if ( ! isset( $_POST['zs_store_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['zs_store_nonce'] ) ), 'zs_save_store' ) || ! current_user_can( 'manage_categories' ) ) { return; }
		$rating = isset( $_POST['zs_rating'] ) ? min( 5, max( 0, (float) $_POST['zs_rating'] ) ) : 0; update_term_meta( $term_id, '_zs_rating', $rating );
		foreach ( array( 'review', 'pros', 'cons' ) as $field ) { $value = isset( $_POST[ 'zs_' . $field ] ) ? sanitize_textarea_field( wp_unslash( $_POST[ 'zs_' . $field ] ) ) : ''; update_term_meta( $term_id, '_zs_' . $field, $value ); }
		$audiences = isset( $_POST['zs_audiences'] ) && is_array( $_POST['zs_audiences'] ) ? array_values( array_intersect( array_keys( self::audience_options() ), array_map( 'sanitize_title', wp_unslash( $_POST['zs_audiences'] ) ) ) ) : array(); update_term_meta( $term_id, '_zs_audiences', $audiences );
	}

	public static function settings_page() { add_options_page( 'Zen Saving Headless', 'Zen Saving Headless', 'manage_options', 'zs-headless', array( __CLASS__, 'render_settings' ) ); }
	public static function render_settings() { if ( ! current_user_can( 'manage_options' ) ) { return; } ?>
		<div class="wrap"><h1>Zen Saving Headless</h1><form method="post" action="options.php"><?php settings_fields( 'zs_headless' ); ?><table class="form-table"><tr><th><label for="zs_frontend_origins">Frontend origins</label></th><td><textarea class="large-text" rows="4" id="zs_frontend_origins" name="zs_frontend_origins"><?php echo esc_textarea( get_option( 'zs_frontend_origins', '' ) ); ?></textarea><p class="description">One exact origin per line, for example https://new.zensaving.com</p></td></tr><tr><th><label for="zs_revalidate_url">Revalidation URL</label></th><td><input class="regular-text" type="url" id="zs_revalidate_url" name="zs_revalidate_url" value="<?php echo esc_attr( get_option( 'zs_revalidate_url', '' ) ); ?>"></td></tr><tr><th><label for="zs_revalidate_secret">Revalidation secret</label></th><td><input class="regular-text" type="password" id="zs_revalidate_secret" name="zs_revalidate_secret" value="<?php echo esc_attr( get_option( 'zs_revalidate_secret', '' ) ); ?>"></td></tr><tr><th><label for="zs_write_token">Write token</label></th><td><input class="regular-text" type="password" id="zs_write_token" name="zs_write_token" value="<?php echo esc_attr( get_option( 'zs_write_token', '' ) ); ?>"></td></tr></table><?php submit_button(); ?></form></div>
	<?php }
}

ZS_Headless_Bridge::boot();
