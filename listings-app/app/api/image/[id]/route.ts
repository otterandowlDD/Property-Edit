import {imageBytes} from "@/lib/data";import {NextResponse} from "next/server";export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){
 const {id}=await context.params;if(!/^[A-Za-z0-9_-]{12,}$/.test(id))return new NextResponse(null,{status:404});
 try{const result=await imageBytes(id);if(!result)return new NextResponse(null,{status:404});
 return new NextResponse(new Uint8Array(result.bytes),{headers:{"Content-Type":result.mime,"Cache-Control":"public,max-age=300,s-maxage=300","X-Content-Type-Options":"nosniff"}})
 }catch(e){console.error("Image unavailable",e);return new NextResponse(null,{status:404});}
}
