"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";
export default function CoverImage({src,name,className,style,loading="lazy"}:{src?:string;name:string;className?:string;style?:CSSProperties;loading?:"lazy"|"eager"}){
 const [broken,setBroken]=useState(false);
 const imageRef=useRef<HTMLImageElement>(null);
 useEffect(()=>{const image=imageRef.current;if(image?.complete&&image.naturalWidth===0)setBroken(true);},[src]);
 return <div className={className} style={style}>{src&&!broken?<img ref={imageRef} src={src} alt={"ภาพปก "+name} loading={loading} onError={()=>setBroken(true)} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>:<div className="no-image" role="img" aria-label={"ภาพไม่พร้อมใช้งาน: "+name} style={{width:"100%",height:"100%",minHeight:180,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#e7ebe6",color:"#657169"}}><strong>PROPERTY EDIT</strong><small>ภาพไม่พร้อมใช้งาน</small></div>}</div>;
}
