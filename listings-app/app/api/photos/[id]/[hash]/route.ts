import {NextResponse} from "next/server";
import {privatePhoto} from "@/lib/private-images";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string;hash:string}>}){
 try{const {id,hash}=await params;const photo=await privatePhoto(id,hash);
 if(!photo)return new NextResponse(null,{status:404});
 return new Response(photo.stream,{headers:{"Content-Type":"image/webp","Cache-Control":"public,max-age=3600,s-maxage=3600","X-Content-Type-Options":"nosniff","Content-Disposition":"inline"}});
 }catch{return new NextResponse(null,{status:502});}
}
