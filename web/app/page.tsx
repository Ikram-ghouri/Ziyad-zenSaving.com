import Link from 'next/link';
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { CouponCard, SearchBox } from '@/components/interactive';
import { demo, getCatalog } from '@/lib/data';
import { audiences, label } from '@/lib/types';

export default async function Home() {
  const data = await getCatalog();
  const top = [...data.coupons].sort((a,b)=>parseInt(b.discount)-parseInt(a.discount)).slice(0,6);
  return <>
    {demo&&<div className="demo-banner">Preview mode · Offers shown here are sample content</div>}
    <section className="hero"><div className="hero-copy"><span className="kicker"><Sparkles size={16}/> Smarter savings start here</span><h1>Good finds.<br/><em>Better prices.</em></h1><p>Fresh coupon codes, trusted offers and practical advice—everything you need to spend a little less.</p><SearchBox large/><div className="trust-row"><span><BadgeCheck/>Offers checked regularly</span><span><ShieldCheck/>Free to use</span><span><Clock3/>Updated daily</span></div></div><div className="hero-art" aria-hidden="true"><div className="sun"></div><div className="receipt"><span>YOUR SAVINGS</span><strong>− $38.50</strong><small>A small win worth smiling about.</small></div><div className="ticket t1">20%<small>OFF</small></div><div className="ticket t2">FREE<small>SHIPPING</small></div></div></section>
    <section className="section"><div className="section-head"><div><span className="eyebrow">Popular right now</span><h2>Stores shoppers love</h2></div><Link href="/stores">Explore all stores <ArrowRight size={17}/></Link></div><div className="logo-row">{data.stores.slice(0,8).map(s=><Link href={`/store/${s.slug}`} key={s.id}><span className="logo-mark">{s.name.slice(0,2).toUpperCase()}</span><strong>{s.name}</strong></Link>)}</div></section>
    <section className="section soft"><div className="section-head"><div><span className="eyebrow">Handpicked for you</span><h2>Today’s top offers</h2><p>Popular savings from stores people are shopping now.</p></div><Link href="/deals">See all deals <ArrowRight size={17}/></Link></div><div className="coupon-grid">{top.map(c=><CouponCard key={c.id} coupon={c} demo={demo}/>)}</div></section>
    <section className="section"><div className="section-head"><div><span className="eyebrow">Savings for you</span><h2>Discounts that meet you where you are</h2></div><Link href="/discounts">View all <ArrowRight size={17}/></Link></div><div className="audience-grid">{audiences.slice(0,8).map((a,i)=><Link href={`/discounts/${a}`} key={a}><span>{['🎓','🍎','🎖️','🌿','🩺','💙','🚒','🎂'][i]}</span><strong>{label(a)}</strong><small>discounts</small><ArrowRight size={16}/></Link>)}</div></section>
    <section className="section story"><div className="story-copy"><span className="eyebrow">Spend well</span><h2>Smart shopping is a habit. We make it easier.</h2><p>Our guides bring honest, useful advice together with the latest offers—so you can choose the deal that actually fits.</p><Link className="primary-link" href="/blog">Read our guides <ArrowRight size={17}/></Link></div><div className="article-grid">{data.posts.map(p=><Link href={`/blog/${p.slug}`} key={p.id}><span>{p.category}</span><h3>{p.title}</h3><p>{p.excerpt}</p><small>5 min read · <ArrowRight size={14}/></small></Link>)}</div></section>
    <section className="newsletter"><span className="eyebrow">The good kind of inbox</span><h2>Fresh deals. Zero clutter.</h2><p>Get a thoughtful roundup of useful savings and shopping ideas.</p><form><input type="email" aria-label="Email address" placeholder="Email address"/><button type="submit">Keep me posted</button></form><small>One useful email at a time. Unsubscribe whenever you like.</small></section>
  </>;
}
