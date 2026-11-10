"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import type {Listing} from "@/lib/data";
import {verified,visibleProjects,type Project} from "@/lib/projects";
import {loadGoogleMaps,type MapsConfig,type MapInstance,type MarkerInstance} from "@/lib/google-maps";
import CoverImage from "./cover-image";
export default function ProjectMap({listings,images,selected,onSelect,onBrowse,config}:{listings:Listing[];images:Record<string,string>;selected:string;onSelect:(id:string)=>void;onBrowse:(id:string)=>void;config:MapsConfig}){
 const host=useRef<HTMLDivElement>(null),map=useRef<MapInstance|null>(null),markers=useRef<{marker:MarkerInstance;node:HTMLButtonElement;id:string}[]>([]);
 const select=useRef(onSelect);select.current=onSelect;
 const [state,setState]=useState<"loading"|"ready"|"missing"|"error">(!config.key||!config.mapId?"missing":"loading");
 const visible=useMemo(()=>visibleProjects(listings),[listings]);
 const mapped=useMemo(()=>visible.filter(verified),[visible]);
 const chosen=visible.find(p=>p.id===selected);
 useEffect(()=>{
  if(!config.key||!config.mapId){setState("missing");return;}
  if(!config.hosts.includes(location.hostname)){setState("error");return;}
  let cancelled=false,authFailed=false;const oldAuth=window.gm_authFailure;
  window.gm_authFailure=()=>{authFailed=true;if(!cancelled)setState("error");};
  loadGoogleMaps(config.key).then(async()=>{
   const sdk=window.google!.maps;await Promise.all([sdk.importLibrary("maps"),sdk.importLibrary("marker")]);
   if(cancelled||authFailed||!host.current)return;
   // The viewport below is fitted to verified coordinates; never use a guessed project pin.
   map.current=new sdk.Map(host.current,{mapId:config.mapId,zoom:11,gestureHandling:"cooperative",streetViewControl:false,mapTypeControl:false,fullscreenControl:true});setState("ready");
  }).catch(()=>{if(!cancelled)setState("error");});
  return()=>{cancelled=true;window.gm_authFailure=oldAuth;markers.current.forEach(x=>{x.marker.map=null;window.google?.maps.event.clearInstanceListeners(x.marker);});markers.current=[];map.current=null;};
 },[config.key,config.mapId,config.hosts]);
 useEffect(()=>{
  if(state!=="ready"||!map.current||!window.google)return;
  const sdk=window.google.maps;
  markers.current.forEach(x=>{x.marker.map=null;sdk.event.clearInstanceListeners(x.marker);});markers.current=[];
  const bounds=new sdk.LatLngBounds();
  mapped.forEach(p=>{
   const node=document.createElement("button");node.type="button";node.className="owl-marker";node.setAttribute("aria-label",p.name);node.title=p.name;
   const icon=document.createElement("img");icon.src="/markers/owl.svg";icon.alt="";icon.width=48;icon.height=54;node.append(icon);
   node.onclick=()=>select.current(p.id);
   const position={lat:p.lat!,lng:p.lng!};bounds.extend(position);
   const marker=new sdk.marker.AdvancedMarkerElement({map:map.current,position,title:p.name});marker.append(node);
   markers.current.push({marker,node,id:p.id});
  });
  if(mapped.length===1){map.current.panTo({lat:mapped[0].lat!,lng:mapped[0].lng!});map.current.setZoom(15);}else if(mapped.length)map.current.fitBounds(bounds,60);
  return()=>{markers.current.forEach(x=>{x.marker.map=null;sdk.event.clearInstanceListeners(x.marker);});markers.current=[];};
 },[mapped,state]);
 useEffect(()=>{
  markers.current.forEach(x=>{x.node.setAttribute("aria-pressed",String(x.id===selected));x.marker.zIndex=x.id===selected?100:1;});
  const p=mapped.find(x=>x.id===selected);if(p&&map.current)map.current.panTo({lat:p.lat!,lng:p.lng!});
 },[selected,mapped,state]);
 function summary(p:Project){const units=listings.filter(x=>p.listingIds.includes(x.id));const rents=units.map(x=>x.rent).filter((n):n is number=>n!==null&&n>0);return {units,rent:rents.length?Math.min(...rents):null};}
 const details=chosen?summary(chosen):null;
 return <section className="discovery" aria-label="ค้นหาห้องตามโครงการ" id="project-map">
  <div className="map-heading"><div><h2>Find a place. Follow an owl.</h2><p>หนึ่งโครงการ หนึ่งหมุด · แสดงเฉพาะตำแหน่งที่ตรวจสอบแล้ว</p></div><span>{mapped.length} โครงการมีพิกัด · {visible.length-mapped.length} รอตรวจสอบ</span></div>
  <div className="map-frame"><div ref={host} className="google-map" aria-label="Google Maps โครงการ"/>
   {state!=="ready"||!mapped.length?<div className="map-state" role="status"><img src="/markers/owl.svg" width="56" height="64" alt=""/><strong>{state==="loading"?"กำลังโหลดแผนที่…":state==="missing"?"แผนที่ยังไม่พร้อมใช้งาน":state==="error"?"โหลด Google Maps ไม่สำเร็จ":"ไม่พบโครงการที่มีพิกัดตามตัวกรอง"}</strong><p>{state==="loading"?"เลือกโครงการจากรายการด้านล่างได้ระหว่างรอ":"ยังค้นหาและเลือกโครงการจากรายการด้านล่างได้"}</p></div>:null}
  </div>
  {chosen&&details&&<aside className="project-summary" aria-label="ข้อมูลโครงการที่เลือก"><CoverImage key={chosen.id} src={images[details.units[0]?.id]} name={chosen.name} className="project-cover"/><div><small>{verified(chosen)?"ตรวจสอบตำแหน่งโครงการแล้ว":"ตำแหน่งรอตรวจสอบ · ยังไม่แสดงบนแผนที่"}</small><h3>{chosen.name}</h3><p>{chosen.address||chosen.area}</p><p>{details.units.length} รายการสถานะว่างในข้อมูลต้นทาง{details.rent!==null?" · ค่าเช่าเริ่ม ฿"+details.rent.toLocaleString("th-TH")+"/เดือน":""}</p><small>โปรดยืนยันสถานะและราคาก่อนนัดชม</small><button className="project-browse" onClick={()=>onBrowse(chosen.id)}>ดูห้องในโครงการนี้</button></div><button className="summary-close" aria-label="ปิดข้อมูลโครงการ" onClick={()=>onSelect("")}>×</button></aside>}
  <details className="project-directory" open={state!=="ready"}><summary>เลือกโครงการ ({visible.length})</summary><div className="project-options">{visible.map(p=><button key={p.id} aria-pressed={selected===p.id} onClick={()=>onSelect(p.id)}>{p.name}<small>{summary(p).units.length} รายการ · {verified(p)?"มีพิกัด":"รอตรวจพิกัด"}</small></button>)}</div></details>
  <style>{`.discovery{margin:28px 0 36px;min-width:0}.map-heading{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}.map-heading h2{font:400 clamp(26px,3vw,40px) Georgia,serif;margin:0}.map-heading p,.map-heading span{color:#696158;font-size:13px;line-height:1.6}.map-frame{position:relative;border-radius:18px;overflow:hidden;border:1px solid #dfd9ce;background:#eeeae2}.google-map{height:440px;width:100%}.map-state{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;background:#f1ede5;gap:10px}.map-state p{font-size:14px;margin:0;color:#706559}.owl-marker{display:flex;align-items:center;justify-content:center;min-width:52px;min-height:58px;padding:2px;border:2px solid transparent;border-radius:18px;background:transparent;cursor:pointer;filter:drop-shadow(0 3px 2px #0004)}.owl-marker[aria-pressed=true]{background:#f9dba6;border-color:#a51d28;transform:scale(1.12)}.owl-marker:focus-visible{outline:3px solid #a51d28}.project-summary{position:relative;margin-top:14px;background:white;border:1px solid #d9cdbf;border-radius:15px;padding:16px;display:grid;grid-template-columns:180px 1fr;gap:20px}.project-cover{height:160px;border-radius:9px;overflow:hidden}.project-summary h3{margin:7px 25px 10px 0;font-size:22px}.project-summary p{font-size:14px;line-height:1.6;margin:8px 0}.project-summary small{color:#776958}.project-browse{display:block;margin-top:12px;border:0;background:#a51d28;color:#fff;border-radius:24px;padding:13px 20px;cursor:pointer;min-height:44px}.summary-close{position:absolute;right:10px;top:8px;width:44px;height:44px;background:transparent;border:0;font-size:27px;cursor:pointer}.project-directory{margin-top:14px}.project-directory summary{cursor:pointer;padding:12px 0}.project-options{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;max-height:250px;overflow:auto;padding:4px}.project-options button{text-align:left;min-height:64px;border:1px solid #ddd1c5;background:#fff;border-radius:9px;padding:10px;cursor:pointer;overflow-wrap:anywhere}.project-options button[aria-pressed=true]{background:#fff0d8;border-color:#9b543c}.project-options small{display:block;color:#756e66;margin-top:5px}.reset-filters,.show-project{min-height:44px;padding:10px 15px;border:1px solid #a51d28;color:#8f222b;background:white;border-radius:22px;cursor:pointer}.filter-status{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.card.is-selected{outline:2px solid #b7844b;outline-offset:-2px}.show-project{margin:0 0 15px;font-size:12px}.project-cover .no-image{min-height:0!important}@media(max-width:560px){.google-map{height:320px}.project-summary{grid-template-columns:1fr;gap:12px}.project-cover{height:170px}.map-heading h2{font-size:28px}.project-summary h3{font-size:20px}}`}</style>
 </section>;
}
