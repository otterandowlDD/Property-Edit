import { google } from "googleapis";
export type Listing={id:string;status:string;folder:string;location:string;name:string;rent:number|null;sale:number|null;area:string;floor:string;bedrooms:string;posted:string};
const SID=process.env.GOOGLE_SHEET_ID||"1anVMS2cE4MsWxN3ez0jScycv1gbL77NPWV58L9bsISo";
function auth(){const secret=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;if(!secret)return null;const txt=secret.trim().startsWith("{")?secret:Buffer.from(secret,"base64").toString("utf8");return new google.auth.GoogleAuth({credentials:JSON.parse(txt),scopes:["https://www.googleapis.com/auth/spreadsheets.readonly","https://www.googleapis.com/auth/drive.readonly"]});}
export function folderId(url:string){return url.match(/\/folders\/([A-Za-z0-9_-]+)/)?.[1]||null;}
const amount=(s:string)=>{const n=Number((s||"").replaceAll(",",""));return Number.isFinite(n)&&n>0?n:null;};
export async function readListings():Promise<{items:Listing[];connected:boolean}>{
 const a=auth();if(!a)return {items:[],connected:false};
 const api=google.sheets({version:"v4",auth:a});
 const tab=(process.env.GOOGLE_SHEET_TAB||"Sheet1").replaceAll("'","''");
 const rows=(await api.spreadsheets.values.get({spreadsheetId:SID,range:"'"+tab+"'!A1:M1000"})).data.values||[];
 const items=rows.slice(1).filter(r=>/^\d+$/.test(String(r[0]||""))&&r[1]==="ว่าง"&&r[4]).map(r=>({id:String(r[0]),status:String(r[1]),folder:String(r[2]||""),location:String(r[3]||""),name:String(r[4]),rent:amount(String(r[5]||"")),sale:amount(String(r[6]||"")),area:String(r[7]||""),floor:String(r[8]||""),bedrooms:String(r[10]||""),posted:String(r[11]||"")}));
 return {items,connected:true};
}
export async function firstImage(folder:string){
 const a=auth();if(!a)return null;const api=google.drive({version:"v3",auth:a});
 const r=await api.files.list({q:"'"+folder+"' in parents and trashed=false and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/webp')",fields:"files(id,name)",pageSize:1,orderBy:"name",supportsAllDrives:true,includeItemsFromAllDrives:true});
 return r.data.files?.[0]?.id||null;
}
export async function imageBytes(id:string){
 const a=auth();if(!a)return null;const api=google.drive({version:"v3",auth:a});
 const metadata=await api.files.get({fileId:id,fields:"mimeType,size,parents",supportsAllDrives:true});
 if(!["image/jpeg","image/png","image/webp"].includes(metadata.data.mimeType||"")||Number(metadata.data.size)>12000000)return null;
 const {items}=await readListings();const allowed=new Set(items.map(x=>folderId(x.folder)).filter(Boolean));
 if(!metadata.data.parents?.some(p=>allowed.has(p)))return null;
 const data=await api.files.get({fileId:id,alt:"media",supportsAllDrives:true},{responseType:"arraybuffer"});
 return {bytes:Buffer.from(data.data as ArrayBuffer),mime:metadata.data.mimeType!};
}
