'use client';
import Script from 'next/script';
import { useEffect,useState } from 'react';

export function Analytics(){
  const [consent,setConsent]=useState<'accepted'|'declined'|null>(null);
  useEffect(()=>{const timer=window.setTimeout(()=>{const saved=localStorage.getItem('zs-consent');setConsent(saved==='accepted'||saved==='declined'?saved:null);},0);return()=>window.clearTimeout(timer);},[]);
  const choose=(value:'accepted'|'declined')=>{localStorage.setItem('zs-consent',value);setConsent(value);};
  const gtm=process.env.NEXT_PUBLIC_GTM_ID;
  const bing=process.env.NEXT_PUBLIC_BING_UET_ID;
  return <>{consent==='accepted'&&gtm&&<><Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm.replace(/[^A-Z0-9-]/gi,'')}');`}</Script>{bing&&<Script id="bing-uet" strategy="afterInteractive">{`(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:'${bing.replace(/[^A-Z0-9]/gi,'')}',enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push('pageLoad')},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!='loaded'&&s!='complete'||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,'script','https://bat.bing.com/bat.js','uetq');`}</Script>}</>} {consent===null&&<div className="consent" role="dialog" aria-label="Cookie choices"><p>We use optional analytics to understand which savings pages are useful.</p><div><button onClick={()=>choose('declined')}>Decline</button><button onClick={()=>choose('accepted')}>Accept analytics</button></div></div>}</>;
}
