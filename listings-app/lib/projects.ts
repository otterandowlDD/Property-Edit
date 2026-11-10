import directory from "../content/projects.json";
import type {Listing} from "./data";
export type Project={id:string;name:string;aliases:string[];listingIds:string[];area:string;status:string;confidence:string;lat:number|null;lng:number|null;address:string;sources:string[];verifiedAt:string|null;reviewReason:string};
export const projects=directory.projects as Project[];
export const listingProject=new Map(projects.flatMap(p=>p.listingIds.map(id=>[id,p.id] as const)));
export function verified(p:Project){return p.status==="verified"&&p.confidence==="high"&&typeof p.lat==="number"&&typeof p.lng==="number"&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180&&p.sources.length>0;}
export function projectFor(id:string){return projects.find(p=>p.id===listingProject.get(id));}
export function searchText(value:string){return value.normalize("NFKC").toLocaleLowerCase().replace(/[\s‘’'–—-]+/g,"");}
export function matchesSearch(l:Listing,query:string){const p=projectFor(l.id);return searchText([l.name,l.location,p?.name,...(p?.aliases||[]),p?.address].join(" ")).includes(searchText(query.trim()));}
export function visibleProjects(items:Listing[]){const ids=new Set(items.filter(l=>l.status==="ว่าง").map(l=>l.id));return projects.filter(p=>p.listingIds.some(id=>ids.has(id)));}
