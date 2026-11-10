// Run from listings-app. No sharing changes, social calls, Git pushes or deletes.
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {google} from "googleapis";
import {hasRights,imageExtension} from "./image-policy.mjs";
const app=fileURLToPath(new URL("../",import.meta.url)),root=path.resolve(app,"..");
const json=async p=>JSON.parse(await readFile(path.join(app,p),"utf8"));
const dry=process.argv.includes("--dry-run");
const limitArg=process.argv.find(x=>x.startsWith("--limit="));
const limit=limitArg?Number(limitArg.split("=")[1]):Infinity;
if(!(limit>0))throw Error("Invalid limit");
const approvals=(await json("content/image-approvals.json")).approvals;
const secret=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if(!secret)throw Error("GOOGLE_SERVICE_ACCOUNT_JSON required; no photos imported");
const credentials=JSON.parse(secret.trim().startsWith("{")?secret:Buffer.from(secret,"base64").toString());
const auth=new google.auth.GoogleAuth({credentials,scopes:["https://www.googleapis.com/auth/drive.readonly","https://www.googleapis.com/auth/spreadsheets.readonly"]});
const drive=google.drive({version:"v3",auth}),sheets=google.sheets({version:"v4",auth});
const rows=(await sheets.spreadsheets.values.get({spreadsheetId:process.env.GOOGLE_SHEET_ID||"1anVMS2cE4MsWxN3ez0jScycv1gbL77NPWV58L9bsISo",range:"'Sheet1'!A1:M1000"})).data.values||[];
const available=rows.slice(1).filter(r=>/^\d+$/.test(String(r[0]))&&String(r[1]).trim()==="ว่าง"&&r[4]);
const ids=available.map(r=>String(r[0]));if(new Set(ids).size!==ids.length)throw Error("Duplicate listing IDs; import stopped");
const report={checked:available.length,importedImages:0,mappedListings:0,blocked:[],sampleLimit:Number.isFinite(limit)?limit:null,dryRun:dry};
const manifest={version:1,listings:{}};
let processed=0;
for(const row of available){
 const id=String(row[0]),folder=String(row[2]||"").match(/\/folders\/([A-Za-z0-9_-]+)/)?.[1];
 const approval=approvals.find(a=>a.listingId===id);
 if(!folder||!hasRights(approval,folder)){report.blocked.push({id,reason:"publication_rights_unverified"});continue;}
 if(processed>=limit){report.blocked.push({id,reason:"sample_limit"});continue;}processed++;
 try{
 let files=[],pageToken;
 do{const res=await drive.files.list({q:"'"+folder+"' in parents and trashed=false",fields:"nextPageToken,files(id,name,mimeType,size)",pageSize:100,pageToken,supportsAllDrives:true,includeItemsFromAllDrives:true});files.push(...res.data.files||[]);pageToken=res.data.nextPageToken||undefined;}while(pageToken);
 const selected=files.filter(f=>approval.fileIds.includes(f.id)).sort((a,b)=>a.id.localeCompare(b.id));
 if(selected.length!==approval.fileIds.length)throw Error("Approved files missing from source folder");
 const photos=[];
 for(const f of selected){
 if(!["image/jpeg","image/png","image/webp"].includes(f.mimeType)||Number(f.size)>12000000)throw Error("Unsupported/oversized image");
 const res=await drive.files.get({fileId:f.id,alt:"media",supportsAllDrives:true},{responseType:"arraybuffer"});
 const bytes=Buffer.from(res.data),ext=imageExtension(bytes,f.mimeType),hash=createHash("sha256").update(bytes).digest("hex");
 const name="pe-sheet-"+id+"-"+f.id+"-"+hash+"."+ext,relative="/images/rent/"+name;
 if(!dry)for(const dir of [path.join(root,"images/rent"),path.join(app,"public/images/rent")]){
 await mkdir(dir,{recursive:true});const target=path.join(dir,name);
 try{await writeFile(target,bytes,{flag:"wx"});}catch(e){if(e.code!=="EEXIST")throw e;const existing=await readFile(target);if(!existing.equals(bytes))throw Error("Collision: existing image preserved");}
 }
 photos.push({driveFileId:f.id,path:relative,sha256:hash});
 }
 if(photos.length){manifest.listings[id]={folderId:folder,images:photos,rightsEvidence:approval.evidence,approvedAt:approval.approvedAt};report.importedImages+=dry?0:photos.length;report.mappedListings++;}
 }catch(e){report.blocked.push({id,reason:String(e.message)});}
}
if(!dry)await writeFile(path.join(app,"content/image-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
