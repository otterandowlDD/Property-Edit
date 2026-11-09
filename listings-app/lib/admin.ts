import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
export function authorized(req:Request){
 const expected=process.env.PE_ADMIN_TOKEN;
 const provided=req.headers.get("x-pe-admin-token")||"";
 if(!expected||!provided)return false;
 const a=Buffer.from(expected),b=Buffer.from(provided);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export function forbidden(){return NextResponse.json({error:"Unauthorized or admin token not configured"},{status:401,headers:{"Cache-Control":"no-store"}});}
