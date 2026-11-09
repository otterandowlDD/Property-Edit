import {readListings,folderId,firstImage} from "@/lib/data";import {NextResponse} from "next/server";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){
 const {id}=await context.params;if(!/^\d{1,8}$/.test(id))return new NextResponse(null,{status:404});
 try{const {items}=await readListings();const listing=items.find(x=>x.id===id);const folder=listing&&folderId(listing.folder);if(!folder)return new NextResponse(null,{status:404});
 const image=await firstImage(folder);if(!image)return new NextResponse(null,{status:404});
 return NextResponse.redirect(new URL("/api/image/"+image,_request.url),302);
 }catch(e){console.error("Cover unavailable",e);return new NextResponse(null,{status:404});}
}
