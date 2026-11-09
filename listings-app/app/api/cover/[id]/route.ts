import {listingImages} from "@/lib/listing-images";
import {NextResponse} from "next/server";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){
 const {id}=await context.params;
 const path=/^\d{1,8}$/.test(id)?listingImages(id)[0]:null;
 return path?NextResponse.redirect(new URL(path,request.url),302):new NextResponse(null,{status:404});
}
