import Link from 'next/link';
import { getCatalog } from '@/lib/data';
import { pageMetadata,seoKeywords } from '@/lib/seo';
export const metadata=pageMetadata({title:'Money-Saving Guides & Reviews',description:'Read practical money-saving tips, shopping guides, reviews and coupon advice from Zen Saving.',path:'/blog',keywords:seoKeywords.blog});
export default async function Blog(){const {posts}=await getCatalog();return <><section className="page-hero"><span className="eyebrow">The Zen edit</span><h1>Guides, reviews & good ideas</h1><p>Clear, practical advice for choosing well, spending thoughtfully and spotting a deal worth using.</p></section><div className="content-wrap post-list">{posts.map(p=><Link className="post-card" href={`/blog/${p.slug}`} key={p.id}><span>{p.category}</span><h2>{p.title}</h2><p>{p.excerpt}</p><small>Read guide →</small></Link>)}</div></>}
