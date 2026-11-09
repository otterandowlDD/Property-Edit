import {notFound} from "next/navigation";
import {readRecords} from "@/lib/publishing";
export const dynamic="force-dynamic";
export default async function PropertyPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[A-Za-z0-9_-]{1,40}$/.test(id))notFound();
 let records;try{records=(await readRecords()).records}catch{notFound()}
 const p=records.find(x=>x.id===id&&x.website.status==="published");if(!p)notFound();
 const money=(v:number)=>new Intl.NumberFormat("th-TH").format(v);
 return <main style={{maxWidth:880,margin:"auto",padding:"50px 24px"}}>
 <a href="/" style={{color:"inherit"}}>← PROPERTY EDIT / LISTINGS</a>
 <p style={{marginTop:54,fontSize:12,letterSpacing:2}}>AVAILABLE LISTING · SUBJECT TO CONFIRMATION</p>
 <h1 style={{font:"normal clamp(38px,6vw,64px) Georgia,serif",margin:"16px 0"}}>{p.name}</h1>
 <p>{p.location}</p>
 {p.imageUrl&&<img src={p.imageUrl} alt={p.name} style={{width:"100%",aspectRatio:"16/9",objectFit:"cover"}}/>}
 <h2 style={{fontFamily:"Georgia,serif"}}>{p.rent?"฿"+money(p.rent)+" / month":p.sale?"฿"+money(p.sale):"Contact for price"}</h2>
 <p>{[p.area?p.area+" ตร.ม.":"",p.bedrooms?p.bedrooms+" ห้องนอน":""].filter(Boolean).join(" · ")}</p>
 <p style={{whiteSpace:"pre-line",lineHeight:1.8}}>{p.caption}</p>
 <a href="https://line.me/R/ti/p/@569xetng" rel="noopener noreferrer" target="_blank" style={{display:"inline-block",padding:"14px 25px",background:"#25352e",color:"#fff",textDecoration:"none"}}>สอบถามรายการ #{p.id} ผ่าน LINE</a>
 <p style={{fontSize:13,color:"#757575",marginTop:25}}>ข้อมูลจาก Listing Agent — ต้องยืนยันราคา ความพร้อม และนัดหมายก่อนทำธุรกรรม</p>
 </main>;
}
