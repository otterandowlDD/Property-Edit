import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {put,get} from '@vercel/blob';
import sharp from 'sharp';
const source=JSON.parse(await readFile(process.argv[2],'utf8'));
if(source.websitePermission!==true||source.publicRepositoryPermission!==false||source.evidence!=='PE-WEB-20261109-TER')throw Error('Website-only permission required');
if(new Set(source.listings.map(x=>x.id)).size!==source.listings.length)throw Error('Duplicate IDs');
const limit=Number(process.env.PE_IMPORT_LIMIT)||source.listings.length;
const manifest={version:2,storage:'private-blob',evidence:source.evidence,importedAt:new Date().toISOString(),listings:{}};
const report={images:0,listings:0,duplicates:[],crossListingDuplicates:[],failures:[],checked:0};
const allHashes=new Map();
await mkdir('/tmp/pe-private/imported',{recursive:true});
async function download(photo){
 const response=await fetch('https://drive.google.com/uc?export=download&id='+encodeURIComponent(photo.id),{signal:AbortSignal.timeout(45000)});
 if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Drive HTTP '+response.status);
 const data=Buffer.from(await response.arrayBuffer());if(data.length>12000000)throw Error('Image exceeds 12MB');
 return data;
}
async function runListing(l){
 const images=[],hashes=new Set();
 for(const p of l.photos){
  try{
   const bytes=await download(p);const originalHash=createHash('sha256').update(bytes).digest('hex');
   const metadata=await sharp(bytes,{failOn:'error',limitInputPixels:60000000}).metadata();
   if(!metadata.width||!metadata.height||!['jpeg','png','webp'].includes(metadata.format))throw Error('Invalid image');
   if(hashes.has(originalHash)){report.duplicates.push({listing:l.id,fileId:p.id});continue;}
   hashes.add(originalHash);
   if(allHashes.has(originalHash)&&allHashes.get(originalHash)!==l.id)report.crossListingDuplicates.push({listings:[allHashes.get(originalHash),l.id],fileId:p.id});
   else allHashes.set(originalHash,l.id);
   const output=await sharp(bytes,{failOn:'error'}).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer();
   const hash=createHash('sha256').update(output).digest('hex');
   const pathname='images/rent/pe-sheet-'+l.id+'-'+hash+'.webp';
   await put(pathname,output,{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'image/webp'});
   const back=await get(pathname,{access:'private',useCache:false});
   if(!back||back.statusCode!==200)throw Error('Private readback failed');
   const actual=Buffer.from(await new Response(back.stream).arrayBuffer());
   if(!actual.equals(output))throw Error('Private readback mismatch');
   await writeFile('/tmp/pe-private/imported/'+l.id+'-'+images.length+'.webp',output);
   images.push({driveFileId:p.id,path:pathname,sha256:hash,sourceSha256:originalHash,width:metadata.width,height:metadata.height});
   report.images++;
  }catch(e){report.failures.push({listing:l.id,fileId:p.id,error:String(e.message)});}
  report.checked++;
 }
 const {photos,...property}=l;
 if(images.length){manifest.listings[l.id]={...property,images,websitePermission:true};report.listings++;}
 await writeFile('/tmp/pe-private/progress.json',JSON.stringify(report));
}
const queue=source.listings.slice(0,limit);let next=0;
await Promise.all(Array.from({length:6},async()=>{while(next<queue.length){const l=queue[next++];await runListing(l);}}));
await writeFile('/tmp/pe-private/manifest.json',JSON.stringify(manifest));
await writeFile('/tmp/pe-private/report.json',JSON.stringify(report,null,2));
await put('manifests/listing-images-v2.json',JSON.stringify(manifest),{access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true,cacheControlMaxAge:60});
console.log(JSON.stringify(report));
