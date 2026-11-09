"use client";
import {useMemo,useRef,useState} from "react";
import type {Listing} from "@/lib/data";
const money=(n:number)=>new Intl.NumberFormat("th-TH").format(n);
type Props={listings:Listing[];warning:string;images?:Record<string,string>;galleries?:Record<string,string[]>;snapshotIds?:string[];snapshotDate?:string};
function Picture({sources,name}:{sources:string[];name:string}){
 const [index,setIndex]=useState(0),[failed,setFailed]=useState<string[]>([]);
 const usable=sources.filter(s=>!failed.includes(s));
 const src=usable.length?usable[index%usable.length]:null;
 return <div className="picture" style={{position:"relative"}}>{src?<img key={src} src={src} alt={"ภาพห้อง "+name+" · "+(index%usable.length+1)} loading="lazy" onError={()=>{setFailed(v=>[...v,src]);setIndex(0);}}/>:<div className="no-image"><span aria-hidden="true">⌂</span><strong>PROPERTY EDIT</strong><small>รอยืนยันสิทธิ์เผยแพร่ภาพ</small></div>}{usable.length>1&&<div style={{position:"absolute",bottom:12,left:12,right:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}><button aria-label={"ภาพก่อนหน้า "+name} onClick={()=>setIndex((index+usable.length-1)%usable.length)} style={{minWidth:44,minHeight:44}}>‹</button><span style={{background:"white",padding:"6px 10px",borderRadius:20}}>{index%usable.length+1} / {usable.length}</span><button aria-label={"ภาพถัดไป "+name} onClick={()=>setIndex((index+1)%usable.length)} style={{minWidth:44,minHeight:44}}>›</button></div>}</div>;
}
export default function Browser({listings,warning,images={},galleries={},snapshotIds=[],snapshotDate=""}:Props){
 const [search,setSearch]=useState(""),[kind,setKind]=useState("rent"),[max,setMax]=useState(""),[beds,setBeds]=useState("");
 const rail=useRef<HTMLDivElement>(null);
 const snapshots=new Set(snapshotIds);
 const filtered=useMemo(()=>listings.filter(x=>(x.name+" "+x.location).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())&&(kind==="all"|| (kind==="rent"?!!x.rent:!!x.sale))&&(!max||(kind==="sale"?(x.sale!==null&&x.sale<=Number(max)):(x.rent!==null&&x.rent<=Number(max))))&&(!beds||x.bedrooms===beds)),[listings,search,kind,max,beds]);
 const rental=filtered.filter(x=>x.rent); const sales=filtered.filter(x=>x.sale);
 const scroll=(distance:number)=>rail.current?.scrollBy({left:distance,behavior:"smooth"});
 return <main>
 <style>{`
 *{box-sizing:border-box}body{background:#f7f7f7;color:#242424;margin:0}button,input,select{font:inherit}a{color:inherit}
 .site-head{display:flex;align-items:center;justify-content:space-between;padding:24px clamp(20px,4vw,75px);background:#fff;border-bottom:1px solid #e6e6e6}
 .logo{font:400 27px Georgia,serif;letter-spacing:.04em;text-decoration:none}.head-contact{font-size:13px;text-decoration:none;font-weight:700}
 .hero{padding:54px clamp(20px,4vw,75px) 46px;background:#f3f2f0}.hero small{text-transform:uppercase;letter-spacing:2.3px;font-size:12px;color:#8c1c25}.hero h1{font:400 clamp(44px,6vw,76px)/1.05 Georgia,serif;margin:18px 0}.hero p{font-size:15px;line-height:1.7;color:#626262;max-width:850px}
 .wrap{padding:30px clamp(20px,4vw,75px) 80px;max-width:1800px;margin:auto}.notice{border:1px solid #e2c890;background:#fff8e8;padding:16px 20px;margin-bottom:24px;line-height:1.6;font-size:14px}
 .filters{display:grid;grid-template-columns:minmax(190px,2fr) repeat(3,minmax(130px,1fr));gap:12px;margin:20px 0 28px}
 .filters input,.filters select{width:100%;height:50px;background:#fff;border:1px solid #d6d6d6;border-radius:5px;color:#303030;padding:0 14px}
 .section-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin:32px 0 18px}
 .section-head h2{font:400 clamp(36px,4.6vw,65px)/1.02 Georgia,serif;margin:0}.section-head p{margin:12px 0 0;font-size:14px;color:#666}
 .actions{display:flex;align-items:center;gap:10px}.ghost{background:transparent;border:1px solid #ccc;border-radius:50%;width:39px;height:39px;cursor:pointer;color:#9d1e26;font-size:22px}
 .all-link{font-size:14px;font-weight:700;color:#a41f29;text-decoration:none;margin-left:8px}
 .rail{display:flex;overflow-x:auto;gap:24px;scroll-snap-type:x mandatory;scrollbar-width:thin;scrollbar-color:#999 transparent;padding:6px 0 22px;overscroll-behavior-x:contain}
 .card{scroll-snap-align:start;flex:0 0 clamp(275px,29vw,365px);background:#fff;border-radius:32px;border:1px solid #e6e5e5;overflow:hidden;box-shadow:0 14px 34px rgba(0,0,0,.05);display:flex;flex-direction:column}
 .picture{height:285px;position:relative;background:#e8e9e6}.picture img{width:100%;height:100%;object-fit:cover;display:block}
 .no-image{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;height:100%;color:#6d766e;text-align:center;background:linear-gradient(135deg,#eee,#dce2db)}.no-image span{font-size:80px;line-height:1}.no-image strong{font:400 21px Georgia,serif;letter-spacing:1.3px}.no-image small{font-size:12px;padding:0 15px}
 .ribbon{background:#a51d28;color:#fff;border-radius:0 0 20px 0;padding:14px 21px;font-size:12px;font-weight:800;letter-spacing:.03em;align-self:flex-start;position:absolute;top:0;left:0;z-index:1}
 .unit{position:absolute;bottom:16px;right:16px;background:rgba(255,255,255,.96);border-radius:22px;padding:10px 16px;font-size:11px;font-weight:800;letter-spacing:.07em}
 .info{padding:25px 26px 27px;display:flex;flex:1;flex-direction:column}.location{font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:800;color:#666;min-height:18px}.info h3{font-size:24px;line-height:1.28;margin:7px 0 20px;min-height:62px}
 .divider{border:0;border-top:1px solid #ececec;width:100%;margin:0}
 .price{font-size:29px;font-weight:700;color:#a91e2a;margin:21px 0}.price small{font-size:14px;color:#777;font-weight:500}
 .facts{padding:18px 0 8px;font-size:14px;color:#535353;line-height:1.7;min-height:103px}.facts span{display:block;margin-bottom:5px}.facts span:before{content:"•";color:#b11c28;font-weight:bold;margin-right:10px}
 .buttons{display:flex;gap:11px;align-items:center;margin-top:auto}.primary{flex:1;display:block;text-align:center;background:#aa1e2a;color:white;border-radius:35px;text-decoration:none;font-weight:700;font-size:13px;padding:16px 10px}.line{background:#0cba5a;color:white;padding:15px 16px;border-radius:40px;text-decoration:none;font-size:12px;font-weight:700}
 .preview{margin-top:15px;font-size:11px;color:#826c48;line-height:1.5}.no-results{padding:55px 18px;color:#666;background:white;border:1px solid #e4e4e4;text-align:center;border-radius:12px}
 .footer-note{padding:28px 0 8px;font-size:13px;line-height:1.7;color:#747474}
 @media(max-width:900px){.filters{grid-template-columns:1fr 1fr}.card{flex-basis:300px}.picture{height:250px}}
 @media(max-width:560px){.filters{grid-template-columns:1fr}.site-head{padding:18px 20px}.hero{padding:45px 20px}.hero h1{font-size:48px}.section-head{align-items:start}.section-head h2{font-size:42px}.actions{flex-wrap:wrap}.card{flex-basis:min(82vw,325px)}.picture{height:235px}.info{padding:23px}.rail{gap:14px}}
 `}</style>
 <header className="site-head"><a className="logo" href="https://property-edit.vercel.app/">PROPERTY EDIT</a><a className="head-contact" href="https://line.me/R/ti/p/@569xetng">CONTACT · LINE ↗</a></header>
 <section className="hero"><small>Bangkok Property Collection</small><h1>Find your next space.</h1><p>คัดสรรรายการให้เช่าและขายจากฐานข้อมูล Listing พร้อมข้อมูลราคา ขนาด และทำเลที่ระบุไว้ในต้นทาง สถานะห้องและเงื่อนไขต้องยืนยันกับผู้ดูแลก่อนนัดชมทุกครั้ง</p></section>
 <div className="wrap">
 {warning&&<div className="notice">{warning}</div>}
 {snapshotIds.length>0&&<div className="notice"><strong>Preview จาก Google Sheets · {snapshotDate}</strong> — แสดงรายการจากข้อมูลของตัวแทนเพื่อทดสอบรูปแบบเว็บไซต์ ไม่ใช่ประกาศที่ได้รับการอนุมัติหรือยืนยันห้องว่างแล้ว รูปภาพจริงจะแสดงเฉพาะไฟล์ที่ตรวจสิทธิ์เผยแพร่และนำเข้าสำเร็จแล้ว</div>}
 <div className="filters"><input aria-label="ค้นหาโครงการหรือทำเล" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหาโครงการ หรือทำเล"/><select aria-label="ประเภทประกาศ" value={kind} onChange={e=>{setKind(e.target.value);setMax("");}}><option value="rent">ให้เช่า</option><option value="sale">ขาย</option><option value="all">เช่าและขาย</option></select><select aria-label="งบประมาณสูงสุด" value={max} onChange={e=>setMax(e.target.value)}><option value="">ทุกช่วงราคา</option>{(kind==="sale"?[1000000,3000000,5000000,10000000,20000000]:[10000,15000,20000,30000,40000,50000,80000,150000]).map(n=><option key={n} value={n}>ไม่เกิน ฿{money(n)}</option>)}</select><select aria-label="ห้องนอน" value={beds} onChange={e=>setBeds(e.target.value)}><option value="">ทุกจำนวนห้องนอน</option>{["S","1","2","3","4","5"].map(n=><option key={n} value={n}>{n==="S"?"Studio":n+" ห้องนอน"}</option>)}</select></div>
 <div className="section-head"><div><h2>{kind==="sale"?"Available for sale.":"Available for rent."}</h2><p>{filtered.length} รายการตามเงื่อนไข</p></div><div className="actions"><button className="ghost" aria-label="เลื่อนไปทางซ้าย" onClick={()=>scroll(-380)}>‹</button><button className="ghost" aria-label="เลื่อนไปทางขวา" onClick={()=>scroll(380)}>›</button><a className="all-link" href="#browse" onClick={e=>{e.preventDefault();setSearch("");setMax("");setBeds("");setKind("rent");rail.current?.scrollTo({left:0,behavior:"smooth"});}}>View all rentals →</a></div></div>
 {filtered.length?<div className="rail" ref={rail} id="browse">{filtered.map(l=><article className="card" key={l.id}><div style={{position:"relative"}}><Picture sources={galleries[l.id]?.length?galleries[l.id]:images[l.id]?[images[l.id]]:[]} name={l.name}/><div className="ribbon">{snapshots.has(l.id)?"SOURCE LISTING · REVIEW":"AVAILABLE · VERIFY"}</div><div className="unit">ID {l.id}</div></div><div className="info"><div className="location">{l.location||"BANGKOK"}</div><h3>{l.name}</h3><hr className="divider"/><div className="price">{l.rent?"฿"+money(l.rent):l.sale?"฿"+money(l.sale):"สอบถามราคา"}{l.rent&&<small> / month</small>}</div><hr className="divider"/><div className="facts">{l.area&&<span>{l.area} sq.m.</span>}{l.bedrooms&&<span>{l.bedrooms} Bedroom{l.bedrooms==="1"?"":"s"}</span>}{l.floor&&<span>Floor {l.floor}</span>}</div><div className="buttons">{snapshots.has(l.id)?<a className="primary" href={"https://line.me/R/ti/p/@569xetng"} target="_blank" rel="noopener noreferrer">Ask about this unit</a>:<a className="primary" href={"/property/"+encodeURIComponent(l.id)}>View details</a>}<a className="line" href="https://line.me/R/ti/p/@569xetng" target="_blank" rel="noopener noreferrer">LINE</a></div>{snapshots.has(l.id)&&<div className="preview">ข้อมูลจากพาร์ตเนอร์ · รอยืนยันสถานะและสิทธิ์ลงประกาศ</div>}</div></article>)}</div>:<div className="no-results">ไม่มีรายการตรงกับตัวกรอง ลองเปลี่ยนทำเล ราคา หรือประเภททรัพย์</div>}
 <div className="footer-note">Source: Listing / Sheet1 · ข้อมูลตัวแทนอาจมีการเปลี่ยนแปลงราคาและสถานะได้ · Property Edit ไม่รับรองสถานะห้องก่อนตรวจสอบกับผู้ดูแล</div>
 </div></main>;
}
