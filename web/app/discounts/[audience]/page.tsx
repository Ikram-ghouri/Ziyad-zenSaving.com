import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CouponList } from '@/components/interactive';
import { demo,getCatalog } from '@/lib/data';
import { audiences,label } from '@/lib/types';

export async function generateMetadata({params}:{params:Promise<{audience:string}>}):Promise<Metadata>{const {audience}=await params;const name=label(audience);const title=`${name} Discounts & Coupon Codes`;const description=`Find ${name.toLowerCase()} discounts, coupon codes and verified offers from popular stores.`;return {title,description,keywords:[`${name} discounts`,`${name} coupon codes`,`stores with ${name.toLowerCase()} discounts`,`verified ${name.toLowerCase()} offers`],alternates:{canonical:`/discounts/${audience}`},openGraph:{title,description,url:`/discounts/${audience}`,type:'website'}};}
export default async function Audience({params}:{params:Promise<{audience:string}>}){const {audience}=await params;if(!audiences.includes(audience))notFound();const data=await getCatalog();const stores=data.stores.filter(s=>s.audiences.includes(audience));const coupons=data.coupons.filter(c=>stores.some(s=>s.id===c.store.id));return <><section className="page-hero"><span className="eyebrow">Savings made for you</span><h1>{label(audience)} Discounts</h1><p>Explore stores offering savings for {label(audience).toLowerCase()} shoppers. Eligibility and retailer terms may apply.</p></section><div className="content-wrap"><CouponList coupons={coupons} demo={demo}/></div></>}
