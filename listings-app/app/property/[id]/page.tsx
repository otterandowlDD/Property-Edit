import {notFound} from "next/navigation";
import {readRecords} from "@/lib/publishing";
import {readPrivateManifest,galleryPaths} from "@/lib/private-images";
export const dynamic="force-dynamic";
export default async function PropertyPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[A-Za-z0-9_-]{1,40}$/.test(id))notFound();
 const imported=(await readPrivateManifest()).listings[id];
 const records=imported?[]:(await readRecords().catch(()=>({records:[],sha:null}))).records;
 const manual=records.find(x=>x.id===id&&x.website.status==="published");
 const p=imported||manual;if(!p)notFound();
 const photos=imported?galleryPaths(imported):manual?.imageUrl?[manual.imageUrl]:[];
 const money=(v:number)=>new Intl.NumberFormat("th-TH").format(v);
 return <main style={{maxWidth:1000,margin:"auto",padding:"40px 20px"}}>
 <a href="/">← PROPERTY EDIT / LISTINGS</a>
 <p style={{marginTop:40}}>LISTING #{p.id} · SUBJECT TO CONFIRMATION</p>
 <h1 style={{font:"normal clamp(32px,6vw,60px) Georgia,serif"}}>{p.name}</h1><p>{p.location}</p>
 <h2>{p.rent?"฿"+money(p.rent)+" / month":p.sale?"฿"+money(p.sale):"สอบถามราคา"}</h2>
 <p>{[p.area?p.area+" ตร.ม.":"",p.bedrooms?p.bedrooms+" ห้องนอน":"",imported?.floor?"ชั้น "+imported.floor:""].filter(Boolean).join(" · ")}</p>
 <p>{photos.length} ภาพ · ภาพตามโฟลเดอร์ของพาร์ตเนอร์ อาจรวมพื้นที่ส่วนกลาง</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:14}}>{photos.map((src,index)=><a key={src} href={src} target="_blank" rel="noopener noreferrer"><img src={src} alt={p.name+" ภาพ "+(index+1)} loading={index?"lazy":"eager"} style={{width:"100%",height:"auto",display:"block",borderRadius:10}}/></a>)}</div>
 {manual?.caption&&<p style={{whiteSpace:"pre-line",lineHeight:1.8}}>{manual.caption}</p>}
 <a href="https://line.me/R/ti/p/@569xetng" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:28,padding:"14px 25px",background:"#25352e",color:"white"}}>สอบถามรายการ #{p.id} ผ่าน LINE</a>
 <p>ต้องยืนยันราคา สถานะ และเงื่อนไขกับผู้ดูแลก่อนทำธุรกรรม</p>
 </main>;
}
