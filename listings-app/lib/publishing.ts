export type ChannelStatus="published"|"needs_connection"|"failed"|"skipped";
export type PublishRecord={id:string;name:string;location:string;rent:number|null;sale:number|null;area:string;bedrooms:string;folder:string;caption:string;imageUrl:string|null;approvedAt:string;website:{status:ChannelStatus;url:string};facebook:{status:ChannelStatus;id?:string;error?:string};instagram:{status:ChannelStatus;id?:string;error?:string}};
const repo=process.env.PE_GITHUB_REPO||"otterandowlDD/Property-Edit";
const branch=process.env.PE_GITHUB_BRANCH||"feature/google-drive-live-listings-20261109";
const path="listings-app/content/published.json";
export function configured(){return !!(process.env.PE_GITHUB_TOKEN&&process.env.PE_ADMIN_TOKEN)}
export async function readRecords():Promise<{records:PublishRecord[];sha:string|null}>{
 const token=process.env.PE_GITHUB_TOKEN;if(!token)return {records:[],sha:null};
 const res=await fetch("https://api.github.com/repos/"+repo+"/contents/"+path+"?ref="+encodeURIComponent(branch),{headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},cache:"no-store"});
 if(res.status===404)return {records:[],sha:null};
 if(!res.ok)throw new Error("GitHub storage read failed: "+res.status);
 const data=await res.json();const raw=Buffer.from(String(data.content).replace(/\s/g,""),"base64").toString("utf8");
 const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error("Invalid published data");
 return {records:parsed,sha:data.sha as string};
}
export async function saveRecords(records:PublishRecord[],sha:string|null){
 const token=process.env.PE_GITHUB_TOKEN;if(!token)throw new Error("GitHub token missing");
 const url="https://api.github.com/repos/"+repo+"/contents/"+path;
 const body:any={message:"Publish Property Edit listing via agent",branch,content:Buffer.from(JSON.stringify(records,null,2)+"\n").toString("base64")};if(sha)body.sha=sha;
 const res=await fetch(url,{method:"PUT",headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},body:JSON.stringify(body)});
 if(!res.ok)throw new Error("GitHub storage write failed: "+res.status);
 return await res.json();
}
