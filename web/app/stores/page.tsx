import type { Metadata } from 'next';
import { StoreIndex } from '@/components/interactive';
import { getCatalog } from '@/lib/data';
import { pageMetadata, seoKeywords } from '@/lib/seo';
export const metadata: Metadata = pageMetadata({title:'All Coupon Stores',description:'Browse Zen Saving’s A–Z directory of stores with coupon codes, promo codes and online deals.',path:'/stores',keywords:seoKeywords.stores});
export default async function Stores() { const { stores } = await getCatalog(); return <><section className="page-hero"><span className="eyebrow">A–Z directory</span><h1>Explore all stores</h1><p>Search our store directory and find the latest available coupon codes and online deals.</p></section><div className="content-wrap"><StoreIndex stores={stores} /></div></> }
