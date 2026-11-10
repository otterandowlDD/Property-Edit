import type {ChannelStatus} from "@/lib/publishing";
type Result={status:ChannelStatus;id?:string;error?:string};
const version=process.env.META_GRAPH_VERSION||"v23.0";
async function send(path:string,params:Record<string,string>):Promise<Result>{
 const res=await fetch("https://graph.facebook.com/"+version+"/"+path,{method:"POST",body:new URLSearchParams(params),cache:"no-store"});
 const data=await res.json().catch(()=>({}));
 if(!res.ok||data.error)return {status:"failed",error:String(data.error?.message||"Meta response "+res.status).slice(0,250)};
 return {status:"published",id:String(data.id||"")};
}
export async function postFacebook(caption:string,imageUrl:string|null):Promise<Result>{
 const page=process.env.META_FACEBOOK_PAGE_ID,token=process.env.META_FACEBOOK_PAGE_TOKEN;
 if(!page||!token)return {status:"needs_connection"};
 if(imageUrl){return send(page+"/photos",{url:imageUrl,caption,access_token:token,published:"true"});}
 return send(page+"/feed",{message:caption,access_token:token});
}
export async function postInstagram(caption:string,imageUrl:string|null):Promise<Result>{
 const account=process.env.META_INSTAGRAM_ACCOUNT_ID,token=process.env.META_INSTAGRAM_TOKEN;
 if(!account||!token)return {status:"needs_connection"};
 if(!imageUrl)return {status:"skipped",error:"Instagram requires a public, approved image URL"};
 const created=await send(account+"/media",{image_url:imageUrl,caption,access_token:token});
 if(created.status!=="published"||!created.id)return created;
 const published=await send(account+"/media_publish",{creation_id:created.id,access_token:token});
 return published;
}
