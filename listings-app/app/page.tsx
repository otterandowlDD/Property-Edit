import Browser from "./property-browser";
import sheetSnapshot from "../content/sheet-snapshot.json";
import {readRecords} from "@/lib/publishing";
import {readPrivateManifest,galleryPaths} from "@/lib/private-images";
import type {Listing} from "@/lib/data";
export const dynamic="force-dynamic";
export default async function Page(){
 const [published,privateManifest]=await Promise.all([readRecords().catch(()=>({records:[],sha:null})),readPrivateManifest()]);
 const approved=published.records.filter(x=>x.website.status==="published");
 const imported=Object.values(privateManifest.listings).map(x=>({id:x.id,status:x.status,name:x.name,location:x.location,rent:x.rent,sale:x.sale,area:x.area,floor:x.floor,bedrooms:x.bedrooms,posted:x.posted,folder:""}));
 const seen=new Set(imported.map(x=>x.id));
 const manual=approved.filter(x=>!seen.has(x.id)).map(x=>({id:x.id,status:"ว่าง",folder:x.folder,location:x.location,name:x.name,rent:x.rent,sale:x.sale,area:x.area,floor:"",bedrooms:x.bedrooms,posted:x.approvedAt}));
 manual.forEach(x=>seen.add(x.id));
 const snapshot=sheetSnapshot.items.filter(x=>!seen.has(x.id));
 const listings:Listing[]=[...imported,...manual,...snapshot];
 
 const images=Object.fromEntries([...approved.filter(x=>x.imageUrl).map(x=>[x.id,x.imageUrl!]),...Object.values(privateManifest.listings).map(x=>[x.id,galleryPaths(x)[0]])]);
 return <Browser listings={listings} images={images} snapshotIds={snapshot.map(x=>x.id)} snapshotDate={sheetSnapshot.snapshotDate} warning={imported.length?"ภาพประกอบได้รับการยืนยันสิทธิ์ใช้บนเว็บไซต์ผ่านพาร์ตเนอร์ · โปรดยืนยันราคาและสถานะห้องก่อนนัดชม":""}/>;
}
