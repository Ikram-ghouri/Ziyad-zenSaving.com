import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCatalog } from '@/lib/data';
import type { Post } from '@/lib/types';

const channels=[
  {title:'Latest product reviews',category:'Reviews',intro:'Clear opinions that help you compare before you buy.'},
  {title:'Expert buying guides',category:'Buying guides',intro:'Useful research and practical advice for confident choices.'},
  {title:'Subscription box savings',category:'Subscription boxes',intro:'Know what is worth subscribing to before you commit.'},
];

function StoryCard({post}:{post:Post}){
  return <Link className="blog-story-card" href={`/blog/${post.slug}`}><span>{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><small>Read more <ArrowRight size={15}/></small></Link>;
}

export default async function BlogLanding(){
  const {posts,stores}=await getCatalog();
  const categories=[...new Set(posts.map(post=>post.category))];

  return <>
    <section className="blog-showcase">
      <div className="blog-showcase-inner">
        <span>The Zen edit</span>
        <h1>Ideas for <em>smarter shopping</em></h1>
        <p>Practical guides, honest reviews and useful advice that help every purchase feel like the right one.</p>
        <Link href="#stories">Explore latest guides <ArrowRight size={18}/></Link>
        <div className="blog-dots" aria-hidden="true"><i/><i/></div>
      </div>
    </section>

    <section className="blog-store-strip content-wrap">
      <header className="blog-section-title">
        <span>Popular right now</span>
        <h2>Explore our <em>featured stores</em></h2>
      </header>
      <div className="blog-store-row">{stores.slice(0,8).map(store=><Link href={`/store/${store.slug}`} key={store.id}><b>{store.name.slice(0,2).toUpperCase()}</b><span>{store.name}</span></Link>)}</div>
      <Link className="blog-outline-link" href="/stores">View all stores <ArrowRight size={16}/></Link>
    </section>

    <section className="blog-hubs">
      <div className="content-wrap">
        <header className="blog-section-title light">
          <span>Featured hubs</span>
          <h2>Explore our <em>top categories</em></h2>
        </header>
        <div className="blog-hub-grid">
          {(categories.length?categories:['Buying guides','Reviews','Saving tips']).slice(0,3).map((category,index)=><Link href={`/search?q=${encodeURIComponent(category)}`} key={category}><b>0{index+1}</b><span>{category}</span><ArrowRight/></Link>)}
        </div>
      </div>
    </section>

    <section className="content-wrap blog-channels" id="stories">
      {channels.map(channel=>{
        const matching=posts.filter(post=>post.category.toLowerCase()===channel.category.toLowerCase());
        const stories=matching.length?matching:posts;
        return <section className="blog-channel" key={channel.category}>
          <div className="blog-channel-head"><div><span>{channel.category}</span><h2>{channel.title}</h2><p>{channel.intro}</p></div><Link href={`/search?q=${encodeURIComponent(channel.category)}`}>View all <ArrowRight size={16}/></Link></div>
          <div className="blog-story-grid">{stories.slice(0,3).map(post=><StoryCard post={post} key={`${channel.category}-${post.id}`}/>)}</div>
        </section>;
      })}
    </section>
  </>;
}
