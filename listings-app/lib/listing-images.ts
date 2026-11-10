import {readPrivateManifest,galleryPaths} from "./private-images";
import manifest from "@/content/image-manifest.json";
import approvals from "@/content/image-approvals.json";
type Photo={driveFileId:string;path:string;sha256:string};
type Entry={folderId:string;images:Photo[];rightsEvidence:string;approvedAt:string};
type Approval={listingId:string;folderId:string;website:boolean;publicRepository:boolean;evidence:string;approvedBy:string;approvedAt:string;fileIds:string[]};
const entries=manifest.listings as Record<string,Entry>;
const rights=approvals.approvals as Approval[];
function approvedPhotos(id:string):Photo[]{
 const entry=entries[id];if(!entry)return [];
 const a=rights.find(x=>x.listingId===id&&x.folderId===entry.folderId&&x.website===true&&x.publicRepository===true&&x.evidence.trim()&&x.approvedBy.trim()&&Number.isFinite(Date.parse(x.approvedAt)));
 if(!a)return [];
 return entry.images.filter(x=>a.fileIds.includes(x.driveFileId)&&/^\/images\/rent\/pe-sheet-[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(x.path));
}
export async function listingImages(id:string):Promise<string[]>{const l=(await readPrivateManifest()).listings[id];return l?galleryPaths(l):approvedPhotos(id).map(x=>x.path);}
export function importedImage(id:string){for(const listingId of Object.keys(entries)){const image=approvedPhotos(listingId).find(x=>x.driveFileId===id);if(image)return image.path;}return null;}
