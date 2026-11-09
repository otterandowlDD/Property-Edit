"use client";
import {useState} from "react";
type Result={source?:string;record?:{id:string;name:string;caption:string;website:{status:string;url:string};facebook:{status:string;id?:string;error?:string};instagram:{status:string;id?:string;error?:string}};auditSaved?:boolean;error?:string;note?:string};
const template=JSON.stringify({id:"PE-001",status:"ว่าง",name:"Example Residence",location:"Bangkok",rent:25000,sale:null,area:"40",bedrooms:"1",folder:""},null,2);
export default function AgentDashboard(){
 const [token,setToken]=useState(""),[mode,setMode]=useState<"paste"|"sheet">("paste"),[sourceId,setSourceId]=useState(""),[listing,setListing]=useState(""),[imageUrl,setImageUrl]=useState(""),[permission,setPermission]=useState(false),[result,setResult]=useState<Result|null>(null),[loading,setLoading]=useState(false);
 async function publish(){
 setLoading(true);setResult(null);
 try{const response=await fetch("/api/agent",{method:"POST",headers:{"Content-Type":"application/json","x-pe-admin-token":token},body:JSON.stringify({confirmedPermission:permission,sourceId:mode==="sheet"?sourceId.trim():undefined,listing:mode==="paste"?listing:undefined,imageUrl:imageUrl.trim()||undefined})});setResult(await response.json());}
 catch(e){setResult({error:String(e)})}finally{setLoading(false)}
 }
 const inputStyle={width:"100%",padding:"13px 15px",border:"1px solid #d4d7d1",font:"inherit",marginTop:6,background:"white"} as const;
 return <main style={{maxWidth:900,margin:"auto",padding:"42px 22px 100px"}}>
 <a href="/" style={{color:"inherit"}}>← Property Edit</a>
 <p style={{marginTop:45,fontSize:12,letterSpacing:2,textTransform:"uppercase"}}>Property Edit · Agent Control</p>
 <h1 style={{font:"normal clamp(38px,6vw,65px) Georgia,serif",margin:"10px 0"}}>One listing. Three channels.</h1>
 <p style={{lineHeight:1.7,color:"#657068"}}>วางข้อมูลครั้งเดียว → ตรวจ → สร้าง Caption → บันทึกรายการเว็บ → ส่งโพสต์ไปช่องทางที่เชื่อมต่อจริง โดยแสดงผลแยกทุกช่องทาง</p>
 <section style={{background:"white",padding:24,border:"1px solid #ddd"}}>
 <label>Admin token (เก็บในหน้าเว็บชั่วคราวเท่านั้น ไม่บันทึกใน Browser Storage)<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} style={inputStyle} placeholder="Secret from Vercel PE_ADMIN_TOKEN"/></label>
 <div style={{display:"flex",gap:10,margin:"24px 0"}}><button onClick={()=>setMode("paste")} aria-pressed={mode==="paste"}>Paste JSON Listing</button><button onClick={()=>setMode("sheet")} aria-pressed={mode==="sheet"}>Import by Google Sheet ID</button></div>
 {mode==="paste"?<label>Listing JSON<textarea value={listing} onChange={e=>setListing(e.target.value)} placeholder={template} rows={12} style={{...inputStyle,resize:"vertical",fontFamily:"monospace",fontSize:13}}/></label>:<label>Listing ID จาก Google Sheet<input value={sourceId} onChange={e=>setSourceId(e.target.value)} placeholder="เช่น 118" style={inputStyle}/></label>}
 <p style={{fontSize:13,color:"#647068"}}>ฟิลด์จำเป็น: id, status = ว่าง, name, location และ rent หรือ sale ส่วนโหมด Google Sheet จะเช็กสถานะจากต้นทางอีกครั้ง</p>
 <label>Public image HTTPS URL (ถ้าได้รับอนุญาตและเปิดภาพสาธารณะสำหรับ Instagram)<input type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} style={inputStyle} placeholder="https://.../photo.jpg"/></label>
 <label style={{display:"flex",gap:10,alignItems:"flex-start",margin:"22px 0",lineHeight:1.6}}><input type="checkbox" checked={permission} onChange={e=>setPermission(e.target.checked)} style={{marginTop:6}}/><span>ยืนยันว่าได้รับสิทธิ์เผยแพร่รายการ ข้อความ ราคา และรูปภาพจากเจ้าของข้อมูล/Listing Agent และได้ตรวจสถานะว่าปล่อยเช่าหรือขายได้</span></label>
 <button style={{width:"100%",background:"#25352e",color:"white",padding:"16px",border:0,fontSize:15,cursor:"pointer"}} disabled={loading||!permission||!token||(mode==="paste"?!listing.trim():!sourceId.trim())} onClick={publish}>{loading?"Publishing...":"Validate & Publish to Connected Channels"}</button>
 {result&&<div role="status" style={{marginTop:25,padding:18,background:"#f3f5f1",overflowWrap:"anywhere"}}>
 {result.error?<strong>ไม่สำเร็จ: {result.error}</strong>:<>
 <h2 style={{fontSize:18}}>ผลการเผยแพร่: {result.record?.name}</h2>
 <p>Website: {result.record?.website.status} — <a href={result.record?.website.url} target="_blank" rel="noopener noreferrer">Preview URL</a></p>
 <p>Facebook: {result.record?.facebook.status} {result.record?.facebook.id&&"· "+result.record.facebook.id} {result.record?.facebook.error}</p>
 <p>Instagram: {result.record?.instagram.status} {result.record?.instagram.id&&"· "+result.record.instagram.id} {result.record?.instagram.error}</p>
 <p>Audit persistence: {result.auditSaved?"saved":"requires attention"}</p><details><summary>Generated caption</summary><pre style={{whiteSpace:"pre-wrap"}}>{result.record?.caption}</pre></details>
 </>}
 </div>}
 </section>
 <p style={{marginTop:20,fontSize:13,color:"#626b64"}}>ระบบไม่เผยแพร่โดยไม่มีการยืนยันสิทธิ์, ไม่สั่งโพสต์ซ้ำเมื่อ ID ซ้ำ และไม่ถือว่าช่องทาง Social สำเร็จหากไม่ได้รับผลตอบกลับจาก API จริง</p>
 </main>;
}
