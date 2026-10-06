import type { Metadata } from 'next';
import { CouponList } from '@/components/interactive';
import { demo,getCatalog } from '@/lib/data';
import { pageMetadata,seoKeywords } from '@/lib/seo';
export const metadata:Metadata=pageMetadata({title:'Top Coupon Codes & Online Deals',description:'Browse today’s top coupon codes, online deals and free shipping offers from popular stores.',path:'/deals',keywords:seoKeywords.deals});
export default async function Deals(){const {coupons}=await getCatalog();return <><section className="page-hero"><span className="eyebrow">Fresh savings</span><h1>Top coupons & deals</h1><p>Browse active offers, coupon codes and free shipping deals from popular stores.</p></section><div className="content-wrap"><CouponList coupons={coupons.filter(c=>!c.is_expired)} demo={demo}/></div></>}
