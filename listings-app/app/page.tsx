import {readListings} from "@/lib/data";import Browser from "./property-browser";export const dynamic="force-dynamic";
export default async function Page(){let items:Awaited<ReturnType<typeof readListings>>={items:[],connected:false};let error="";
try{items=await readListings()}catch(e){console.error("Listings unavailable",e);error="ไม่สามารถดึงข้อมูลจาก Google Sheets ได้ กรุณาตรวจสอบสิทธิ์บัญชีบริการ";}
return <Browser listings={items.items} warning={error||(!items.connected?"ยังไม่ได้เชื่อม Google Drive — ไม่แสดงรายการตัวอย่างเป็นห้องว่างจริง":"")} />;
}
