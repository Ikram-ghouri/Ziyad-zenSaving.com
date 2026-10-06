import type { Metadata } from 'next';
import { CouponList } from '@/components/interactive';
import { demo,getCatalog } from '@/lib/data';
import { label } from '@/lib/types';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const name=label(slug);const title=`${name} Coupons, Promo Codes & Deals`;const description=`Browse current ${name.toLowerCase()} coupon codes, promo codes and online deals from popular stores.`;return {title,description,keywords:[`${name} coupons`,`${name} promo codes`,`${name} deals`,`${name} discounts`],alternates:{canonical:`/coupon-category/${slug}`},openGraph:{title,description,url:`/coupon-category/${slug}`,type:'website'}};}
export default async function Category({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const data=await getCatalog();const name=label(slug);const coupons=data.coupons.filter(c=>c.categories.some(x=>x.toLowerCase().replaceAll(' ','-')===slug));return <><section className="page-hero"><span className="eyebrow">Shop and save</span><h1>{name} Coupons & Deals</h1><p>Browse current {name.toLowerCase()} offers from popular stores.</p></section><div className="content-wrap"><CouponList coupons={coupons} demo={demo}/></div></>}
