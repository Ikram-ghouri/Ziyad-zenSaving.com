export type Store = {id:number;slug:string;name:string;logo?:string;category:string;description:string;rating?:number;audiences:string[]};
export type Coupon = {id:number;slug:string;title:string;description:string;type:'code'|'sale'|'print';code?:string;discount:string;expires:string;is_expired:boolean;free_shipping:boolean;exclusive:boolean;used:number;percent_success:number;store:Store;categories:string[];go_url:string;verified?:boolean};
export type Post = {id:number;slug:string;title:string;excerpt:string;content:string;category:string;date:string};
export type Catalog = {stores:Store[];coupons:Coupon[];posts:Post[];categories:string[]};
export const audiences = ['student','teacher','military','senior','nurse','healthcare','first-responder','birthday','credit-card','gift-card'];
export const label = (value:string) => value.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' ');
export function filterCoupons(coupons:Coupon[],filter:string) {return coupons.filter(c=>filter==='Codes'?c.type==='code':filter==='Deals'?c.type==='sale':filter==='Free shipping'?c.free_shipping:true);}
export function safeUrl(value:string) {try {const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:undefined;}catch{return undefined;}}

