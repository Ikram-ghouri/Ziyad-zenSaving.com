import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCatalog } from '@/lib/data';
import { pageMetadata, seoKeywords } from '@/lib/seo';

export const metadata=pageMetadata({title:'Money-Saving Guides & Reviews',description:'Read practical money-saving tips, shopping guides, reviews and coupon advice from Zen Saving.',path:'/blog',keywords:seoKeywords.blog});

export default async function Blog(){
  const {posts}=await getCatalog();
  const featured=posts.slice(0,3);
  const categories=[...new Set(posts.map(post=>post.category))];

  return <>
    <section className="blog-showcase">
      <div className="blog-showcase-inner">
        <span>The Zen edit</span>
        <h1>Ideas for <em>smarter shopping</em></h1>
        <p>Practical guides, honest reviews and useful advice that help every purchase feel like the right one.</p>
        <Link href="#latest">Explore latest guides <ArrowRight size={18}/></Link>
        <div className="blog-dots" aria-hidden="true"><i/><i/></div>
      </div>
    </section>

    <section className="blog-featured content-wrap" id="latest">
      <header className="blog-section-title">
        <span>Editor&apos;s picks</span>
        <h2>Explore our <em>featured stories</em></h2>
        <p>Fresh ideas chosen to help you compare, save and buy with confidence.</p>
      </header>
      <div className="blog-feature-grid">
        {featured.map((post,index)=><Link className={`blog-feature-card feature-${index+1}`} href={`/blog/${post.slug}`} key={post.id}>
          <span>{post.category}</span>
          <strong>{post.title}</strong>
          <p>{post.excerpt}</p>
          <small>Read story <ArrowRight size={15}/></small>
        </Link>)}
      </div>
    </section>

    <section className="blog-hubs">
      <div className="content-wrap">
        <header className="blog-section-title light">
          <span>Featured hubs</span>
          <h2>Explore our <em>top categories</em></h2>
        </header>
        <div className="blog-hub-grid">
          {(categories.length?categories:['Buying guides','Reviews','Saving tips']).slice(0,3).map((category,index)=><Link href={`/search?q=${encodeURIComponent(category)}`} key={category}>
            <b>0{index+1}</b><span>{category}</span><ArrowRight/>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="content-wrap blog-all">
      <header className="blog-section-title">
        <span>Latest reads</span>
        <h2>More from the <em>Zen edit</em></h2>
      </header>
      <div className="post-list">{posts.map(post=><Link className="post-card" href={`/blog/${post.slug}`} key={post.id}><span>{post.category}</span><h2>{post.title}</h2><p>{post.excerpt}</p><small>Read guide <ArrowRight size={14}/></small></Link>)}</div>
    </section>
  </>;
}
