import Browser from "./property-browser";
import {readRecords} from "@/lib/publishing";
import type {Listing} from "@/lib/data";
export const dynamic="force-dynamic";
export default async function Page(){
 let listings:Listing[]=[];let images:Record<string,string>={};let warning="";
 try{const published=(await readRecords()).records.filter(x=>x.website.status==="published");
 images=Object.fromEntries(published.filter(x=>x.imageUrl).map(x=>[x.id,x.imageUrl!]));
 listings=published.map(x=>({id:x.id,status:"ว่าง",folder:x.folder,location:x.location,name:x.name,rent:x.rent,sale:x.sale,area:x.area,floor:"",bedrooms:x.bedrooms,posted:x.approvedAt}));}
 catch(e){console.error("Published listing database unavailable",e);warning="ระบบรายการทรัพย์ยังไม่พร้อมใช้งาน";}
 return <Browser listings={listings} images={images} warning={warning||(!process.env.PE_GITHUB_TOKEN?"ยังไม่เชื่อมฐานข้อมูล Published Listings — ยังไม่มีรายการที่ผ่านการอนุมัติ":"")} />;
}
