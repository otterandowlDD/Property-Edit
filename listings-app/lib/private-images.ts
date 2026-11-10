import "server-only";
import {cache} from "react";
import {get} from "@vercel/blob";
import type {Listing} from "./data";
export type PrivatePhoto={driveFileId:string;path:string;sha256:string;width:number;height:number};
export type PrivateListing=Omit<Listing,"folder">&{folderId:string;images:PrivatePhoto[];websitePermission:boolean};
type Manifest={version:number;storage:string;evidence:string;listings:Record<string,PrivateListing>};
export const readPrivateManifest=cache(async():Promise<Manifest>=>{
 const empty={version:2,storage:"private-blob",evidence:"",listings:{}};
 if(!process.env.BLOB_READ_WRITE_TOKEN&&!process.env.BLOB_STORE_ID)return empty;
 try{
 const response=await get("manifests/listing-images-v2.json",{access:"private",useCache:false});
 if(!response||response.statusCode!==200)return empty;
 const value=await new Response(response.stream).json() as Manifest;
 if(value.version!==2||value.storage!=="private-blob"||value.evidence!=="PE-WEB-20261109-TER")return empty;
 return {...value,listings:Object.fromEntries(Object.entries(value.listings).filter(([id,l])=>/^\d+$/.test(id)&&l.id===id&&l.status==="ว่าง"&&l.websitePermission===true&&l.images.length>0))};
 }catch{console.error("Private listing image manifest unavailable");return empty;}
});
export function galleryPaths(listing:PrivateListing){return listing.images.filter(x=>/^[a-f0-9]{64}$/.test(x.sha256)&&x.path==="images/rent/pe-sheet-"+listing.id+"-"+x.sha256+".webp").slice(0,1).map(x=>"/api/photos/"+listing.id+"/"+x.sha256);}
export async function privatePhoto(id:string,hash:string){
 if(!/^\d+$/.test(id)||!/^[a-f0-9]{64}$/.test(hash))return null;
 const listing=(await readPrivateManifest()).listings[id];
 const photo=listing?.images.find(x=>x.sha256===hash&&x.path==="images/rent/pe-sheet-"+id+"-"+hash+".webp");
 if(!photo)return null;
 const response=await get(photo.path,{access:"private"});
 return response?.statusCode===200?response:null;
}
