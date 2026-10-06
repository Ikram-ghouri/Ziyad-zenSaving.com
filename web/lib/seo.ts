import type { Metadata } from 'next';

export const seoKeywords = {
  home: ['coupon codes','promo codes','online deals','discount codes','verified coupons','free shipping deals'],
  stores: ['coupon stores','stores with promo codes','brand coupon codes','all coupon stores'],
  deals: ['best online deals','top coupon codes','today deals','verified promo codes','free shipping coupons'],
  discounts: ['special discounts','student discounts','teacher discounts','military discounts','senior discounts','healthcare discounts'],
  blog: ['money saving tips','shopping guides','product reviews','how to save money online','coupon tips'],
};

export function pageMetadata({title,description,path,keywords,noindex=false}:{title:string;description:string;path:string;keywords:string[];noindex?:boolean}):Metadata {
  return {
    title,
    description,
    keywords,
    alternates:{canonical:path},
    openGraph:{title,description,url:path,type:'website'},
    robots:noindex?{index:false,follow:true}:undefined,
  };
}
