import {NextResponse} from "next/server";
import {authorized,forbidden} from "@/lib/admin";
import {readListings} from "@/lib/data";
import {readRecords} from "@/lib/publishing";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(req:Request){
 if(!authorized(req))return forbidden();
 try{
  const live=await readListings();
  if(!live.connected)return NextResponse.json({connected:false,error:"Google Sheets service account not configured on Vercel",items:[]},{status:503,headers:{"Cache-Control":"no-store"}});
  const published=new Set((await readRecords()).records.map(x=>x.id));
  const items=live.items.map(x=>({id:x.id,name:x.name,location:x.location,rent:x.rent,sale:x.sale,area:x.area,bedrooms:x.bedrooms,folder:x.folder,alreadyPublished:published.has(x.id)}));
  return NextResponse.json({connected:true,source:"Listing / Sheet1",total:items.length,items},{headers:{"Cache-Control":"private,no-store"}});
 }catch(e){console.error("Sheet source fetch error",e);return NextResponse.json({connected:false,error:"Could not read sheet or publication records; verify sharing and service account permissions",items:[]},{status:503,headers:{"Cache-Control":"no-store"}})}
}
