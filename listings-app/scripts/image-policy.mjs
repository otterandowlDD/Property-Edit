export function hasRights(approval,folderId){
 return Boolean(approval&&approval.folderId===folderId&&approval.website===true&&approval.publicRepository===true&&typeof approval.evidence==="string"&&approval.evidence.trim()&&typeof approval.approvedBy==="string"&&approval.approvedBy.trim()&&Number.isFinite(Date.parse(approval.approvedAt))&&Array.isArray(approval.fileIds)&&approval.fileIds.length&&approval.fileIds.every(x=>/^[A-Za-z0-9_-]{12,}$/.test(x)));
}
export function imageExtension(bytes,mime){
 if(mime==="image/jpeg"&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return "jpg";
 if(mime==="image/png"&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "png";
 if(mime==="image/webp"&&bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP")return "webp";
 throw new Error("Image signature does not match MIME type");
}
