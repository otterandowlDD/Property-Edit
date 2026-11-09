import {importedImage} from "@/lib/listing-images";
import {NextResponse} from "next/server";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){
 const {id}=await context.params;
 const path=/^[A-Za-z0-9_-]{12,}$/.test(id)?importedImage(id):null;
 return path?NextResponse.redirect(new URL(path,request.url),302):new NextResponse(null,{status:404});
}
