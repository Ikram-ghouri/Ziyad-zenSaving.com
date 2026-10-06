import type { NextConfig } from 'next';

const wpUrl=process.env.WP_API_URL;

const config:NextConfig={
  output:'standalone',
  outputFileTracingRoot:process.cwd(),
  images:{remotePatterns:wpUrl?[{protocol:'https',hostname:new URL(wpUrl).hostname}]:[]},
  async redirects(){
    const fallback=[
      {source:'/stores/:slug',destination:'/store/:slug',permanent:true},
      {source:'/category/:slug',destination:'/coupon-category/:slug',permanent:true},
    ];
    if(!wpUrl)return fallback;
    try{
      const response=await fetch(`${wpUrl.replace(/\/$/,'')}/redirects`,{signal:AbortSignal.timeout(5000)});
      if(!response.ok)return fallback;
      const redirects=await response.json();
      return Array.isArray(redirects)?[...redirects,...fallback]:fallback;
    }catch{return fallback;}
  },
  async headers(){return [{source:'/:path*',headers:[
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'SAMEORIGIN'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  ]}]},
};

export default config;
