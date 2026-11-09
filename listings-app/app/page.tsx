import Browser from "./property-browser";
import sheetSnapshot from "../content/sheet-snapshot.json";
import {readRecords} from "@/lib/publishing";
import type {Listing} from "@/lib/data";
export const dynamic="force-dynamic";
export default async function Page(){
 let approved:Awaited<ReturnType<typeof readRecords>>["records"]=[];
 let note="";
 try{approved=(await readRecords()).records.filter(x=>x.website.status==="published");}catch(e){console.error("Published records not available",e);note="ไม่สามารถอ่านรายการที่เผยแพร่จาก GitHub ได้";}
 const snapshot=sheetSnapshot.items.map(x=>({id:x.id,status:x.status,folder:x.folder,location:x.location,name:x.name,rent:x.rent,sale:x.sale,area:x.area,floor:x.floor,bedrooms:x.bedrooms,posted:x.posted}));
 const approvedIds=new Set(approved.map(x=>x.id));
 const listings:Listing[]=[...approved.map(x=>({id:x.id,status:"ว่าง",folder:x.folder,location:x.location,name:x.name,rent:x.rent,sale:x.sale,area:x.area,floor:"",bedrooms:x.bedrooms,posted:x.approvedAt})),...snapshot.filter(x=>!approvedIds.has(x.id))];
 const images:Record<string,string>=Object.fromEntries(approved.filter(x=>x.imageUrl).map(x=>[x.id,x.imageUrl!]));
 return <Browser listings={listings} images={images} snapshotIds={snapshot.filter(x=>!approvedIds.has(x.id)).map(x=>x.id)} snapshotDate={sheetSnapshot.snapshotDate} warning={note}/>;
}
