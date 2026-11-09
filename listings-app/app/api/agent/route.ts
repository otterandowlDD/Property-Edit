import {NextResponse} from "next/server";
import {authorized,forbidden} from "@/lib/admin";
import {readListings,folderId} from "@/lib/data";
import {configured,readRecords,saveRecords,type PublishRecord} from "@/lib/publishing";
import {postFacebook,postInstagram} from "@/lib/social";
export const runtime="nodejs";export const dynamic="force-dynamic";
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
function parseAmount(x:unknown):number|null{
 if(x===null||x===undefined||x==="")return null;
 const n=Number(String(x).replaceAll(",",""));return Number.isFinite(n)&&n>0&&n<1e10?n:null;
}
function clean(x:unknown,max=160){return String(x??"").trim().slice(0,max).replace(/[<>]/g,"");}
export async function GET(req:Request){
 if(!authorized(req))return forbidden();
 try{const state=await readRecords();return respond({connected:configured(),records:state.records.map(({id,name,website,facebook,instagram,approvedAt})=>({id,name,website,facebook,instagram,approvedAt}))});}
 catch(e){return respond({error:String(e)},500);}
}
export async function POST(req:Request){
 if(!authorized(req))return forbidden();
 if(!configured())return respond({error:"Configure PE_GITHUB_TOKEN and PE_ADMIN_TOKEN on Vercel before publishing"},503);
 let body:any;try{body=await req.json();}catch{return respond({error:"Invalid JSON"},400);}
 if(body?.confirmedPermission!==true)return respond({error:"Explicit publication rights confirmation required"},400);
 let raw:any;
 let source="manual";
 if(body?.sourceId){
   let current;try{current=await readListings()}catch{return respond({error:"Could not verify current source Sheet status"},503)}
   if(!current.connected)return respond({error:"Google Sheets service account not connected"},503);
   raw=current.items.find(x=>x.id===String(body.sourceId));
   if(!raw)return respond({error:"Listing ID is missing or not marked available in source Sheet"},422);
   source="sheet";
 }else{
   try{raw=typeof body?.listing==="string"?JSON.parse(body.listing):body?.listing;}catch{return respond({error:"Paste valid JSON listing data or enter a Sheet ID"},400);}
   if(!raw||typeof raw!=="object"||Array.isArray(raw))return respond({error:"Missing listing"},400);
   if(clean(raw.status)!=="ว่าง")return respond({error:"Manual listings must explicitly have status 'ว่าง'"},422);
 }
 const name=clean(raw.name),location=clean(raw.location);
 const rent=parseAmount(raw.rent),sale=parseAmount(raw.sale),id=source==="sheet"?clean(raw.id,40):clean(raw.id,40);
 const area=clean(raw.area??raw.size,32),beds=clean(raw.bedrooms,20);
 const folder=clean(raw.folder??raw.room_image,500);
 if(!name||!location||(!rent&&!sale)||!id||!/^[a-zA-Z0-9_-]{1,40}$/.test(id))return respond({error:"Required fields: id, name, location, rent or sale"},422);
 if(folder&&!folderId(folder))return respond({error:"Drive image folder URL is invalid"},422);
 let imageUrl:string|null=null;
 if(body.imageUrl){try{const parsed=new URL(String(body.imageUrl));if(parsed.protocol!=="https:"||!parsed.hostname||parsed.username||parsed.password||["localhost","127.0.0.1","::1"].includes(parsed.hostname))throw Error();imageUrl=parsed.href;}catch{return respond({error:"Social image URL must be a public HTTPS image URL"},422);}}
 const price=rent?"฿"+rent.toLocaleString("th-TH")+"/เดือน":"฿"+sale!.toLocaleString("th-TH");
 const caption=[name,location,price,[area?area+" ตร.ม.":"",beds?beds+" ห้องนอน":""].filter(Boolean).join(" • "),"สนใจนัดชมและยืนยันสถานะห้อง ติดต่อ LINE @569xetng","#PropertyEdit #BangkokProperty #CondoForRent"].filter(Boolean).join("\n");
 const {records,sha}=await readRecords();
 if(records.some(r=>r.id===id))return respond({error:"This listing ID already exists. Duplicate publishing prevented.",id},409);
 const baseUrl=(process.env.PE_PUBLIC_SITE_URL||"https://property-edit-listings-preview.vercel.app").replace(/\/$/,"");
 const record:PublishRecord={id,name,location,rent,sale,area,bedrooms:beds,folder,caption,imageUrl,approvedAt:new Date().toISOString(),
 website:{status:"published",url:baseUrl+"/property/"+encodeURIComponent(id)},
 facebook:{status:"needs_connection"},instagram:{status:"needs_connection"}};
 try{await saveRecords([...records,record],sha);}catch(e){return respond({error:"Website record could not be stored: "+String(e)},502);}
 // Execute each provider independently. Never report success without an API-confirmed publish ID.
 const facebook=await postFacebook(caption,imageUrl).catch(e=>({status:"failed" as const,error:String(e).slice(0,180)}));
 const instagram=await postInstagram(caption,imageUrl).catch(e=>({status:"failed" as const,error:String(e).slice(0,180)}));
 record.facebook=facebook;record.instagram=instagram;
 let auditSaved=true;try{const latest=await readRecords();const matching=latest.records.find(r=>r.id===id);if(matching){await saveRecords(latest.records.map(r=>r.id===id?record:r),latest.sha)}else auditSaved=false;}catch{auditSaved=false;}
 return respond({source,record,auditSaved,note:"Website record stored on GitHub preview branch. Public site and social media are not independently verified until deployed and channel IDs are returned."},auditSaved?200:207);
}
