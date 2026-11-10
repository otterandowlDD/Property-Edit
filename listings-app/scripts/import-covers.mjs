import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import sharp from 'sharp';import {get,put} from '@vercel/blob';
const source=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
const picks=JSON.parse(await fs.readFile(process.argv[3],'utf8'));
if(!source.websitePermission||source.publicRepositoryPermission!==false||source.evidence!=='PE-WEB-20261109-TER')throw Error('Website-only authorization required');
if(new Set(source.listings.map(x=>x.id)).size!==source.listings.length)throw Error('Duplicate listing IDs');
const prior=await get('manifests/listing-images-v2.json',{access:'private',useCache:false});
if(!prior||prior.statusCode!==200)throw Error('Previous private manifest required');
const previous=await new Response(prior.stream).json();
const archive='manifests/gallery-archive-20261110.json';
if(!await get(archive,{access:'private'}))await put(archive,JSON.stringify(previous),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
const manifest={version:2,storage:'private-blob',evidence:source.evidence,mode:'one-cover',importedAt:new Date().toISOString(),listings:{}};
const report={checked:0,covered:0,reused:0,newImports:0,failures:[],duplicates:[],croppedFromCollage:[]};
const hashes=new Map();
const crops={'94':{left:448,top:0,width:448,height:600},'107':{left:740,top:745,width:364,height:363},'128':{left:32,top:30,width:975,height:980}};
await fs.mkdir('/tmp/pe-private/covers',{recursive:true});
async function verify(path,expected){const r=await get(path,{access:'private',useCache:false});if(!r||r.statusCode!==200)throw Error('Private readback failed');const b=Buffer.from(await new Response(r.stream).arrayBuffer());if(expected&&!b.equals(expected))throw Error('Readback differs');await sharp(b,{failOn:'error'}).toBuffer();return b;}
async function run(l){
 try{
 const index=picks[l.id];const photo=l.photos[index];if(!photo)throw Error('No selected source photo');
 let entry,output;
 if(previous.listings[l.id]?.images.some(x=>x.driveFileId===photo.id)){
 const old=previous.listings[l.id];entry=old?.images.find(x=>x.driveFileId===photo.id);if(!entry)throw Error('Selected existing private image missing');
 output=await verify(entry.path);report.reused++;
 }else{
 let bytes;for(let attempt=0;attempt<3;attempt++){try{
 const r=await fetch('https://drive.google.com/uc?export=download&id='+encodeURIComponent(photo.id),{signal:AbortSignal.timeout(45000)});
 if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error('Drive HTTP '+r.status);
 bytes=Buffer.from(await r.arrayBuffer());break;
 }catch(e){if(attempt===2)throw e;}}
 if(!bytes||bytes.length>12000000)throw Error('Invalid image size');
 let image=sharp(bytes,{failOn:'error',limitInputPixels:60000000}).rotate();
 const meta=await image.metadata();if(!meta.width||!meta.height)throw Error('Cannot decode image');
 if(crops[l.id]){image=image.extract(crops[l.id]);report.croppedFromCollage.push(l.id);}
 output=await image.resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:84}).toBuffer();
 const hash=createHash('sha256').update(output).digest('hex');
 const path='images/rent/pe-sheet-'+l.id+'-'+hash+'.webp';
 await put(path,output,{access:'private',contentType:'image/webp',addRandomSuffix:false,allowOverwrite:false});
 await verify(path,output);
 entry={driveFileId:photo.id,path,sha256:hash,sourceSha256:createHash('sha256').update(bytes).digest('hex'),width:meta.width,height:meta.height};
 report.newImports++;
 }
 const exactHash=createHash('sha256').update(output).digest('hex');
 if(hashes.has(exactHash))report.duplicates.push({ids:[hashes.get(exactHash),l.id]});else hashes.set(exactHash,l.id);
 const {photos,...facts}=l;manifest.listings[l.id]={...facts,images:[entry],websitePermission:true,coverSourceIndex:index};
 await fs.writeFile('/tmp/pe-private/covers/'+l.id+'.webp',output);report.covered++;
 }catch(e){report.failures.push({id:l.id,error:String(e.message)});}
 report.checked++;await fs.writeFile('/tmp/pe-private/cover-progress.json',JSON.stringify(report));
}
let next=0;await Promise.all(Array.from({length:8},async()=>{while(next<source.listings.length)await run(source.listings[next++]);}));
await fs.writeFile('/tmp/pe-private/cover-manifest.json',JSON.stringify(manifest));
await fs.writeFile('/tmp/pe-private/cover-report.json',JSON.stringify(report,null,2));
if(report.covered){await put('manifests/listing-images-v2.json',JSON.stringify(manifest),{access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true,cacheControlMaxAge:60});}
console.log(JSON.stringify(report));
